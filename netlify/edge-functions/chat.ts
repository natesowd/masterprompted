/* eslint-disable */
// @ts-nocheck
/**
 * HuggingFace chat proxy.
 *
 * All requests are routed through the HuggingFace router (OpenAI-compatible).
 * When documents are provided, they are injected into the system message as
 * numbered references so the model can ground its answers and cite them using
 * [1], [2], etc.  The grounding system prompt from the frontend handles the
 * citation style instructions.
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

interface Document {
    id: string;
    data: { title: string; text: string };
}

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface RequestBody {
    model?: string;
    messages: ChatMessage[];
    documents?: Document[];
    temperature?: number;
    stream?: boolean;
}

// ---------------------------------------------------------------------------
// Document injection
// ---------------------------------------------------------------------------

const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/Llama-3.3-70B-Instruct:ovhcloud";

/**
 * Inject documents into the system message as a numbered list so the model
 * can reference them with [1], [2] style citations.
 */
function injectDocumentsIntoMessages(
    messages: ChatMessage[],
    documents: Document[] | undefined,
): ChatMessage[] {
    if (!documents?.length) return messages;

    const docsBlock = documents
        .map((d, i) => `[${i + 1}] ${d.data.title}\n${d.data.text}`)
        .join("\n\n");
    const instruction =
        `\n\n## Reference Documents\n` +
        `Cite sources using [1], [2], etc. matching the document numbers below. ` +
        `End your answer with a "## References" section listing each cited document.\n\n${docsBlock}`;

    const result = [...messages];
    const sysIdx = result.findIndex((m) => m.role === "system");
    if (sysIdx >= 0) {
        result[sysIdx] = { ...result[sysIdx], content: result[sysIdx].content + instruction };
    } else {
        result.unshift({ role: "system", content: instruction.trim() });
    }
    return result;
}

// ---------------------------------------------------------------------------
// HuggingFace call
// ---------------------------------------------------------------------------

async function callHuggingFace(
    body: RequestBody,
    hfToken: string,
): Promise<Response> {
    const messages = injectDocumentsIntoMessages(body.messages, body.documents);
    const model = body.model ?? DEFAULT_MODEL;

    return fetch(HF_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: body.temperature ?? 0.7,
            max_tokens: 2048,
            stream: !!body.stream,
        }),
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
// Entry point
// ---------------------------------------------------------------------------

export default async (request: Request, _context: Context) => {
    const origin = request.headers.get("origin");

    const BUILD_ID = "chat-v3-hf-only-2025-04-10";
    console.log(`[EDGE] ${request.method} /api/chat build=${BUILD_ID} origin=${origin ?? "null"}`);

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: getCorsHeaders(origin) });
    }

    try {
        const body: RequestBody = await request.json();

        // Payload size guard (6MB limit)
        const payloadSize = new Blob([JSON.stringify(body)]).size;
        if (payloadSize > 6 * 1024 * 1024) {
            return jsonError(origin, 413, "Payload size exceeds 6MB limit");
        }

        if (!body.messages || !Array.isArray(body.messages)) {
            return jsonError(origin, 400, "messages array is required");
        }

        const hfToken = Deno.env.get("HF_TOKEN");
        if (!hfToken) return jsonError(origin, 500, "Missing HF_TOKEN");

        const model = body.model ?? DEFAULT_MODEL;
        console.log(
            `[EDGE] dispatch model=${model} ` +
            `documents=${body.documents?.length ?? 0} messages=${body.messages.length} ` +
            `stream=${!!body.stream}`,
        );

        const hfResponse = await callHuggingFace(body, hfToken);

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error(`[EDGE_ERROR] HF ${hfResponse.status}: ${errorText}`);
            return jsonError(origin, hfResponse.status, `Upstream Error: ${errorText}`);
        }

        console.log(`[EDGE_INFO] provider=hf model=${model}`);

        if (body.stream) {
            return streamResponse(origin, hfResponse.body!);
        }

        const json = await hfResponse.json();
        return new Response(JSON.stringify(json), {
            headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[EDGE_ERROR]:", err);
        return jsonError(origin, 500, "Edge Function Crash");
    }
};

export const config: Config = { path: "/api/chat" };
