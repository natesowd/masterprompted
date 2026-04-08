/* eslint-disable */
// @ts-nocheck
import type { Config, Context } from "@netlify/edge-functions";

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

export default async (request: Request, _context: Context) => {
    const origin = request.headers.get("origin");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: getCorsHeaders(origin),
        });
    }

    if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
            status: 405,
            headers: getCorsHeaders(origin),
        });
    }

    try {
        const bodyContent = await request.json();
        const { messages, model, temperature, stream, thinking } = bodyContent;

        // Payload size verification (6MB limit)
        const payloadSize = new Blob([JSON.stringify(bodyContent)]).size;
        if (payloadSize > 6 * 1024 * 1024) {
            return new Response(JSON.stringify({ error: "Payload size exceeds 6MB limit" }), {
                status: 413,
                headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
            });
        }

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "messages array is required" }), {
                status: 400,
                headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
            });
        }

        const hfToken = Deno.env.get("HF_TOKEN");
        const selectedModel = model ?? "meta-llama/Llama-3.1-8B-Instruct:ovhcloud";
        const apiUrl = "https://router.huggingface.co/v1/chat/completions";

        const hfPayload: Record<string, unknown> = {
            model: selectedModel,
            messages,
            temperature: temperature ?? 0.7,
            max_tokens: 2048,
            stream: !!stream,
        };

        // Pass through provider-specific parameters
        if (thinking) hfPayload.thinking = thinking;

        const hfResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${hfToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(hfPayload),
        });

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error(`[EDGE_ERROR] HF API ${hfResponse.status}: ${errorText}`);
            return new Response(JSON.stringify({ error: `Upstream Error: ${errorText}` }), {
                status: hfResponse.status,
                headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
            });
        }

        if (stream) {
            // Parse the SSE stream from HF and extract only the token text,
            // matching the plain-text format the frontend expects.
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            let buffer = "";

            const transformStream = new TransformStream({
                transform(chunk, controller) {
                    buffer += decoder.decode(chunk, { stream: true });
                    const lines = buffer.split("\n");
                    // Keep the last potentially incomplete line in the buffer
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const payload = line.slice(6).trim();
                        if (payload === "[DONE]") continue;
                        try {
                            const parsed = JSON.parse(payload);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                controller.enqueue(encoder.encode(content));
                            }
                        } catch {
                            // Skip malformed JSON lines
                        }
                    }
                },
                flush(controller) {
                    // Process any remaining buffer
                    if (buffer.startsWith("data: ")) {
                        const payload = buffer.slice(6).trim();
                        if (payload !== "[DONE]") {
                            try {
                                const parsed = JSON.parse(payload);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    controller.enqueue(encoder.encode(content));
                                }
                            } catch {
                                // skip
                            }
                        }
                    }
                }
            });

            const readableStream = hfResponse.body!.pipeThrough(transformStream);

            return new Response(readableStream, {
                headers: {
                    ...getCorsHeaders(origin),
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });
        } else {
            // Non-streaming: forward the JSON response
            const completion = await hfResponse.json();
            console.log(`Completion successful for model: ${selectedModel}`);
            return new Response(JSON.stringify(completion), {
                headers: {
                    ...getCorsHeaders(origin),
                    "Content-Type": "application/json",
                },
            });
        }
    } catch (err) {
        console.error("[EDGE_ERROR]:", err);
        return new Response(JSON.stringify({ error: "Edge Function Crash" }), {
            status: 500,
            headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
        });
    }
};

export const config: Config = { path: "/api/chat" };
