import { apiUrl } from "@/lib/apiBase";
import { fetchWithRetry } from "@/services/evaluations/fetchWithRetry";

const EMBEDDINGS_URL = apiUrl("/api/embeddings");

// In-memory cache keyed by text content. Lives for the page session so
// toggling Compare on/off, navigating between versions, or click-swapping
// doesn't re-hit the API for text we've already embedded.
const cache = new Map<string, number[]>();

function cacheKey(text: string, model: string): string {
  return `${model}::${text}`;
}

interface EmbeddingsResponse {
  embeddings: number[][];
  model: string;
}

export interface EmbedOptions {
  model?: string;
  signal?: AbortSignal;
}

export async function embedTexts(
  texts: string[],
  options: EmbedOptions = {},
): Promise<number[][]> {
  const model = options.model ?? "sentence-transformers/all-MiniLM-L6-v2";

  const result = new Array<number[] | null>(texts.length).fill(null);
  const missingIdx: number[] = [];
  const missingTexts: string[] = [];

  texts.forEach((text, i) => {
    const hit = cache.get(cacheKey(text, model));
    if (hit) {
      result[i] = hit;
    } else {
      missingIdx.push(i);
      missingTexts.push(text);
    }
  });

  if (missingTexts.length === 0) {
    return result as number[][];
  }

  const response = await fetchWithRetry(EMBEDDINGS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts: missingTexts, model }),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`embeddings request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as EmbeddingsResponse;
  if (!data.embeddings || data.embeddings.length !== missingTexts.length) {
    throw new Error("embeddings response did not match request length");
  }

  data.embeddings.forEach((vec, j) => {
    const origIdx = missingIdx[j];
    result[origIdx] = vec;
    cache.set(cacheKey(missingTexts[j], model), vec);
  });

  return result as number[][];
}

export function clearEmbeddingsCache(): void {
  cache.clear();
}
