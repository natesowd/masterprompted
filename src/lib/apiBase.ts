// Shared base URL for all Netlify edge-function endpoints (/api/chat,
// /api/web-search, /api/embeddings). Keep this in sync with the deploy
// that owns the functions above.
export const NETLIFY_API_BASE =
  "https://69dcafb26499a614437a4607--luxury-blini-3336bb.netlify.app";

export const apiUrl = (path: string): string =>
  `${NETLIFY_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
