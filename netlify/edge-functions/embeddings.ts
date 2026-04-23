/* eslint-disable */
// @ts-nocheck
/**
 * HuggingFace embeddings proxy.
 *
 * Accepts a batch of texts and returns one embedding vector per input,
 * preserving order. Client computes cosine similarity locally to map
 * blocks between prompt/output versions for the Compare view.
 */
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

interface RequestBody {
    texts: string[];
    model?: string;
}

const DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

function buildHfUrl(model: string): string {
    return `https://router.huggingface.co/hf-inference/models/${model}/pipeline/feature-extraction`;
}

async function callHuggingFace(
    texts: string[],
    model: string,
    hfToken: string,
): Promise<Response> {
    return fetch(buildHfUrl(model), {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: texts }),
    });
}

function jsonError(origin: string | null, status: number, message: string): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
}

// Some HF feature-extraction endpoints return token-level embeddings
// (number[][][]) instead of pooled sentence-level embeddings (number[][]).
// Mean-pool over the token axis in that case so the client always sees a
// flat `number[][]` shape (one vector per input text).
function normalizeEmbeddings(raw: unknown): number[][] {
    if (!Array.isArray(raw)) {
        throw new Error("Unexpected embeddings response shape");
    }
    const first = raw[0];
    if (Array.isArray(first) && typeof first[0] === "number") {
        return raw as number[][];
    }
    if (Array.isArray(first) && Array.isArray(first[0]) && typeof first[0][0] === "number") {
        return (raw as number[][][]).map((tokens) => {
            const dim = tokens[0].length;
            const out = new Array<number>(dim).fill(0);
            for (const tok of tokens) for (let i = 0; i < dim; i++) out[i] += tok[i];
            for (let i = 0; i < dim; i++) out[i] /= tokens.length;
            return out;
        });
    }
    throw new Error("Unexpected embeddings response shape");
}

export default async (request: Request, _context: Context) => {
    const origin = request.headers.get("origin");

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: getCorsHeaders(origin) });
    }

    try {
        const body: RequestBody = await request.json();

        const payloadSize = new Blob([JSON.stringify(body)]).size;
        if (payloadSize > 6 * 1024 * 1024) {
            return jsonError(origin, 413, "Payload size exceeds 6MB limit");
        }

        if (!body.texts || !Array.isArray(body.texts) || body.texts.length === 0) {
            return jsonError(origin, 400, "texts array is required and must be non-empty");
        }

        const hfToken = Deno.env.get("HF_TOKEN");
        if (!hfToken) return jsonError(origin, 500, "Missing HF_TOKEN");

        const model = body.model ?? DEFAULT_MODEL;
        console.log(`[EDGE] /api/embeddings model=${model} count=${body.texts.length}`);

        const hfResponse = await callHuggingFace(body.texts, model, hfToken);
        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error(`[EDGE_ERROR] HF ${hfResponse.status}: ${errorText}`);
            return jsonError(origin, hfResponse.status, `Upstream Error: ${errorText}`);
        }

        const raw = await hfResponse.json();
        const embeddings = normalizeEmbeddings(raw);

        return new Response(JSON.stringify({ embeddings, model }), {
            headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[EDGE_ERROR]:", err);
        return jsonError(origin, 500, "Edge Function Crash");
    }
};

export const config: Config = { path: "/api/embeddings" };
