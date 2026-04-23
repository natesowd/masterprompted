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

// Greedy best-match: for each current block, pick the compared block with
// the highest cosine score. Compared blocks aren't reserved, so two current
// blocks can map to the same compared block — acceptable for a diff UX
// where the goal is "which compared thought is this closest to."
export function bestMatches(
  currentVecs: number[][],
  comparedVecs: number[][],
  threshold = 0.55,
): BlockPair[] {
  const pairs: BlockPair[] = [];
  if (comparedVecs.length === 0) {
    for (let i = 0; i < currentVecs.length; i++) {
      pairs.push({ currentIdx: i, comparedIdx: null, score: 0 });
    }
    return pairs;
  }

  for (let i = 0; i < currentVecs.length; i++) {
    let bestIdx = -1;
    let bestScore = -Infinity;
    for (let j = 0; j < comparedVecs.length; j++) {
      const s = cosine(currentVecs[i], comparedVecs[j]);
      if (s > bestScore) {
        bestScore = s;
        bestIdx = j;
      }
    }
    if (bestIdx === -1 || bestScore < threshold) {
      pairs.push({ currentIdx: i, comparedIdx: null, score: bestScore });
    } else {
      pairs.push({ currentIdx: i, comparedIdx: bestIdx, score: bestScore });
    }
  }
  return pairs;
}
