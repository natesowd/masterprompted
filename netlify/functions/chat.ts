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

    try {
        const bodyContent = await req.json();
        const { messages, model, temperature, stream } = bodyContent;

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
                max_tokens: 2048,
            });

            // Standard ReadableStream for V2 Netlify Functions
            const encoder = new TextEncoder();
            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of streamResponse) {
                            if (chunk.choices && chunk.choices[0].delta.content) {
                                controller.enqueue(encoder.encode(chunk.choices[0].delta.content));
                            }
                        }
                    } catch (err) {
                        console.error("Stream error:", err);
                    } finally {
                        controller.close();
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
            const completion = await client.chatCompletion({
                model: model ?? "meta-llama/Llama-3.1-8B-Instruct:ovhcloud",
                messages,
                temperature: temperature ?? 0.7,
            });

            return new Response(JSON.stringify(completion), {
                headers: {
                    ...getCorsHeaders(origin),
                    "Content-Type": "application/json",
                },
            });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("HF proxy error caught:", message);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
        });
    }
};
