// Shared CORS helper for the three edge functions.
//
// To add a domain without redeploying, set the `ALLOWED_ORIGINS` env var on
// Netlify to a comma-separated list. If unset, the fallback list below is
// used so local dev and current production keep working.
//
// Parser is tolerant of common pasted formats:
//   - bare:        https://a.example,https://b.example
//   - quoted:      "https://a.example","https://b.example"
//   - JSON array:  ["https://a.example","https://b.example"]
// Quotes, square brackets, and surrounding whitespace are all stripped per item
// before comparison — sending the literal `"https://x"` (quotes included) as
// an allowed origin would never match a browser's bare `https://x`.

declare const Deno: {
    env: { get(key: string): string | undefined };
};

const FALLBACK_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8888",
    "https://masterprompted.lovable.app",
    "https://prompted-app.eipcm.org",
];

function cleanOrigin(raw: string): string {
    // Strip wrapping `[`/`]` (JSON-array case), then surrounding whitespace,
    // then surrounding `"` or `'` quotes, then trim again. Cheap and order-
    // independent for the common pasted formats.
    return raw
        .replace(/^\s*\[?/, "")
        .replace(/\]?\s*$/, "")
        .trim()
        .replace(/^["']+|["']+$/g, "")
        .trim();
}

function getAllowedOrigins(): string[] {
    const fromEnv = Deno.env.get("ALLOWED_ORIGINS");
    if (!fromEnv) return FALLBACK_ORIGINS;
    const parsed = fromEnv
        .split(",")
        .map(cleanOrigin)
        .filter(Boolean);
    return parsed.length > 0 ? parsed : FALLBACK_ORIGINS;
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
    const allowed = getAllowedOrigins();
    const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}
