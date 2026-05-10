import { useEffect, useMemo, useState } from "react";
import { bestMatches, BlockPair } from "@/lib/cosineSimilarity";

/**
 * Re-runs greedy pairing whenever the threshold (debounced) or vectors change.
 * Vectors come from `useRelationalAnchors` and are cached by the embeddings
 * client, so threshold drags are pure-clientside (no network).
 *
 * `lockedPairs` lets the caller pin (currentIdx → comparedIdx) for chunks the
 * user has swapped, so re-pairing after a threshold change can't silently
 * change a swapped chunk's identity.
 */
export function usePairedThreshold(
  currentVecs: number[][],
  comparedVecs: number[][],
  threshold: number,
  lockedPairs?: Map<number, number>,
  debounceMs: number = 50,
): BlockPair[] {
  const [debouncedThreshold, setDebouncedThreshold] = useState(threshold);

  useEffect(() => {
    if (debounceMs <= 0) {
      setDebouncedThreshold(threshold);
      return;
    }
    const id = setTimeout(() => setDebouncedThreshold(threshold), debounceMs);
    return () => clearTimeout(id);
  }, [threshold, debounceMs]);

  return useMemo(() => {
    if (currentVecs.length === 0 || comparedVecs.length === 0) return [];
    return bestMatches(currentVecs, comparedVecs, debouncedThreshold, lockedPairs);
  }, [currentVecs, comparedVecs, debouncedThreshold, lockedPairs]);
}
