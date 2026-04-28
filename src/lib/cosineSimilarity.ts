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

// greedy unique-matches
export function bestMatches(
  currentVecs: number[][],
  comparedVecs: number[][],
  threshold = 0.55,
): BlockPair[] {
  const pairs: BlockPair[] = [];
  const usedCompared = new Set<number>();
  const assignedCurrent = new Set<number>();

  // 1. Pre-calculate all possible combinations
  const candidates: { i: number; j: number; score: number }[] = [];

  for (let i = 0; i < currentVecs.length; i++) {
    for (let j = 0; j < comparedVecs.length; j++) {
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
