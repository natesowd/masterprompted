/**
 * Client-side web search service.
 *
 * Calls the /api/web-search edge function and returns normalised results.
 * Also provides a helper to transform results into the Document[] shape
 * expected by the existing chat.ts edge function.
 */

import { fetchWithRetry } from "../evaluations/fetchWithRetry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  /** 1-based position in the search results */
  position: number;
}

interface WebSearchResponse {
  results: WebSearchResult[];
}

/** Document shape consumed by the chat edge function */
export interface ChatDocument {
  id: string;
  data: { title: string; text: string };
}

// ---------------------------------------------------------------------------
// Search endpoint — mirrors NETLIFY_CHAT_URL pattern
// ---------------------------------------------------------------------------

const WEB_SEARCH_URL =
  "https://luxury-blini-3336bb.netlify.app/api/web-search";

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Perform a web search via the edge function proxy.
 *
 * @param query  Natural-language search query
 * @param count  Number of results (default 6, max 20)
 * @param signal Optional AbortSignal for cancellation
 */
export async function searchWeb(
  query: string,
  count = 6,
  signal?: AbortSignal,
): Promise<WebSearchResult[]> {
  const response = await fetchWithRetry(WEB_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, count }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Web search failed: ${response.status} — ${errorText}`);
  }

  const data: WebSearchResponse = await response.json();
  return data.results ?? [];
}

/**
 * Extract just the domain from a URL for display purposes.
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Transform web search results into the Document[] format expected by the
 * chat edge function's `injectDocumentsIntoMessages`.
 *
 * Each document title encodes the source URL so the LLM can include it in
 * its References section.
 */
export function searchResultsToDocuments(
  results: WebSearchResult[],
): ChatDocument[] {
  return results.map((r) => ({
    id: `web-${r.position}`,
    data: {
      title: `${r.title} (${extractDomain(r.url)})`,
      text: `${r.snippet}\nSource URL: ${r.url}`,
    },
  }));
}
