export interface SemanticBlock {
  id: string;
  text: string;
}

// Abbreviations that contain a trailing period but should NOT end a sentence.
const ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr",
  "e.g", "i.e", "etc", "vs", "st", "inc", "ltd", "co",
  "u.s", "u.k", "u.n", "no", "fig", "pp",
]);

const BULLET_RE = /^\s*(?:[-*•]|\d+[.)])\s+/;

function splitSentences(paragraph: string): string[] {
  const out: string[] = [];
  let buf = "";

  for (let i = 0; i < paragraph.length; i++) {
    const ch = paragraph[i];
    buf += ch;

    if (ch === "." || ch === "!" || ch === "?") {
      const next = paragraph[i + 1] ?? "";
      const looksLikeBoundary = next === "" || /\s/.test(next);
      if (!looksLikeBoundary) continue;

      if (ch === ".") {
        const lastWord = buf.slice(0, -1).match(/([A-Za-z.]+)$/)?.[1]?.toLowerCase() ?? "";
        if (ABBREVIATIONS.has(lastWord) || ABBREVIATIONS.has(lastWord.replace(/\.$/, ""))) continue;
        // Numeric like "3.14" — don't split.
        if (/\d$/.test(buf.slice(0, -1)) && /\d/.test(next)) continue;
      }

      const rest = paragraph.slice(i + 1).trim();
      if (rest && !/^[A-Z0-9"'([]/.test(rest)) continue;

      const trimmed = buf.trim();
      if (trimmed) out.push(trimmed);
      buf = "";
    }
  }

  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

export function chunkSemantically(text: string): SemanticBlock[] {
  if (!text || !text.trim()) return [];

  const normalized = text.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
  const paragraphs = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const blocks: SemanticBlock[] = [];
  let idx = 0;

  for (const para of paragraphs) {
    const lines = para.split(/\n/).map((l) => l.trim()).filter(Boolean);
    const allBullets = lines.length > 1 && lines.every((l) => BULLET_RE.test(l));

    if (allBullets) {
      for (const line of lines) {
        blocks.push({ id: `b${idx++}`, text: line });
      }
      continue;
    }

    const recombined = lines.join(" ");
    const sentences = splitSentences(recombined);
    for (const s of sentences) {
      blocks.push({ id: `b${idx++}`, text: s });
    }
  }

  return blocks;
}
