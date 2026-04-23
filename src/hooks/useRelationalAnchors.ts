import { useEffect, useRef, useState } from "react";
import { chunkSemantically, SemanticBlock } from "@/lib/semanticChunk";
import { bestMatches, BlockPair } from "@/lib/cosineSimilarity";
import { embedTexts } from "@/services/embeddings/embeddingsClient";

export interface RelationalAnchorsState {
  status: "idle" | "loading" | "ready" | "error";
  currentBlocks: SemanticBlock[];
  comparedBlocks: SemanticBlock[];
  pairs: BlockPair[];
  error?: string;
}

const EMPTY: RelationalAnchorsState = {
  status: "idle",
  currentBlocks: [],
  comparedBlocks: [],
  pairs: [],
};

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
        pairs: currentBlocks.map((_, i) => ({ currentIdx: i, comparedIdx: null, score: 0 })),
      });
      return;
    }

    const reqId = ++reqIdRef.current;
    const controller = new AbortController();

    setState({
      status: "loading",
      currentBlocks,
      comparedBlocks,
      pairs: [],
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
        const pairs = bestMatches(currentVecs, comparedVecs);

        setState({
          status: "ready",
          currentBlocks,
          comparedBlocks,
          pairs,
        });
      } catch (err) {
        if (reqId !== reqIdRef.current) return;
        const e = err as { name?: string; message?: string };
        if (e?.name === "AbortError") return;
        setState({
          status: "error",
          currentBlocks,
          comparedBlocks,
          pairs: [],
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
