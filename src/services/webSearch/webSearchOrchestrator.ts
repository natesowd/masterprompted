/**
 * Web Search RAG Orchestrator
 *
 * Coordinates the two-phase client-side flow:
 *   Phase 1  — Call /api/web-search to fetch live results  (~1-3 s)
 *   Phase 2  — Call /api/chat with results injected as documents, stream SSE  (~10-30 s)
 *
 * This keeps each Netlify edge-function invocation short and well within the
 * free-tier CPU-time limit.
 */

import { searchWeb, searchResultsToDocuments } from "./webSearchClient";
import type { WebSearchResult } from "./webSearchClient";
import { SSEContentParser } from "@/lib/sseStream";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WebSearchRAGOptions {
  chatUrl: string;
  model: string;
  temperature?: number;
  onSearchStart?: () => void;
  onSearchComplete?: (results: WebSearchResult[]) => void;
  onSearchError?: (error: Error) => void;
  onStreamDelta?: (delta: string, accumulated: string) => void;
  onStreamComplete?: (fullAnswer: string) => void;
  onStreamError?: (error: Error) => void;
  abortSignal?: AbortSignal;
}

export interface WebSearchRAGResult {
  answer: string;
  sources: WebSearchResult[];
}

// ---------------------------------------------------------------------------
// System prompt for web-grounded RAG
// ---------------------------------------------------------------------------

const WEB_RAG_SYSTEM_PROMPT = `You are a research assistant that answers questions using web search results. Follow these rules strictly:

1. BASE YOUR ANSWER ON THE PROVIDED WEB SEARCH RESULTS. Draw your response from the numbered reference documents below. Do not supplement with outside knowledge unless the results are insufficient.
2. CITE SOURCES using [1], [2], etc. matching the document numbers. Place citations inline immediately after relevant claims.
3. If the search results do not contain enough information to answer the question, say so clearly. Do not fabricate information.
4. Be concise and factual. Synthesize information across multiple sources when possible.
5. End your answer with a "## References" section listing each cited source with its title and URL.`;

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

/**
 * Run the full web-search → LLM-stream pipeline.
 *
 * On search failure the orchestrator falls back to a non-grounded LLM call
 * so the user always gets an answer.
 */
export async function runWebSearchRAG(
  query: string,
  options: WebSearchRAGOptions,
): Promise<WebSearchRAGResult> {
  const {
    chatUrl,
    model,
    temperature = 0.3,
    onSearchStart,
    onSearchComplete,
    onSearchError,
    onStreamDelta,
    onStreamComplete,
    onStreamError,
    abortSignal,
  } = options;

  let sources: WebSearchResult[] = [];
  let grounded = false;

  // ----- Phase 1: Web Search ------------------------------------------------

  onSearchStart?.();

  try {
    // 10 s timeout just for the search phase
    const searchController = new AbortController();
    const searchTimeout = setTimeout(() => searchController.abort(), 10_000);

    // If the parent aborts, propagate to the search controller
    const onParentAbort = () => searchController.abort();
    abortSignal?.addEventListener("abort", onParentAbort, { once: true });

    try {
      sources = await searchWeb(query, 6, searchController.signal);
    } finally {
      clearTimeout(searchTimeout);
      abortSignal?.removeEventListener("abort", onParentAbort);
    }

    if (sources.length > 0) {
      grounded = true;
      onSearchComplete?.(sources);
    } else {
      onSearchError?.(new Error("No relevant web results found"));
    }
  } catch (err) {
    console.warn("[WebSearchRAG] Search failed, falling back to non-grounded response", err);
    onSearchError?.(err instanceof Error ? err : new Error(String(err)));
  }

  // ----- Phase 2: LLM Stream ------------------------------------------------

  const systemPrompt = grounded
    ? WEB_RAG_SYSTEM_PROMPT
    : "You are a helpful assistant.";

  const documents = grounded ? searchResultsToDocuments(sources) : undefined;

  const payload: Record<string, unknown> = {
    model,
    temperature,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ],
    ...(documents ? { documents } : {}),
  };

  let accumulatedAnswer = "";

  try {
    const response = await fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chat request failed: ${response.status} — ${errorText}`);
    }

    if (!response.body) {
      throw new Error("No response body for streaming");
    }

    const decoder = new TextDecoder();
    const sseParser = new SSEContentParser();
    const reader = response.body.getReader();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        const remaining = sseParser.flush();
        if (remaining.length) {
          accumulatedAnswer += remaining.join("");
          onStreamDelta?.(remaining.join(""), accumulatedAnswer);
        }
        break;
      }
      const text = decoder.decode(value, { stream: true });
      const deltas = sseParser.feed(text);
      if (deltas.length) {
        accumulatedAnswer += deltas.join("");
        onStreamDelta?.(deltas.join(""), accumulatedAnswer);
      }
    }

    onStreamComplete?.(accumulatedAnswer);
  } catch (err) {
    if ((err as any)?.name === "AbortError") {
      accumulatedAnswer += "\n\n[[ERROR: [TIMEOUT - Request aborted]]]";
    }
    console.error("[WebSearchRAG] Stream error:", err);
    onStreamError?.(err instanceof Error ? err : new Error(String(err)));
  }

  return { answer: accumulatedAnswer, sources };
}
