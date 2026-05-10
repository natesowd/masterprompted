import { Fragment, useMemo } from "react";
import { Minus } from "lucide-react";
import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { SemanticBlock } from "@/lib/semanticChunk";
import type { BlockPair } from "@/lib/cosineSimilarity";

export interface CompareBodyProps {
  threadIndex: number;
  currentBlocks: SemanticBlock[];
  comparedBlocks: SemanticBlock[];
  pairs: BlockPair[];
  threshold: number;
  swappedIds: Set<string>;
  insertedOrphans: Set<number>;
  hoveredId: string | null;
  onChunkEnter: (id: string) => void;
  onChunkLeave: () => void;
  onChunkClick: (id: string, currentIdx: number, comparedIdx: number) => void;
  onOrphanToggle: (comparedIdx: number) => void;
  /** Callback ref: registers a DOM node for a chunk id so the parent can measure rects. */
  setChunkRef: (id: string, el: HTMLElement | null) => void;
}

const HEATMAP_MIN_OPACITY = 0.10;
const HEATMAP_MAX_OPACITY = 0.55;
const ORPHAN_OPACITY = 0.55;

function pairId(threadIndex: number, currentIdx: number): string {
  return `t${threadIndex}-p${currentIdx}`;
}
function orphanId(threadIndex: number, comparedIdx: number): string {
  return `t${threadIndex}-orphan-c${comparedIdx}`;
}

function intensity(score: number, threshold: number): number {
  if (score <= 0) return 0;
  const t = (score - threshold) / Math.max(0.01, 1 - threshold);
  const clamped = Math.max(0, Math.min(1, t));
  return HEATMAP_MIN_OPACITY + (HEATMAP_MAX_OPACITY - HEATMAP_MIN_OPACITY) * clamped;
}

function heatmapColor(opacity: number, variant: "blue" | "purple"): string {
  // brand-blue-500: #3B82F6 → rgb(59,130,246)
  // brand-purple-500: #A855F7 → rgb(168,85,247)
  const rgb = variant === "blue" ? "59,130,246" : "168,85,247";
  return `rgba(${rgb},${opacity})`;
}

/**
 * For each unpaired comparedIdx (orphan), find the nearest paired comparedIdx
 * (tie → earlier). Returns: which currentIdx it attaches to and whether the
 * icon goes BEFORE or AFTER that current chunk.
 */
function placeOrphans(
  pairs: BlockPair[],
  comparedBlockCount: number,
): { before: Map<number, number[]>; after: Map<number, number[]>; trailing: number[] } {
  const before = new Map<number, number[]>();
  const after = new Map<number, number[]>();
  const trailing: number[] = [];

  const usedComparedIdx = new Set<number>();
  const pairedComparedToCurrent = new Map<number, number>();
  for (const p of pairs) {
    if (p.comparedIdx != null) {
      usedComparedIdx.add(p.comparedIdx);
      pairedComparedToCurrent.set(p.comparedIdx, p.currentIdx);
    }
  }

  const sortedPaired = Array.from(pairedComparedToCurrent.keys()).sort((a, b) => a - b);

  for (let cIdx = 0; cIdx < comparedBlockCount; cIdx++) {
    if (usedComparedIdx.has(cIdx)) continue;

    if (sortedPaired.length === 0) {
      trailing.push(cIdx);
      continue;
    }

    let nearest = sortedPaired[0];
    let nearestDist = Math.abs(cIdx - nearest);
    for (let k = 1; k < sortedPaired.length; k++) {
      const candidate = sortedPaired[k];
      const dist = Math.abs(cIdx - candidate);
      if (dist < nearestDist) {
        nearest = candidate;
        nearestDist = dist;
      }
      // tie → keep earlier (ascending sort already gives us that)
    }

    const targetCurrent = pairedComparedToCurrent.get(nearest)!;
    const placeBefore = cIdx < nearest;
    const bucket = placeBefore ? before : after;
    const list = bucket.get(targetCurrent) ?? [];
    list.push(cIdx);
    bucket.set(targetCurrent, list);
  }

  for (const list of before.values()) list.sort((a, b) => a - b);
  for (const list of after.values()) list.sort((a, b) => a - b);
  trailing.sort((a, b) => a - b);

  return { before, after, trailing };
}

const CompareBody = ({
  threadIndex,
  currentBlocks,
  comparedBlocks,
  pairs,
  threshold,
  swappedIds,
  insertedOrphans,
  hoveredId,
  onChunkEnter,
  onChunkLeave,
  onChunkClick,
  onOrphanToggle,
  setChunkRef,
}: CompareBodyProps) => {
  const pairsByCurrentIdx = useMemo(() => {
    const m = new Map<number, BlockPair>();
    for (const p of pairs) m.set(p.currentIdx, p);
    return m;
  }, [pairs]);

  const orphanPlacement = useMemo(
    () => placeOrphans(pairs, comparedBlocks.length),
    [pairs, comparedBlocks.length],
  );

  // Group current blocks by paragraphIdx, preserving order. Each entry is an
  // array of [block, currentIdx] tuples so we don't need to indexOf later.
  const paragraphs = useMemo(() => {
    const groups: { block: SemanticBlock; currentIdx: number }[][] = [];
    let curParaIdx = -1;
    currentBlocks.forEach((block, currentIdx) => {
      if (block.paragraphIdx !== curParaIdx) {
        groups.push([]);
        curParaIdx = block.paragraphIdx;
      }
      groups[groups.length - 1].push({ block, currentIdx });
    });
    return groups;
  }, [currentBlocks]);

  const renderOrphan = (cIdx: number) => {
    const inserted = insertedOrphans.has(cIdx);
    const id = orphanId(threadIndex, cIdx);
    const block = comparedBlocks[cIdx];
    if (!block) return null;
    const isHovered = hoveredId === id;

    if (inserted) {
      // Phantom inserted compared chunk — purple, full intensity.
      const bg = heatmapColor(ORPHAN_OPACITY, "purple");
      return (
        <Fragment key={`orphan-${cIdx}`}>
          <span
            ref={(el) => setChunkRef(id, el)}
            data-pair-id={id}
            onMouseEnter={() => onChunkEnter(id)}
            onMouseLeave={onChunkLeave}
            onClick={() => onOrphanToggle(cIdx)}
            className={cn(
              "rounded-sm transition-colors cursor-pointer",
              isHovered && "ring-1 ring-brand-purple-400",
            )}
            style={{ backgroundColor: bg }}
            aria-label="Remove inserted compared sentence"
          >
            <RichText text={block.text} inline />
          </span>
          {" "}
        </Fragment>
      );
    }

    return (
      <button
        key={`orphan-${cIdx}`}
        ref={(el) => setChunkRef(id, el)}
        data-pair-id={id}
        type="button"
        onMouseEnter={() => onChunkEnter(id)}
        onMouseLeave={onChunkLeave}
        onClick={() => onOrphanToggle(cIdx)}
        className={cn(
          "inline-flex items-center justify-center align-middle h-[1.25em] w-[1.25em] mx-0.5 rounded-sm border-2 transition-colors",
          "border-brand-purple-500 text-brand-purple-700 hover:bg-brand-purple-500 hover:text-white",
          isHovered && "bg-brand-purple-500 text-white",
        )}
        aria-label="Insert sentence from compared version"
        title="Insert sentence from compared version"
      >
        <Minus className="h-3 w-3" />
      </button>
    );
  };

  /**
   * Render a paired or unpaired sentence chunk inline. Used by both sentence
   * paragraphs and bullet paragraphs (after the bullet marker is peeled off).
   */
  const renderInlineChunk = (
    block: SemanticBlock,
    currentIdx: number,
    overrideText?: string,
  ) => {
    const pair = pairsByCurrentIdx.get(currentIdx);
    const id = pairId(threadIndex, currentIdx);
    const isPaired = !!pair && pair.comparedIdx != null;
    const swapped = isPaired && swappedIds.has(id);
    const comparedBlock = isPaired ? comparedBlocks[pair!.comparedIdx as number] : null;
    const sourceText = overrideText ?? block.text;
    const swappedSourceText = swapped && comparedBlock
      ? (overrideText !== undefined
          // Bullet path: peel marker off the compared block too so layout stays consistent.
          ? (comparedBlock.text.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/)?.[1] ?? comparedBlock.text)
          : comparedBlock.text)
      : sourceText;
    const isHovered = hoveredId === id;

    if (!isPaired) {
      return (
        <span key={block.id}>
          <RichText text={sourceText} inline />
        </span>
      );
    }

    const op = intensity(pair!.score, threshold);
    const variant: "blue" | "purple" = swapped ? "purple" : "blue";
    const bg = heatmapColor(op, variant);

    return (
      <span
        key={block.id}
        ref={(el) => setChunkRef(id, el)}
        data-pair-id={id}
        onMouseEnter={() => onChunkEnter(id)}
        onMouseLeave={onChunkLeave}
        onClick={() => {
          if (pair?.comparedIdx == null) return;
          onChunkClick(id, currentIdx, pair.comparedIdx);
        }}
        className={cn(
          "rounded-sm transition-colors cursor-pointer",
          isHovered && (swapped ? "ring-1 ring-brand-blue-400" : "ring-1 ring-brand-purple-400"),
        )}
        style={{ backgroundColor: bg }}
      >
        <RichText text={swappedSourceText} inline />
      </span>
    );
  };

  return (
    <div className="break-words leading-relaxed">
      {paragraphs.map((entries, pIdx) => {
        const isBulletPara = entries.length > 0 && entries.every((e) => e.block.kind === "bullet");

        if (isBulletPara) {
          return (
            <div key={`p${pIdx}`} className="my-2 space-y-1">
              {entries.map(({ block, currentIdx }) => {
                const orphansBefore = orphanPlacement.before.get(currentIdx) ?? [];
                const orphansAfter = orphanPlacement.after.get(currentIdx) ?? [];
                const m = block.text.match(/^(\s*(?:[-*•]|\d+[.)])\s+)(.*)$/);
                const marker = m?.[1] ?? "";
                const rest = m?.[2] ?? block.text;

                return (
                  <div key={block.id} style={{ display: "flex", alignItems: "flex-start" }}>
                    <span style={{ whiteSpace: "pre", flexShrink: 0 }}>{marker}</span>
                    <span className="flex-1 min-w-0">
                      {orphansBefore.map(renderOrphan)}
                      {renderInlineChunk(block, currentIdx, rest)}
                      {orphansAfter.map(renderOrphan)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }

        return (
          <p key={`p${pIdx}`} className="my-2">
            {entries.map(({ block, currentIdx }, bIdx) => {
              const orphansBefore = orphanPlacement.before.get(currentIdx) ?? [];
              const orphansAfter = orphanPlacement.after.get(currentIdx) ?? [];
              return (
                <Fragment key={block.id}>
                  {orphansBefore.map(renderOrphan)}
                  {renderInlineChunk(block, currentIdx)}
                  {orphansAfter.map(renderOrphan)}
                  {bIdx < entries.length - 1 && " "}
                </Fragment>
              );
            })}
          </p>
        );
      })}

      {orphanPlacement.trailing.length > 0 && (
        <p className="my-2 opacity-80">
          {orphanPlacement.trailing.map(renderOrphan)}
        </p>
      )}
    </div>
  );
};

export default CompareBody;
