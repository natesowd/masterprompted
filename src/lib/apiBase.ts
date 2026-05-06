// Shared base URL for all Netlify edge-function endpoints (/api/chat,
// /api/web-search, /api/embeddings). Override per-environment with
// VITE_API_BASE; falls back to the production deploy if unset.
const FALLBACK_API_BASE = "https://luxury-blini-3336bb.netlify.app";

export const NETLIFY_API_BASE =
  (import.meta.env?.VITE_API_BASE as string | undefined)?.replace(/\/+$/, "") ||
  FALLBACK_API_BASE;

export const apiUrl = (path: string): string =>
  `${NETLIFY_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
