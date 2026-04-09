/* eslint-disable */
// @ts-nocheck
/**
 * Multi-provider chat proxy.
 *
 * Primary provider: Cohere v2 (`command-r-08-2024`) — native citations via the
 *   `documents` parameter. SSE events are translated to OpenAI-compatible
 *   frames so the frontend can reuse its existing SSE parser.
 *
 * Fallback provider: Qwen2.5-14B-Instruct-1M via HuggingFace router — used
 *   when Cohere is rate-limited (429) or the input exceeds Cohere's 128k
 *   context window (pre-checked by token estimate, plus post-hoc detection
 *   of context-overflow error responses).
 *
 * Fallback is pre-flight only. Once Cohere starts streaming bytes back, we
 * do NOT switch mid-stream — partial output is preserved and errors surface.
 *
 * Fallback visibility is console-log only; the frontend sees a single SSE
 * stream regardless of which provider served it.
 */
import type { Config, Context } from "@netlify/edge-functions";

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8888",
    "https://masterprompted.lovable.app",
    "https://prompted-app.eipcm.org",
];

const getCorsHeaders = (origin: string | null) => ({
    "Access-Control-Allow-Origin": (origin && ALLOWED_ORIGINS.includes(origin))
        ? origin
        : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CohereDocument {
    id: string;
    data: { title: string; text: string };
}

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface RequestBody {
    model?: string;
    provider?: "cohere" | "hf";
    messages: ChatMessage[];
    documents?: CohereDocument[];
    temperature?: number;
    stream?: boolean;
    thinking?: unknown;
}

// ---------------------------------------------------------------------------
// Token estimation & provider detection
// ---------------------------------------------------------------------------

const CHARS_PER_TOKEN = 3.5;
const COHERE_CTX_LIMIT = 128_000;
const OUTPUT_RESERVE = 2_048;
const SAFETY_HEADROOM = 4_000;
const MAX_COHERE_INPUT_TOKENS = COHERE_CTX_LIMIT - OUTPUT_RESERVE - SAFETY_HEADROOM;

function estimateTokens(messages: ChatMessage[], documents?: CohereDocument[]): number {
    const msgChars = messages.reduce((acc, m) => acc + (m.content?.length ?? 0), 0);
    const docChars = (documents ?? []).reduce(
        (acc, d) => acc + (d.data?.title?.length ?? 0) + (d.data?.text?.length ?? 0),
        0,
    );
    return Math.ceil((msgChars + docChars) / CHARS_PER_TOKEN);
}

function detectProvider(body: RequestBody): "cohere" | "hf" {
    if (body.provider === "cohere" || body.provider === "hf") return body.provider;
    if (typeof body.model === "string" && body.model.startsWith("command-")) return "cohere";
    return "hf";
}

// ---------------------------------------------------------------------------
// Cohere call
// ---------------------------------------------------------------------------

const COHERE_URL = "https://api.cohere.com/v2/chat";
const COHERE_MODEL = "command-r-08-2024";

async function callCohere(body: RequestBody, apiKey: string): Promise<Response> {
    const payload: Record<string, unknown> = {
        model: COHERE_MODEL,
        messages: body.messages,
        temperature: body.temperature ?? 0.3,
        stream: !!body.stream,
        citation_options: { mode: "ACCURATE" },
        max_tokens: 2048,
    };
    if (body.documents?.length) payload.documents = body.documents;
    if (body.thinking) payload.thinking = body.thinking;

    return fetch(COHERE_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(payload),
    });
}

/** Detects whether a Cohere error body indicates a context-overflow condition. */
function isContextOverflowError(status: number, errorBody: string): boolean {
    if (status !== 400 && status !== 413 && status !== 422) return false;
    return /context|too (long|large)|tokens? (exceed|limit)/i.test(errorBody);
}

// ---------------------------------------------------------------------------
// Cohere → OpenAI SSE translation
// ---------------------------------------------------------------------------

/**
 * Translate Cohere v2 native SSE events into OpenAI-compatible SSE frames.
 *
 * Cohere emits `content-delta` for text chunks, then `citation-start` events
 * whose `sources` reference documents by id. We map each unique source id to
 * a stable `[N]` marker and emit a synthetic content delta when the citation
 * arrives — so users see `[1]`, `[2]` appear shortly after the cited span.
 *
 * At `message-end`, we synthesize a trailing `## References` list from the
 * original `documents` array, keyed by the id→N mapping. If no citations
 * were emitted, nothing is appended.
 */
function translateCohereSSE(
    upstream: ReadableStream<Uint8Array>,
    documents: CohereDocument[] | undefined,
): ReadableStream<Uint8Array> {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buf = "";
    const docNumber = new Map<string, number>();
    let nextN = 1;

    const emitContent = (controller: TransformStreamDefaultController, content: string) => {
        const frame = {
            choices: [{ index: 0, delta: { content }, finish_reason: null }],
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(frame)}\n\n`));
    };

    const emitDone = (controller: TransformStreamDefaultController) => {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    };

    const buildReferencesTail = (): string => {
        if (docNumber.size === 0 || !documents) return "";
        const lines = [...docNumber.entries()]
            .sort((a, b) => a[1] - b[1])
            .map(([id, n]) => {
                const doc = documents.find((d) => d.id === id);
                return `[${n}] ${doc?.data?.title ?? id}`;
            });
        return `\n\n## References\n${lines.join("\n")}\n`;
    };

    const handleEvent = (evt: any, controller: TransformStreamDefaultController) => {
        if (evt.type === "content-delta") {
            const text = evt.delta?.message?.content?.text ?? "";
            if (text) emitContent(controller, text);
            return;
        }
        if (evt.type === "citation-start") {
            // Per Cohere OpenAPI: delta.message.citations is a single Citation
            // object whose `sources` is an array of ChatDocumentSource | ChatToolSource.
            // For ChatDocumentSource the request-supplied doc id is at `s.id`.
            const sources = evt.delta?.message?.citations?.sources ?? [];
            const markers = sources
                .map((s: any) => {
                    const id = s.id ?? s.document?.id;
                    if (!id) return "";
                    if (!docNumber.has(id)) docNumber.set(id, nextN++);
                    return `[${docNumber.get(id)}]`;
                })
                .filter(Boolean)
                .join("");
            if (markers) emitContent(controller, markers);
            return;
        }
        if (evt.type === "message-end") {
            const tail = buildReferencesTail();
            if (tail) emitContent(controller, tail);
            emitDone(controller);
        }
    };

    return upstream.pipeThrough(
        new TransformStream({
            transform(chunk, controller) {
                buf += decoder.decode(chunk, { stream: true });
                const frames = buf.split("\n\n");
                buf = frames.pop() ?? "";
                for (const frame of frames) {
                    const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
                    if (!dataLine) continue;
                    const json = dataLine.slice(5).trim();
                    if (!json || json === "[DONE]") continue;
                    try {
                        handleEvent(JSON.parse(json), controller);
                    } catch {
                        // ignore malformed frame
                    }
                }
            },
            flush(controller) {
                emitDone(controller);
            },
        }),
    );
}

// ---------------------------------------------------------------------------
// HuggingFace / Qwen fallback
// ---------------------------------------------------------------------------

const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const QWEN_FALLBACK_MODEL = "Qwen/Qwen2.5-14B-Instruct-1M:featherless-ai";

/**
 * Inject the Cohere-format documents array into the system message as a
 * numbered list, and instruct the model to use `[1]`, `[2]` style citations
 * matching Cohere's output format.
 */
function injectDocumentsIntoMessages(
    messages: ChatMessage[],
    documents: CohereDocument[] | undefined,
): ChatMessage[] {
    if (!documents?.length) return messages;

    const docsBlock = documents
        .map((d, i) => `[${i + 1}] ${d.data.title}\n${d.data.text}`)
        .join("\n\n");
    const instruction =
        `\n\n## Reference Documents\nWhen answering, cite sources using [1], [2], etc. matching the document numbers below. ` +
        `End your answer with a "## References" section listing each cited doc.\n\n${docsBlock}`;

    const result = [...messages];
    const sysIdx = result.findIndex((m) => m.role === "system");
    if (sysIdx >= 0) {
        result[sysIdx] = { ...result[sysIdx], content: result[sysIdx].content + instruction };
    } else {
        result.unshift({ role: "system", content: instruction.trim() });
    }
    return result;
}

async function callQwenFallback(body: RequestBody, hfToken: string): Promise<Response> {
    const messages = injectDocumentsIntoMessages(body.messages, body.documents);
    return fetch(HF_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: QWEN_FALLBACK_MODEL,
            messages,
            temperature: body.temperature ?? 0.3,
            max_tokens: 2048,
            stream: !!body.stream,
        }),
    });
}

// ---------------------------------------------------------------------------
// Generic HuggingFace pass-through (non-Cohere models)
// ---------------------------------------------------------------------------

async function callHuggingFace(body: RequestBody, hfToken: string): Promise<Response> {
    const selectedModel = body.model ?? "meta-llama/Llama-3.1-8B-Instruct:ovhcloud";
    const payload: Record<string, unknown> = {
        model: selectedModel,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: 2048,
        stream: !!body.stream,
    };
    if (body.thinking) payload.thinking = body.thinking;

    return fetch(HF_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}

// ---------------------------------------------------------------------------
// Response builders
// ---------------------------------------------------------------------------

function jsonError(origin: string | null, status: number, message: string): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
}

function streamResponse(origin: string | null, body: ReadableStream<Uint8Array>): Response {
    return new Response(body, {
        headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}

// ---------------------------------------------------------------------------
// Provider dispatch
// ---------------------------------------------------------------------------

/**
 * Attempt the Cohere path; return null if the caller should fall back to Qwen.
 * Returns a Response directly when Cohere succeeds OR when the error is not
 * a fallback trigger (in which case the error is surfaced to the client).
 */
async function tryCohere(
    body: RequestBody,
    origin: string | null,
): Promise<Response | { fallback: true; reason: string }> {
    const apiKey = Deno.env.get("COHERE_API_KEY");
    if (!apiKey) return { fallback: true, reason: "no-cohere-key" };

    // Pre-flight context-overflow guard
    const estimated = estimateTokens(body.messages, body.documents);
    if (estimated > MAX_COHERE_INPUT_TOKENS) {
        console.log(`[EDGE_INFO] fallback=qwen reason=ctx-precheck tokens=${estimated}`);
        return { fallback: true, reason: "ctx-precheck" };
    }

    const cohereResponse = await callCohere(body, apiKey);

    if (cohereResponse.status === 429) {
        const retryAfter = cohereResponse.headers.get("Retry-After");
        console.log(`[EDGE_INFO] fallback=qwen reason=cohere-429 retry-after=${retryAfter ?? "none"}`);
        return { fallback: true, reason: "cohere-429" };
    }

    if (!cohereResponse.ok) {
        const errorText = await cohereResponse.text();
        if (isContextOverflowError(cohereResponse.status, errorText)) {
            console.log(`[EDGE_INFO] fallback=qwen reason=cohere-ctx-posthoc status=${cohereResponse.status}`);
            return { fallback: true, reason: "cohere-ctx-posthoc" };
        }
        console.error(`[EDGE_ERROR] Cohere ${cohereResponse.status}: ${errorText}`);
        return jsonError(origin, cohereResponse.status, `Cohere error: ${errorText}`);
    }

    console.log(`[EDGE_INFO] provider=cohere model=${COHERE_MODEL} tokens=${estimated}`);

    if (body.stream) {
        const translated = translateCohereSSE(cohereResponse.body!, body.documents);
        return streamResponse(origin, translated);
    }

    // Non-streaming: forward JSON verbatim. Frontend does not currently use
    // this branch; if needed later we can collapse citations into the text.
    const json = await cohereResponse.json();
    return new Response(JSON.stringify(json), {
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
}

async function serveQwenFallback(body: RequestBody, origin: string | null): Promise<Response> {
    const hfToken = Deno.env.get("HF_TOKEN");
    if (!hfToken) return jsonError(origin, 500, "Missing HF_TOKEN for fallback");

    const qwenResponse = await callQwenFallback(body, hfToken);
    if (!qwenResponse.ok) {
        const errorText = await qwenResponse.text();
        console.error(`[EDGE_ERROR] Qwen fallback ${qwenResponse.status}: ${errorText}`);
        return jsonError(origin, qwenResponse.status, `Fallback error: ${errorText}`);
    }

    console.log(`[EDGE_INFO] provider=qwen model=${QWEN_FALLBACK_MODEL}`);

    if (body.stream) {
        return streamResponse(origin, qwenResponse.body!);
    }
    const json = await qwenResponse.json();
    return new Response(JSON.stringify(json), {
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
}

async function serveHuggingFace(body: RequestBody, origin: string | null): Promise<Response> {
    const hfToken = Deno.env.get("HF_TOKEN");
    if (!hfToken) return jsonError(origin, 500, "Missing HF_TOKEN");

    const hfResponse = await callHuggingFace(body, hfToken);
    if (!hfResponse.ok) {
        const errorText = await hfResponse.text();
        console.error(`[EDGE_ERROR] HF ${hfResponse.status}: ${errorText}`);
        return jsonError(origin, hfResponse.status, `Upstream Error: ${errorText}`);
    }

    console.log(`[EDGE_INFO] provider=hf model=${body.model}`);

    if (body.stream) {
        return streamResponse(origin, hfResponse.body!);
    }
    const json = await hfResponse.json();
    return new Response(JSON.stringify(json), {
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export default async (request: Request, _context: Context) => {
    const origin = request.headers.get("origin");

    // Build ID lets us confirm in logs which deploy is actually serving the request.
    const BUILD_ID = "chat-v2-multiprovider-2025-04-09";
    console.log(`[EDGE] ${request.method} /api/chat build=${BUILD_ID} origin=${origin ?? "null"}`);

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: getCorsHeaders(origin) });
    }

    try {
        const body: RequestBody = await request.json();

        // Payload size verification (6MB limit)
        const payloadSize = new Blob([JSON.stringify(body)]).size;
        if (payloadSize > 6 * 1024 * 1024) {
            return jsonError(origin, 413, "Payload size exceeds 6MB limit");
        }

        if (!body.messages || !Array.isArray(body.messages)) {
            return jsonError(origin, 400, "messages array is required");
        }

        const provider = detectProvider(body);
        const hasCohereKey = !!Deno.env.get("COHERE_API_KEY");
        const hasHfToken = !!Deno.env.get("HF_TOKEN");
        console.log(
            `[EDGE] dispatch provider=${provider} requestedModel=${body.model ?? "<none>"} ` +
            `requestedProvider=${body.provider ?? "<none>"} ` +
            `documents=${body.documents?.length ?? 0} messages=${body.messages.length} ` +
            `stream=${!!body.stream} env.COHERE_API_KEY=${hasCohereKey} env.HF_TOKEN=${hasHfToken}`,
        );

        if (provider === "cohere") {
            const result = await tryCohere(body, origin);
            if (result instanceof Response) return result;
            console.log(`[EDGE] cohere->qwen fallback reason=${result.reason}`);
            return serveQwenFallback(body, origin);
        }

        return serveHuggingFace(body, origin);
    } catch (err) {
        console.error("[EDGE_ERROR]:", err);
        return jsonError(origin, 500, "Edge Function Crash");
    }
};

export const config: Config = { path: "/api/chat" };
