import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";
import RichText from "@/components/RichText";
import { useRelationalAnchors } from "@/hooks/useRelationalAnchors";

interface Props {
  currentText: string;
  comparedText: string;
  threadIndex: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  sidebarContainer: HTMLElement | null;
  onHeightChange?: (height: number) => void;
}

const PADDING_BETWEEN_BLOCKS = 8;

const CompareView = ({
  currentText,
  comparedText,
  threadIndex,
  scrollContainerRef,
  sidebarContainer,
  onHeightChange,
}: Props) => {
  const { t } = useLanguage();
  const anchors = useRelationalAnchors(currentText, comparedText, true);
  const [swappedPairIds, setSwappedPairIds] = useState<Set<string>>(() => new Set());
  const [hoveredPairId, setHoveredPairId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, number>>({});

  const bodyRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const bodyContainerRef = useRef<HTMLDivElement>(null);

  // When text changes, drop stale swaps.
  useEffect(() => {
    setSwappedPairIds(new Set());
  }, [currentText, comparedText]);

  const pairEntries = useMemo(() => {
    return anchors.pairs.map((pair) => ({
      ...pair,
      pairId: `t${threadIndex}-p${pair.currentIdx}`,
    }));
  }, [anchors.pairs, threadIndex]);

  // Measure Y offsets of each body block so the sidebar counterparts can line up.
  useLayoutEffect(() => {
    if (anchors.status !== "ready") return;
    const container = bodyContainerRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;
    const next: Record<string, number> = {};
    pairEntries.forEach(({ pairId }) => {
      const el = bodyRefs.current.get(pairId);
      if (el) {
        next[pairId] = el.getBoundingClientRect().top - containerTop;
      }
    });
    setPositions((prev) => {
      let changed = Object.keys(prev).length !== Object.keys(next).length;
      if (!changed) {
        for (const k in next) {
          if (Math.round(prev[k] ?? -1) !== Math.round(next[k])) {
            changed = true;
            break;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [pairEntries, anchors.status, anchors.currentBlocks, swappedPairIds]);

  // Resolve non-overlapping sidebar positions, preserving order.
  const sidebarPositions = useMemo(() => {
    const placed = new Map<string, number>();
    let minTop = 0;
    const ordered = pairEntries
      .map((p) => ({ pairId: p.pairId, anchor: positions[p.pairId] ?? 0 }))
      .sort((a, b) => a.anchor - b.anchor);
    for (const { pairId, anchor } of ordered) {
      const top = Math.max(anchor, minTop);
      placed.set(pairId, top);
      const el = document.getElementById(`compare-sidebar-${pairId}`);
      const h = el?.offsetHeight ?? 48;
      minTop = top + h + PADDING_BETWEEN_BLOCKS;
    }
    return placed;
  }, [pairEntries, positions]);

  const minSidebarHeight = useMemo(() => {
    let max = 0;
    sidebarPositions.forEach((top, pairId) => {
      const el = document.getElementById(`compare-sidebar-${pairId}`);
      const h = el?.offsetHeight ?? 48;
      if (top + h > max) max = top + h;
    });
    return max;
  }, [sidebarPositions]);

  useEffect(() => {
    onHeightChange?.(minSidebarHeight);
  }, [minSidebarHeight, onHeightChange]);

  const handleClickPair = useCallback((pairId: string, hasCounterpart: boolean) => {
    if (!hasCounterpart) return;
    setSwappedPairIds((prev) => {
      const next = new Set(prev);
      if (next.has(pairId)) next.delete(pairId);
      else next.add(pairId);
      return next;
    });
  }, []);

  if (anchors.status === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t("components.compareView.loading")}</span>
      </div>
    );
  }

  if (anchors.status === "error") {
    return (
      <div className="text-sm text-red-600 py-4">
        {t("components.compareView.error")}: {anchors.error}
      </div>
    );
  }

  if (anchors.status === "idle" || pairEntries.length === 0) {
    return <RichText text={currentText} prose={false} />;
  }

  const body = (
    <div ref={bodyContainerRef} className="whitespace-pre-wrap break-words space-y-2">
      {pairEntries.map(({ pairId, currentIdx, comparedIdx }) => {
        const swapped = swappedPairIds.has(pairId);
        const currentBlock = anchors.currentBlocks[currentIdx];
        const comparedBlock = comparedIdx !== null ? anchors.comparedBlocks[comparedIdx] : null;
        const displayBlock = swapped && comparedBlock ? comparedBlock : currentBlock;
        const isOrphan = comparedIdx === null;
        const isCompared = swapped && !!comparedBlock;
        const isFocused = hoveredPairId === pairId;

        return (
          <div
            key={pairId}
            ref={(el) => bodyRefs.current.set(pairId, el)}
            id={`compare-body-${pairId}`}
            data-pair-id={pairId}
            onMouseEnter={() => setHoveredPairId(pairId)}
            onMouseLeave={() => setHoveredPairId(null)}
            onClick={() => handleClickPair(pairId, !!comparedBlock)}
            className={cn(
              "rounded px-2 py-1 border-l-2 transition-colors",
              isCompared
                ? "border-red-400 bg-red-50 text-red-900"
                : "border-green-400 bg-green-50 text-green-900",
              isOrphan && "border-dashed border-muted-foreground/40 bg-transparent text-foreground",
              comparedBlock && "cursor-pointer",
              isFocused && (isCompared ? "bg-red-100 ring-1 ring-red-300" : "bg-green-100 ring-1 ring-green-300"),
            )}
            aria-label={comparedBlock ? t("components.compareView.swapAria") : undefined}
          >
            <RichText text={displayBlock.text} inline diff />
          </div>
        );
      })}
    </div>
  );

  const sidebarBlocks = (
    <div className="relative min-h-full" style={{ height: `${minSidebarHeight}px` }}>
      {pairEntries.map(({ pairId, currentIdx, comparedIdx }) => {
        const swapped = swappedPairIds.has(pairId);
        const currentBlock = anchors.currentBlocks[currentIdx];
        const comparedBlock = comparedIdx !== null ? anchors.comparedBlocks[comparedIdx] : null;
        if (!comparedBlock) return null;

        const displayBlock = swapped ? currentBlock : comparedBlock;
        const isCurrent = swapped;
        const top = sidebarPositions.get(pairId) ?? 0;
        const isFocused = hoveredPairId === pairId;

        return (
          <div
            key={pairId}
            id={`compare-sidebar-${pairId}`}
            onMouseEnter={() => setHoveredPairId(pairId)}
            onMouseLeave={() => setHoveredPairId(null)}
            onClick={() => handleClickPair(pairId, true)}
            style={{ top: `${top}px` }}
            className={cn(
              "absolute w-full p-2 rounded text-sm border cursor-pointer transition-colors",
              isCurrent
                ? "bg-green-50 text-green-900 border-green-300"
                : "bg-red-50 text-red-800 border-red-300",
              isFocused && (isCurrent ? "bg-green-100 ring-1 ring-green-400" : "bg-red-100 ring-1 ring-red-400"),
            )}
          >
            <RichText text={displayBlock.text} inline diff />
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {body}
      {sidebarContainer && createPortal(sidebarBlocks, sidebarContainer)}
    </>
  );
};

export default CompareView;
