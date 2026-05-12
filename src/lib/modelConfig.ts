/**
 * Single source of truth for the three HuggingFace models the app uses.
 *
 * Resolution order, per role:
 *   1. `HF_*_MODEL` env var (set in Netlify UI for prod, or local `.env` for dev).
 *      Exposed to the client via Vite's `envPrefix: ['VITE_', 'HF_']` in vite.config.ts;
 *      read on the server by `Deno.env.get(...)` in the edge functions.
 *   2. Hardcoded fallback below.
 *
 * Display names are kept here too so the UI text in ChatBody / PromptControls
 * always reflects whichever model is actually in use.
 */

/** Fallbacks if env vars are unset. Edge functions duplicate these strings — keep them in sync. */
const FALLBACK_EMBEDDING_MODEL = "BAAI/bge-m3";
const FALLBACK_CHAT_MODEL = "meta-llama/Llama-3.3-70B-Instruct:ovhcloud";
const FALLBACK_OPTIMIZER_MODEL = "openai/gpt-oss-20b:ovhcloud";

export const MODELS = {
  embedding: import.meta.env.HF_EMBEDDING_MODEL ?? FALLBACK_EMBEDDING_MODEL,
  chat: import.meta.env.HF_CHAT_MODEL ?? FALLBACK_CHAT_MODEL,
  optimizer: import.meta.env.HF_OPTIMIZER_MODEL ?? FALLBACK_OPTIMIZER_MODEL,
} as const;

/**
 * Human-readable display name for a model ID. Used in the UI text that lists
 * which models are involved in optimization/output. Falls back to a derived
 * short name when an unknown ID is passed.
 */
const DISPLAY_NAMES: Record<string, string> = {
  "BAAI/bge-m3": "BGE-M3",
  "sentence-transformers/all-MiniLM-L6-v2": "MiniLM-L6-v2",
  "meta-llama/Llama-3.3-70B-Instruct:ovhcloud": "Llama 3.3 70B",
  "openai/gpt-oss-20b:ovhcloud": "GPT-OSS-20B",
};

export function modelDisplayName(modelId: string): string {
  if (DISPLAY_NAMES[modelId]) return DISPLAY_NAMES[modelId];
  // Fallback: strip the org prefix and any :provider suffix.
  const afterSlash = modelId.split("/").pop() ?? modelId;
  return afterSlash.split(":")[0];
}
