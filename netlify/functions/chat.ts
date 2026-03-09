import { InferenceClient } from "@huggingface/inference";

const ALLOWED_ORIGINS = [
    "http://localhost:8080",
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

export default async (req: Request) => {
    const origin = req.headers.get("origin");

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: getCorsHeaders(origin),
        });
    }

    if (req.method !== "POST") {
        return new Response("Method Not Allowed", {
            status: 405,
            headers: getCorsHeaders(origin),
        });
    }

    // Execution Guard: 25 seconds (Netlify limit is 26s)
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        console.warn("Execution Guard: Aborting HF request due to 25s limit.");
        abortController.abort();
    }, 25000);

    let tokensSent = 0;

    try {
        const bodyContent = await req.json();
        const { messages, model, temperature, stream } = bodyContent;

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

        const hfToken = process.env.HF_TOKEN;
        const client = new InferenceClient(hfToken);

        if (stream) {
            // HF Inference Streaming
            const streamResponse = client.chatCompletionStream({
                model: model ?? "meta-llama/Llama-3.1-8B-Instruct:ovhcloud",
                messages,
                temperature: temperature ?? 0.7,
                max_tokens: 1024,
            }, {
                signal: abortController.signal
            });

            // Standard ReadableStream for V2 Netlify Functions
            const encoder = new TextEncoder();
            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of streamResponse) {
                            if (chunk.choices && chunk.choices[0].delta.content) {
                                controller.enqueue(encoder.encode(chunk.choices[0].delta.content));
                                tokensSent++;
                            }
                        }
                        controller.close();
                    } catch (err: any) {
                        if (err.name === 'AbortError') {
                            console.error(`Stream Aborted: Silent kill detected at ${tokensSent} tokens.`);
                            controller.error(err);
                        } else {
                            console.error("Stream error:", err);
                            controller.error(err);
                        }
                    } finally {
                        clearTimeout(timeoutId);
                    }
                },
            });

            return new Response(readableStream, {
                headers: {
                    ...getCorsHeaders(origin),
                    "Content-Type": "text/plain; charset=utf-8",
                },
            });
        } else {
            // Non-streaming with observability
            const completion = await client.chatCompletion({
                model: model ?? "meta-llama/Llama-3.1-8B-Instruct:ovhcloud",
                messages,
                temperature: temperature ?? 0.7,
            }, {
                signal: abortController.signal
            });

            clearTimeout(timeoutId);

            // Log telemetry if available (Note: HF-dist doesn't surface headers easily in the simple client, 
            // but we can log the execution info we have)
            console.log(`Completion successful for model: ${model}`);

            return new Response(JSON.stringify(completion), {
                headers: {
                    ...getCorsHeaders(origin),
                    "Content-Type": "application/json",
                },
            });
        }
    } catch (error: unknown) {
        clearTimeout(timeoutId);
        const name = (error as any)?.name;
        if (name === 'AbortError') {
            console.error(`Request Aborted: Execution exceeded 25s threshold. Tokens processed: ${tokensSent}`);
            return new Response(JSON.stringify({ error: "Request timed out (25s limit)", partial: true }), {
                status: 504,
                headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
            });
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("HF proxy error caught:", message);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
        });
    }
};
