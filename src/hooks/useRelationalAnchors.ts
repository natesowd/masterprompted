import { useEffect, useRef, useState } from "react";
import { chunkSemantically, SemanticBlock } from "@/lib/semanticChunk";
import { embedTexts } from "@/services/embeddings/embeddingsClient";

export interface RelationalAnchorsState {
  status: "idle" | "loading" | "ready" | "error";
  currentBlocks: SemanticBlock[];
  comparedBlocks: SemanticBlock[];
  /** Embedding vectors aligned 1:1 with currentBlocks / comparedBlocks. Empty until status="ready". */
  currentVecs: number[][];
  comparedVecs: number[][];
  error?: string;
}

const EMPTY: RelationalAnchorsState = {
  status: "idle",
  currentBlocks: [],
  comparedBlocks: [],
  currentVecs: [],
  comparedVecs: [],
};

/**
 * Fetches embedding vectors for both versions and exposes them alongside the
 * chunked blocks. Pair-matching happens downstream in `usePairedThreshold` so
 * threshold changes don't trigger a network round-trip.
 */
export function useRelationalAnchors(
  currentText: string | undefined,
  comparedText: string | undefined,
  enabled: boolean,
): RelationalAnchorsState {
  const [state, setState] = useState<RelationalAnchorsState>(EMPTY);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!enabled || !currentText || !comparedText) {
      setState(EMPTY);
      return;
    }

    const currentBlocks = chunkSemantically(currentText);
    const comparedBlocks = chunkSemantically(comparedText);

    if (currentBlocks.length === 0 || comparedBlocks.length === 0) {
      setState({
        status: "ready",
        currentBlocks,
        comparedBlocks,
        currentVecs: [],
        comparedVecs: [],
      });
      return;
    }

    const reqId = ++reqIdRef.current;
    const controller = new AbortController();

    setState({
      status: "loading",
      currentBlocks,
      comparedBlocks,
      currentVecs: [],
      comparedVecs: [],
    });

    (async () => {
      try {
        const all = await embedTexts(
          [...currentBlocks.map((b) => b.text), ...comparedBlocks.map((b) => b.text)],
          { signal: controller.signal },
        );
        if (reqId !== reqIdRef.current) return;

        const currentVecs = all.slice(0, currentBlocks.length);
        const comparedVecs = all.slice(currentBlocks.length);

        setState({
          status: "ready",
          currentBlocks,
          comparedBlocks,
          currentVecs,
          comparedVecs,
        });
      } catch (err) {
        if (reqId !== reqIdRef.current) return;
        const e = err as { name?: string; message?: string };
        if (e?.name === "AbortError") return;
        setState({
          status: "error",
          currentBlocks,
          comparedBlocks,
          currentVecs: [],
          comparedVecs: [],
          error: e?.message ?? "embeddings failed",
        });
      }
    })();

    return () => {
      controller.abort();
    };
  }, [currentText, comparedText, enabled]);

  return state;
}
