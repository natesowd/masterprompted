/**
 * Prediction Tree Data - Built from probability_tree_2.numbers CSV
 * N-ary tree with variable depth (6-10 levels per path)
 * Root: "European Union", 4 main branches: Reaches, Leaders, Agrees, Nations
 */

export interface PredictionNode {
  word: string;
  prob: number;
  children: PredictionNode[];
  endProb: number; // probability of end-of-text token (0 = can't end here)
}

const n = (word: string, prob: number, children: PredictionNode[] = [], endProb = 0): PredictionNode =>
  ({ word, prob, children, endProb });

export const predictionTree: PredictionNode = n("European Union", 1, [
  n("Reaches", 0.383, [
    n("Landmark", 0.820, [
      n("AI", 0.518, [
        n("Ethics", 0.991, [
          n("Agreement", 0.303, [
            n("After", 0.588, [
              n("Years", 0.723, [], 0.867),
              n("Decades", 0.082),
            ]),
            n("Across", 0.095, [
              n("Member", 0.576, [n("States", 0.949)]),
              n("Nations", 0.146, [], 0.933),
              n("Borders", 0.097, [], 0.980),
            ]),
            n("Amid", 0.075, [
              n("Controversy", 0.479, [], 1.0),
              n("Concerns", 0.129, [], 0.999),
              n("Debate", 0.071, [], 0.971),
              n("Global", 0.051, [
                n("Debate", 0.244),
                n("Scramble", 0.214),
                n("Concern", 0.163),
                n("Pressure", 0.063),
              ]),
              n("Uncertainty", 0.047, [], 0.998),
            ]),
          ]),
          n("Accord", 0.294, [
            n("After", 0.398, [
              n("Years", 0.713, [], 0.891),
              n("Months", 0.082, [], 0.889),
            ]),
            n("Agreement", 0.182, [
              n("Finally", 0.141, [], 0.924),
              n("Unanimously", 0.063, [], 0.683),
              n("Today", 0.049, [], 0.950),
            ], 0.474),
            n("Across", 0.082, [
              n("Member", 0.561, [n("States", 0.938)]),
              n("Nations", 0.216, [], 0.933),
            ]),
            n("Finally", 0.042, [
              n("Reached", 0.183, [], 0.830),
              n("Adopted", 0.072, [], 1.0),
              n("Signed", 0.053, [], 0.835),
              n("Implemented", 0.049, [], 0.845),
            ], 0.234),
            n("Unanimously", 0.032, [
              n("Adopt", 0.237),
              n("Today", 0.124),
              n("Approved", 0.049),
            ], 0.344),
          ]),
          n("Framework", 0.141, [
            n("Agreement", 0.802, [
              n("Finally", 0.276, [], 0.908),
              n("Today", 0.106, [], 0.908),
              n("Unanimously", 0.056, [], 0.950),
              n("Nationwide", 0.048, [], 0.898),
            ], 0.139),
          ]),
          n("Deal", 0.119, [
            n("After", 0.412, [
              n("Years", 0.769, [], 0.889),
            ]),
            n("Across", 0.172, [
              n("Member", 0.527, [n("States", 0.950)]),
              n("Nations", 0.161, [], 0.938),
              n("Borders", 0.110, [], 0.980),
            ]),
            n("Amid", 0.092, [
              n("Controversy", 0.434, [], 1.0),
              n("Concerns", 0.187, [], 0.998),
              n("Uncertainty", 0.054, [], 0.998),
              n("Debate", 0.047, [], 0.972),
              n("Global", 0.044, [
                n("Scramble", 0.198),
                n("Concern", 0.192),
                n("Debate", 0.118),
                n("Pressure", 0.099),
                n("Uncertainty", 0.065),
              ]),
            ]),
            n("with", 0.053, [
              n("Nations", 0.251, [], 0.874),
              n("Member", 0.138, [n("States", 0.967)]),
              n("Industry", 0.127, [], 0.956),
              n("Stakeholders", 0.082, [], 1.0),
              n("Unity", 0.080, [], 0.959),
            ]),
            n("Agreement", 0.031, [
              n("Finally", 0.099, [], 0.900),
              n("Unanimously", 0.092, [], 0.438),
              n("Reached", 0.075, [], 0.893),
              n("Finalized", 0.049, [], 0.969),
            ], 0.365),
          ]),
        ]),
      ]),
      n("Agreement", 0.416, [
        n("on", 0.999, [
          n("AI", 0.945, [
            n("Ethics", 0.852, [
              n("Framework", 0.428, [], 0.873),
              n("Standards", 0.251, [], 0.963),
              n("Guidelines", 0.184, [], 0.947),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]),
  n("Leaders", 0.208, [
    n("Unite", 0.778, [
      n("on", 0.989, [
        n("AI", 0.772, [
          n("Ethics", 0.929, [
            n("Framework", 0.820, [
              n("Guidelines", 0.443, [], 0.944),
              n("Agreement", 0.186, [], 0.969),
            ], 0.130),
          ]),
        ]),
      ]),
    ]),
  ]),
  n("Agrees", 0.152, [
    n("on", 0.714, [
      n("Landmark", 0.214, [
        n("AI", 0.980, [
          n("Ethics", 0.981, [
            n("Framework", 0.910, [
              n("Guidelines", 0.341, [], 0.944),
              n("Proposal", 0.043, [], 0.967),
              n("Nationwide", 0.028, [], 0.861),
            ], 0.296),
          ]),
        ]),
      ]),
      n("AI", 0.152, [
        n("Ethics", 0.941, [
          n("Framework", 0.880, [
            n("Guidelines", 0.344, [
              n("Nationwide", 0.169, [], 0.923),
              n("Nationally", 0.054, [], 0.998),
              n("Finally", 0.051, [], 0.938),
            ], 0.499),
            n("After", 0.167, [
              n("Years", 0.742, [], 0.913),
              n("Months", 0.058, [], 0.905),
            ]),
            n("Across", 0.155, [
              n("Member", 0.598, [n("States", 0.950, [], 0.984)]),
              n("Nations", 0.131, [], 0.954),
              n("Borders", 0.041, [], 0.986),
            ]),
            n("and", 0.089, [
              n("Guidelines", 0.540, [], 0.959),
              n("Standards", 0.170, [], 0.975),
              n("Regulations", 0.150, [], 0.958),
            ]),
          ]),
        ]),
      ]),
      n("Comprehensive", 0.116, [
        n("AI", 0.965, [
          n("Ethics", 0.975, [
            n("Framework", 0.928, [
              n("Guidelines", 0.525, [], 0.932),
              n("Nationwide", 0.055, [], 0.856),
              n("Finally", 0.034, [], 0.852),
              n("Standards", 0.026, [], 0.955),
            ], 0.131),
          ]),
        ]),
      ]),
      n("Groundbreaking", 0.076, [
        n("AI", 0.981, [
          n("Ethics", 0.986, [
            n("Framework", 0.933, [
              n("Guidelines", 0.310, [], 0.936),
              n("Nationwide", 0.145, [], 0.864),
              n("Proposal", 0.039, [], 0.962),
              n("Standards", 0.038, [], 0.955),
            ], 0.125),
          ]),
        ]),
      ]),
      n("Unified", 0.060, [
        n("AI", 0.963, [
          n("Ethics", 0.966, [
            n("Framework", 0.884, [
              n("Guidelines", 0.359, [], 0.934),
              n("Nationwide", 0.042, [], 0.874),
              n("Finally", 0.040, [], 0.877),
            ], 0.319),
          ]),
        ]),
      ]),
    ]),
    n("Landmark", 0.138, [
      n("AI", 0.829, [
        n("Ethics", 0.976, [
          n("Framework", 0.823, [
            n("Across", 0.288, [
              n("Member", 0.571, [n("States", 0.942)]),
              n("Nations", 0.188, [], 0.947),
            ]),
            n("Guidelines", 0.241, [
              n("Nationwide", 0.181, [], 0.926),
              n("Nationally", 0.120, [], 0.993),
              n("Finally", 0.053, [], 0.793),
              n("Unveiled", 0.029, [], 0.943),
            ], 0.293),
            n("After", 0.108, [
              n("Years", 0.673, [], 0.856),
              n("Months", 0.074, [], 0.825),
              n("Decades", 0.055, [], 0.837),
            ]),
            n("and", 0.087, [
              n("Guidelines", 0.597, [], 0.950),
              n("Regulations", 0.188, [], 0.936),
            ]),
            n("Nationwide", 0.055, [
              n("Standards", 0.071, [], 0.979),
              n("Implementation", 0.070, [], 0.957),
              n("Guidelines", 0.049, [], 0.968),
            ], 0.427),
          ]),
        ]),
      ]),
    ]),
  ]),
  n("Nations", 0.073, [
    n("Unite", 0.884, [
      n("on", 0.980, [
        n("AI", 0.791, [
          n("Ethics", 0.926, [
            n("Framework", 0.797, [
              n("Guidelines", 0.328, [], 0.951),
              n("Agreement", 0.172, [], 0.974),
            ], 0.272),
          ]),
        ]),
      ]),
    ]),
  ]),
]);

// --- Utility Functions ---

/** Navigate tree to node at given path, return that node */
export function getNodeAtPath(path: string[]): PredictionNode | null {
  let node = predictionTree;
  for (let i = 1; i < path.length; i++) {
    const child = node.children.find(c => c.word === path[i]);
    if (!child) return null;
    node = child;
  }
  return node;
}

/** Get selectable options (children) for a node at the given path */
export function getOptionsForPath(path: string[]): { word: string; probability: number }[] {
  const node = getNodeAtPath(path);
  if (!node) return [];
  return node.children
    .map(c => ({ word: c.word, probability: c.prob }))
    .sort((a, b) => b.probability - a.probability);
}

/** Check if path has reached a terminal node (no more children) */
export function isPathTerminal(path: string[]): boolean {
  const node = getNodeAtPath(path);
  if (!node) return true;
  return node.children.length === 0;
}

/** Get all root-to-leaf paths (only terminal leaves, not canEnd intermediate nodes) */
export function getAllLeafPaths(): { words: string[]; probabilities: number[] }[] {
  const paths: { words: string[]; probabilities: number[] }[] = [];
  function dfs(node: PredictionNode, words: string[], probs: number[]) {
    if (node.children.length === 0) {
      paths.push({ words: [...words], probabilities: [...probs] });
      return;
    }
    for (const child of node.children) {
      dfs(child, [...words, child.word], [...probs, child.prob]);
    }
  }
  dfs(predictionTree, [predictionTree.word], [predictionTree.prob]);
  return paths;
}

/** Get maximum depth of the tree (number of levels including root) */
export function getMaxDepth(): number {
  function maxD(node: PredictionNode): number {
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(maxD));
  }
  return maxD(predictionTree);
}

/** Get the default (highest probability) path through the tree */
export function getDefaultPath(): string[] {
  const path = [predictionTree.word];
  let node = predictionTree;
  while (node.children.length > 0) {
    const best = node.children.reduce((a, b) => a.prob > b.prob ? a : b);
    path.push(best.word);
    node = best;
  }
  return path;
}

/** 
 * Compute Y position for a path at a given level in the tree diagram.
 * Uses tree structure to dynamically position based on sibling count and selection state.
 */
export function computePathY(
  pathWords: string[],
  level: number,
  selections: (string | null)[],
  currentLevel: number,
  svgCenterY: number
): number {
  let y = svgCenterY;
  let node = predictionTree;

  for (let d = 1; d <= level; d++) {
    const word = pathWords[d];
    if (!word) break;

    const siblings = node.children;
    const childIndex = siblings.findIndex(c => c.word === word);
    if (childIndex < 0) break;

    // Check if this depth is on the selected path
    let pathMatchesSelection = true;
    for (let i = 0; i <= d - 1; i++) {
      if (selections[i] && selections[i] !== pathWords[i]) {
        pathMatchesSelection = false;
        break;
      }
    }

    const isActiveDepth = d <= currentLevel;
    let spacing: number;

    if (pathMatchesSelection && isActiveDepth) {
      // Selected branches get expanded spacing
      const baseExpanded = Math.max(55, 90 - d * 4);
      spacing = baseExpanded * (1 + (d - 1) * 0.15);
    } else {
      // Unselected branches are compact
      spacing = Math.max(10, 24 - d * 1.5);
    }

    // Center children around current y
    const offset = (childIndex - (siblings.length - 1) / 2) * spacing;
    y += offset;

    node = siblings[childIndex];
  }

  return y;
}

/** Create an empty selections array of the right length */
export function createEmptySelections(): (string | null)[] {
  const depth = getMaxDepth();
  const arr: (string | null)[] = [predictionTree.word];
  for (let i = 1; i < depth; i++) arr.push(null);
  return arr;
}
