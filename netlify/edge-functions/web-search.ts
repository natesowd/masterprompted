/* eslint-disable */
// @ts-nocheck
/**
 * Brave Search proxy edge function.
 *
 * Accepts a search query from the client, forwards it to the Brave Search API,
 * and returns normalized results. The API key is kept server-side so it is
 * never exposed to the browser.
 */
import type { Config, Context } from "@netlify/edge-functions";

// ---------------------------------------------------------------------------
// CORS  (mirrors chat.ts)
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

interface RequestBody {
    query: string;
    count?: number;
}

interface NormalizedResult {
    title: string;
    url: string;
    snippet: string;
    position: number;
}

// ---------------------------------------------------------------------------
// Brave Search API
// ---------------------------------------------------------------------------

const BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search";
const DEFAULT_COUNT = 6;

async function queryBrave(
    query: string,
    count: number,
    apiKey: string,
): Promise<NormalizedResult[]> {
    const params = new URLSearchParams({
        q: query,
        count: String(count),
    });

    const response = await fetch(`${BRAVE_SEARCH_URL}?${params}`, {
        headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": apiKey,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Brave API ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const webResults = data.web?.results ?? [];

    return webResults.map((r: any, idx: number) => ({
        title: r.title ?? "",
        url: r.url ?? "",
        snippet: r.description ?? "",
        position: idx + 1,
    }));
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

function jsonError(origin: string | null, status: number, message: string): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
}

function jsonOk(origin: string | null, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export default async (request: Request, _context: Context) => {
    const origin = request.headers.get("origin");

    console.log(`[EDGE] ${request.method} /api/web-search origin=${origin ?? "null"}`);

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: getCorsHeaders(origin) });
    }

    try {
        const body: RequestBody = await request.json();

        if (!body.query || typeof body.query !== "string" || !body.query.trim()) {
            return jsonError(origin, 400, "query string is required");
        }

        const apiKey = Deno.env.get("BRAVE_SEARCH_API_KEY");
        if (!apiKey) return jsonError(origin, 500, "Missing BRAVE_SEARCH_API_KEY");

        const count = Math.min(Math.max(body.count ?? DEFAULT_COUNT, 1), 20);

        console.log(`[EDGE] Brave search query="${body.query.slice(0, 80)}" count=${count}`);

        const results = await queryBrave(body.query.trim(), count, apiKey);

        console.log(`[EDGE] Brave search returned ${results.length} results`);

        return jsonOk(origin, { results });
    } catch (err) {
        console.error("[EDGE_ERROR] web-search:", err);
        return jsonError(origin, 500, "Web search failed");
    }
};

export const config: Config = { path: "/api/web-search" };
