import { InferenceClient } from "@huggingface/inference";
import type { Handler } from "@netlify/functions";

// Allow requests from your Apache-hosted site.
// Add any other origins you need (e.g. localhost for local dev).
const ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173",
    // TODO: replace with your actual Apache site URL, e.g.:
    // "https://your-apache-site.example.com",
];

const corsHeaders = (origin: string | undefined) => ({
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin ?? "")
        ? (origin as string)
        : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
});

const handler: Handler = async (event) => {
    const origin = event.headers["origin"];

    // Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: corsHeaders(origin), body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: corsHeaders(origin), body: "Method Not Allowed" };
    }

    try {
        const { messages, model } = JSON.parse(event.body ?? "{}");

        if (!messages || !Array.isArray(messages)) {
            return {
                statusCode: 400,
                headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
                body: JSON.stringify({ error: "messages array is required" }),
            };
        }

        // HF_TOKEN lives only in the Netlify dashboard — never sent to the browser
        const client = new InferenceClient(process.env.HF_TOKEN);

        const completion = await client.chatCompletion({
            model: model ?? "openai/gpt-oss-120b:fastest",
            messages,
        });

        return {
            statusCode: 200,
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
            body: JSON.stringify(completion),
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("HF proxy error:", message);
        return {
            statusCode: 500,
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
            body: JSON.stringify({ error: message }),
        };
    }
};

export { handler };
