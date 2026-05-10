import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SwapState {
  /** Set of swapped pair ids (regular pairs and orphan inserts share this set). */
  swappedIds: Set<string>;
  /** Frozen comparedIdx per pairId — survives threshold changes for swapped pairs. */
  frozenSwapMap: Map<number, number>;
  /** Insertion state for unpaired compared blocks (comparedIdx values). */
  insertedOrphans: Set<number>;
  /** Toggle a regular pair's swap. `comparedIdx` is required so we can freeze it. */
  toggleSwap: (pairId: string, currentIdx: number, comparedIdx: number) => void;
  /** Toggle an orphan-compared insertion. */
  toggleOrphan: (comparedIdx: number) => void;
}

/**
 * Centralizes all "user has cherry-picked content from the compared version"
 * state. Resets when text changes (a swap on stale text would be meaningless),
 * but NOT when the threshold changes — the user's edits are commitments, not
 * similarity claims.
 */
export function useSwapState(resetKey: string): SwapState {
  const [swappedIds, setSwappedIds] = useState<Set<string>>(() => new Set());
  const [frozenSwapMap, setFrozenSwapMap] = useState<Map<number, number>>(() => new Map());
  const [insertedOrphans, setInsertedOrphans] = useState<Set<number>>(() => new Set());

  const lastResetRef = useRef(resetKey);
  useEffect(() => {
    if (lastResetRef.current !== resetKey) {
      lastResetRef.current = resetKey;
      setSwappedIds(new Set());
      setFrozenSwapMap(new Map());
      setInsertedOrphans(new Set());
    }
  }, [resetKey]);

  const toggleSwap = useCallback((pairId: string, currentIdx: number, comparedIdx: number) => {
    setSwappedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pairId)) next.delete(pairId);
      else next.add(pairId);
      return next;
    });
    setFrozenSwapMap((prev) => {
      const next = new Map(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.set(currentIdx, comparedIdx);
      return next;
    });
  }, []);

  const toggleOrphan = useCallback((comparedIdx: number) => {
    setInsertedOrphans((prev) => {
      const next = new Set(prev);
      if (next.has(comparedIdx)) next.delete(comparedIdx);
      else next.add(comparedIdx);
      return next;
    });
  }, []);

  return useMemo(
    () => ({ swappedIds, frozenSwapMap, insertedOrphans, toggleSwap, toggleOrphan }),
    [swappedIds, frozenSwapMap, insertedOrphans, toggleSwap, toggleOrphan],
  );
}
