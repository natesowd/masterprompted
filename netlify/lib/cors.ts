// Shared CORS helper for the three edge functions. Files starting with `_`
// are not registered as endpoints in netlify.toml, so this is import-only.
//
// To add a domain without redeploying, set the `ALLOWED_ORIGINS` env var on
// Netlify to a comma-separated list. If unset, the fallback list below is
// used so local dev and current production keep working.

declare const Deno: {
    env: { get(key: string): string | undefined };
};

const FALLBACK_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8888",
    "https://masterprompted.lovable.app",
    "https://prompted-app.eipcm.org",
];

function getAllowedOrigins(): string[] {
    const fromEnv = Deno.env.get("ALLOWED_ORIGINS");
    if (!fromEnv) return FALLBACK_ORIGINS;
    const parsed = fromEnv
        .split(",")
        .map((o) => o.trim())
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
