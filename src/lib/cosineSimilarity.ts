export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export interface BlockPair {
  currentIdx: number;
  comparedIdx: number | null;
  score: number;
}

/**
 * Greedy unique-matches.
 *
 * `lockedPairs` lets callers preserve a stable mapping for currentIdx values
 * that the user has already swapped in the UI: the locked comparedIdx is
 * carried through unchanged and excluded from the candidate pool so no other
 * currentIdx can claim it. Without this, raising the threshold could silently
 * re-route a swapped chunk to a different compared block (because bestMatches
 * is greedy globally and the previously-blocking high-score match drops out).
 */
export function bestMatches(
  currentVecs: number[][],
  comparedVecs: number[][],
  threshold = 0.55,
  lockedPairs?: Map<number, number>,
): BlockPair[] {
  const pairs: BlockPair[] = [];
  const usedCompared = new Set<number>();
  const assignedCurrent = new Set<number>();

  // 0. Apply locked pairs first — these win over greedy results.
  if (lockedPairs && lockedPairs.size > 0) {
    for (const [currentIdx, comparedIdx] of lockedPairs) {
      if (currentIdx >= currentVecs.length || comparedIdx >= comparedVecs.length) continue;
      const score = cosine(currentVecs[currentIdx], comparedVecs[comparedIdx]);
      pairs.push({ currentIdx, comparedIdx, score });
      assignedCurrent.add(currentIdx);
      usedCompared.add(comparedIdx);
    }
  }

  // 1. Pre-calculate all possible combinations (skipping anything locked).
  const candidates: { i: number; j: number; score: number }[] = [];

  for (let i = 0; i < currentVecs.length; i++) {
    if (assignedCurrent.has(i)) continue;
    for (let j = 0; j < comparedVecs.length; j++) {
      if (usedCompared.has(j)) continue;
      const score = cosine(currentVecs[i], comparedVecs[j]);
      if (score >= threshold) {
        candidates.push({ i, j, score });
      }
    }
  }

  // 2. Sort candidates by score descending (highest quality matches first)
  candidates.sort((a, b) => b.score - a.score);

  // 3. Assign matches greedily
  for (const { i, j, score } of candidates) {
    if (!assignedCurrent.has(i) && !usedCompared.has(j)) {
      pairs.push({ currentIdx: i, comparedIdx: j, score });
      assignedCurrent.add(i);
      usedCompared.add(j);
    }
  }

  // 4. Fill in remaining current blocks that didn't find a unique match
  for (let i = 0; i < currentVecs.length; i++) {
    if (!assignedCurrent.has(i)) {
      pairs.push({ currentIdx: i, comparedIdx: null, score: 0 });
    }
  }

  // 5. Maintain original order of currentIdx for UI consistency
  return pairs.sort((a, b) => a.currentIdx - b.currentIdx);
}
