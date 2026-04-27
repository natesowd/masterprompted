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
  onHeightChange?: (height: number) => void; // <-- 1. Add this line
}

const PADDING_BETWEEN_BLOCKS = 8;
// Fixed preview height for sidebar slots — keeps stacking math simple. Height
// fits ~3 lines of `text-sm` content plus padding; line-clamp truncates with
// an ellipsis when content overflows.
const SIDEBAR_PREVIEW_HEIGHT = 76;

const CompareView = ({
  currentText,
  comparedText,
  threadIndex,
  scrollContainerRef,
  sidebarContainer,
  onHeightChange, // <-- 2. Destructure it here
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
  // Also measures the body container's height in the same pass, since both the
  // sidebar wrapper height and the per-block tops depend on the body having
  // mounted — coordinating two separate effects against the conditional render
  // (loading → ready) was racing.
  const [bodyHeight, setBodyHeight] = useState(0);
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
    setBodyHeight((prev) =>
      Math.round(prev) === Math.round(container.offsetHeight) ? prev : container.offsetHeight,
    );
  }, [pairEntries, anchors.status, anchors.currentBlocks, swappedPairIds]);

  // Re-measure on resize/content change (e.g., fonts loading, viewport changes).
  useLayoutEffect(() => {
    if (anchors.status !== "ready") return;
    const container = bodyContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
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
      setBodyHeight((prev) =>
        Math.round(prev) === Math.round(container.offsetHeight) ? prev : container.offsetHeight,
      );
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [anchors.status, pairEntries]);

  useEffect(() => {
    onHeightChange?.(bodyHeight);
  }, [bodyHeight, onHeightChange]);

  // Track the chat column's visible height so the sidebar wrapper can extend
  // to fill the same vertical space as the chat body.
  const [chatColumnHeight, setChatColumnHeight] = useState(0);
  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const update = () => setChatColumnHeight(el.clientHeight);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    update();
    return () => observer.disconnect();
  }, [scrollContainerRef]);

  const handleClickPair = useCallback((pairId: string, hasCounterpart: boolean) => {
    if (!hasCounterpart) return;
    setSwappedPairIds((prev) => {
      const next = new Set(prev);
      if (next.has(pairId)) next.delete(pairId);
      else next.add(pairId);
      return next;
    });
  }, []);

  // Sidebar layout: each compared block is anchored as close as possible to
  // its parent body span's Y, but blocks stack downward so they never overlap.
  // Sort by parent Y ascending (topmost first); each subsequent slot is
  // placed at max(parentY, previousBottom + gap).
  // NOTE: this hook MUST live above the early returns below — placing it after
  // them caused "Rendered more hooks than during the previous render" because
  // the loading/error/idle paths skip it.
  const sidebarLayout = useMemo(() => {
    const withCompared = pairEntries
      .filter((p) => p.comparedIdx !== null)
      .map((p) => ({
        pairId: p.pairId,
        currentIdx: p.currentIdx,
        comparedIdx: p.comparedIdx as number,
        parentY: positions[p.pairId] ?? 0,
      }))
      .sort((a, b) => a.parentY - b.parentY);

    let cursor = 0;
    const placed = withCompared.map((p) => {
      const top = Math.max(p.parentY, cursor);
      cursor = top + SIDEBAR_PREVIEW_HEIGHT + PADDING_BETWEEN_BLOCKS;
      return { ...p, top };
    });
    return { items: placed, totalHeight: cursor };
  }, [pairEntries, positions]);

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

  // Each pair renders as its own block on its own line, with a dotted outline.
  // (Inline-span flow was tried, but reverted because the user prefers each
  // sentence on a separate line.)
  const body = (
    <div ref={bodyContainerRef} className="break-words leading-relaxed space-y-2">
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
              "rounded px-2 py-1 border-2 border-dotted transition-colors",
              // Default for matched-but-not-replaced: dotted gray.
              comparedBlock && !isCompared && !isFocused && "border-gray-400",
              // Hover (matched, not replaced): green.
              comparedBlock && isFocused && !isCompared && "border-green-500",
              // Replaced (user clicked to swap in compared text): blue.
              isCompared && "border-blue-500 text-blue-900",
              // Orphan (no counterpart in compared text): no visible outline.
              isOrphan && "border-transparent",
              comparedBlock && "cursor-pointer",
            )}
            aria-label={comparedBlock ? t("components.compareView.swapAria") : undefined}
          >
            <RichText text={displayBlock.text} inline diff />
          </div>
        );
      })}
    </div>
  );

  // Wrapper height matches the full chat column height (so the relative
  // container extends as far down as the chat body itself), with a fallback to
  // the natural stack height when the column hasn't been measured yet.
  const sidebarWrapperHeight = Math.max(sidebarLayout.totalHeight, bodyHeight, chatColumnHeight);
  // const sidebarWrapperHeight = 10000;
  const sidebarBlocks = (
    <div className="relative" style={{ height: `${sidebarWrapperHeight}px` }}>
      {sidebarLayout.items.map((item) => {
        const swapped = swappedPairIds.has(item.pairId);
        const currentBlock = anchors.currentBlocks[item.currentIdx];
        const comparedBlock = anchors.comparedBlocks[item.comparedIdx];
        const displayBlock = swapped ? currentBlock : comparedBlock;
        const isCurrent = swapped;
        const isFocused = hoveredPairId === item.pairId;

        return (
          <div
            key={item.pairId}
            id={`compare-sidebar-${item.pairId}`}
            onMouseEnter={() => setHoveredPairId(item.pairId)}
            onMouseLeave={() => setHoveredPairId(null)}
            onClick={() => handleClickPair(item.pairId, true)}
            style={{
              position: "absolute",
              top: `${item.top}px`,
              left: 0,
              right: 0,
              height: `${SIDEBAR_PREVIEW_HEIGHT}px`,
            }}
            className={cn(
              "p-2 rounded text-sm border cursor-pointer transition-colors overflow-hidden",
              isCurrent
                ? "bg-green-50 text-green-900 border-green-300"
                : "bg-blue-50 text-blue-800 border-blue-300",
              isFocused && (isCurrent ? "bg-green-100 ring-1 ring-green-400" : "bg-blue-100 ring-1 ring-blue-400"),
            )}
          >
            {/* Multi-line ellipsis preview — content shrinks to ~3 lines. */}
            <div className="line-clamp-3">
              <RichText text={displayBlock.text} inline diff />
            </div>
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
