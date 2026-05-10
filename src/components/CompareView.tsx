import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import RichText from "@/components/RichText";
import CompareBody from "@/components/CompareBody";
import CompareControls from "@/components/CompareControls";
import CompareRibbonTrack, { type RibbonItem } from "@/components/CompareRibbonTrack";
import CompareSidebarPanel, { type SidebarPanelData } from "@/components/CompareSidebarPanel";
import { useRelationalAnchors } from "@/hooks/useRelationalAnchors";
import { usePairedThreshold } from "@/hooks/usePairedThreshold";
import { useChunkRects } from "@/hooks/useChunkRects";
import { useSwapState } from "@/hooks/useSwapState";
import { useHoverIntent } from "@/hooks/useHoverIntent";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  currentText: string;
  comparedText: string;
  threadIndex: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  sidebarContainer: HTMLElement | null;
  onHeightChange?: (height: number) => void;
}

const DEFAULT_THRESHOLD = 0.55;

function clampThreshold(n: number): number {
  if (Number.isNaN(n)) return DEFAULT_THRESHOLD;
  return Math.max(0.05, Math.min(0.95, n));
}

function pairId(threadIndex: number, currentIdx: number): string {
  return `t${threadIndex}-p${currentIdx}`;
}
function orphanIdFor(threadIndex: number, comparedIdx: number): string {
  return `t${threadIndex}-orphan-c${comparedIdx}`;
}
function parseOrphanComparedIdx(id: string): number | null {
  const m = id.match(/-orphan-c(\d+)$/);
  return m ? Number.parseInt(m[1], 10) : null;
}
function parsePairCurrentIdx(id: string): number | null {
  const m = id.match(/-p(\d+)$/);
  return m ? Number.parseInt(m[1], 10) : null;
}

const CompareView = ({
  currentText,
  comparedText,
  threadIndex,
  scrollContainerRef: _scrollContainerRef,
  sidebarContainer,
  onHeightChange,
}: Props) => {
  const { t } = useLanguage();
  const anchors = useRelationalAnchors(currentText, comparedText, true);

  // Threshold (debounced live). Always resets to the default when the view
  // mounts — user-tuned thresholds are scoped to one comparison session.
  const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);
  const handleThresholdChange = useCallback((next: number) => {
    setThreshold(clampThreshold(next));
  }, []);

  // Swap state — reset only when text changes (not on threshold drag).
  const swapResetKey = `${currentText.length}::${comparedText.length}::${currentText.slice(0, 32)}`;
  const swap = useSwapState(swapResetKey);

  // Re-pair greedily over cached vectors. Frozen pairs survive threshold drops.
  const pairs = usePairedThreshold(
    anchors.currentVecs,
    anchors.comparedVecs,
    threshold,
    swap.frozenSwapMap,
  );

  // Single shared hover state across body chunks, ribbons, and the panel.
  const hover = useHoverIntent(150);

  // Track DOM nodes for measurement (callback ref pattern).
  const chunkElsRef = useRef<Map<string, HTMLElement>>(new Map());
  const setChunkRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) chunkElsRef.current.set(id, el);
    else chunkElsRef.current.delete(id);
  }, []);
  const getChunkEl = useCallback((id: string) => chunkElsRef.current.get(id) ?? null, []);

  const bodyContainerRef = useRef<HTMLDivElement>(null);

  // Build the list of chunk ids that need rect measurement.
  // Includes: paired chunks (for ribbons + panel), inserted orphans (ribbons + panel),
  // and not-yet-inserted orphan minus-icons (panel only — hovering an icon shows the
  // would-be-inserted text in the sidebar, just like hovering a paired chunk).
  const measuredIds = useMemo(() => {
    const ids: string[] = [];
    const pairedComparedIdx = new Set<number>();
    for (const p of pairs) {
      if (p.comparedIdx != null) {
        ids.push(pairId(threadIndex, p.currentIdx));
        pairedComparedIdx.add(p.comparedIdx);
      }
    }
    for (let cIdx = 0; cIdx < anchors.comparedBlocks.length; cIdx++) {
      if (pairedComparedIdx.has(cIdx)) continue;
      ids.push(orphanIdFor(threadIndex, cIdx));
    }
    return ids;
  }, [pairs, anchors.comparedBlocks.length, threadIndex]);

  const rects = useChunkRects(
    bodyContainerRef,
    measuredIds,
    getChunkEl,
    [pairs, swap.swappedIds, swap.insertedOrphans, threshold],
  );

  // Track body container height so the sidebar portal wrapper can match.
  const [bodyHeight, setBodyHeight] = useState(0);
  useLayoutEffect(() => {
    const el = bodyContainerRef.current;
    if (!el) return;
    const update = () => {
      const h = el.offsetHeight;
      setBodyHeight((prev) => (Math.round(prev) === Math.round(h) ? prev : h));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [anchors.status, pairs, swap.insertedOrphans]);

  useEffect(() => {
    onHeightChange?.(bodyHeight);
  }, [bodyHeight, onHeightChange]);

  // Compute the offset between the body container's screen position and the
  // sidebar container's, so we can map body-relative chunk Y values into the
  // sidebar container's coord space (the two are siblings in different columns).
  const [bodyToSidebarOffsetY, setBodyToSidebarOffsetY] = useState(0);
  useLayoutEffect(() => {
    const body = bodyContainerRef.current;
    if (!body || !sidebarContainer) return;
    const update = () => {
      const bodyRect = body.getBoundingClientRect();
      const sideRect = sidebarContainer.getBoundingClientRect();
      const delta = bodyRect.top - sideRect.top;
      setBodyToSidebarOffsetY((prev) => (Math.round(prev) === Math.round(delta) ? prev : delta));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(body);
    observer.observe(sidebarContainer);
    return () => observer.disconnect();
  }, [sidebarContainer, anchors.status, pairs.length]);

  // Click handlers — both body chunk and ribbon route through the same paths.
  const handleChunkClick = useCallback(
    (id: string, currentIdx: number, comparedIdx: number) => {
      swap.toggleSwap(id, currentIdx, comparedIdx);
    },
    [swap],
  );
  const handleRibbonClick = useCallback(
    (id: string) => {
      const orphanIdx = parseOrphanComparedIdx(id);
      if (orphanIdx != null) {
        swap.toggleOrphan(orphanIdx);
        return;
      }
      const cIdx = parsePairCurrentIdx(id);
      if (cIdx == null) return;
      const pair = pairs.find((p) => p.currentIdx === cIdx);
      if (!pair || pair.comparedIdx == null) return;
      swap.toggleSwap(id, cIdx, pair.comparedIdx);
    },
    [pairs, swap],
  );

  // Build ribbon items from measured rects.
  const ribbonItems: RibbonItem[] = useMemo(() => {
    const items: RibbonItem[] = [];
    for (const p of pairs) {
      if (p.comparedIdx == null) continue;
      const id = pairId(threadIndex, p.currentIdx);
      const rect = rects[id];
      if (!rect) continue;
      const swapped = swap.swappedIds.has(id);
      // Variant rule (per UX spec): ribbon color = the version of text that's the ALTERNATIVE
      // to what the body is currently showing. Default body shows main → ribbon purple (compared).
      // After swap, body shows compared → ribbon blue (main, the alternative).
      items.push({
        pairId: id,
        rect,
        variant: swapped ? "main" : "compared",
      });
    }
    for (const cIdx of swap.insertedOrphans) {
      const id = orphanIdFor(threadIndex, cIdx);
      const rect = rects[id];
      if (!rect) continue;
      // Inserted orphan: body is showing compared text — alternative is "no counterpart" (still purple, since the chunk itself is compared).
      items.push({ pairId: id, rect, variant: "compared", isOrphan: true });
    }
    return items;
  }, [pairs, rects, swap.swappedIds, swap.insertedOrphans, threadIndex]);

  // Sidebar panel content — derived from hovered id.
  const panelData: SidebarPanelData | null = useMemo(() => {
    const id = hover.hoveredId;
    if (!id) return null;
    const rect = rects[id];
    if (!rect) return null;
    const anchorTop = rect.top + bodyToSidebarOffsetY;

    const orphanIdx = parseOrphanComparedIdx(id);
    if (orphanIdx != null) {
      const block = anchors.comparedBlocks[orphanIdx];
      if (!block) return null;
      const inserted = swap.insertedOrphans.has(orphanIdx);
      // For an inserted orphan, the body is already showing this text → panel notes "no counterpart".
      // For a not-yet-inserted orphan icon, panel previews the compared text the user is about to insert.
      return {
        text: inserted
          ? "(No counterpart in current version — click to remove insertion.)"
          : block.text,
        anchorTop,
        variant: "compared",
        isOrphan: true,
      };
    }

    const cIdx = parsePairCurrentIdx(id);
    if (cIdx == null) return null;
    const pair = pairs.find((p) => p.currentIdx === cIdx);
    if (!pair || pair.comparedIdx == null) return null;
    const swapped = swap.swappedIds.has(id);
    const currentBlock = anchors.currentBlocks[cIdx];
    const comparedBlock = anchors.comparedBlocks[pair.comparedIdx];
    if (!currentBlock || !comparedBlock) return null;
    return {
      text: swapped ? currentBlock.text : comparedBlock.text,
      anchorTop,
      variant: swapped ? "main" : "compared",
      score: pair.score,
    };
  }, [hover.hoveredId, rects, bodyToSidebarOffsetY, pairs, swap.swappedIds, swap.insertedOrphans, anchors.currentBlocks, anchors.comparedBlocks]);

  // Loading / error / idle fallbacks.
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

  if (anchors.status === "idle" || anchors.currentBlocks.length === 0) {
    return <RichText text={currentText} prose={false} />;
  }

  return (
    <>
      <CompareControls threshold={threshold} onChange={handleThresholdChange} />

      <div ref={bodyContainerRef} className="relative pr-3">
        <CompareBody
          threadIndex={threadIndex}
          currentBlocks={anchors.currentBlocks}
          comparedBlocks={anchors.comparedBlocks}
          pairs={pairs}
          threshold={threshold}
          swappedIds={swap.swappedIds}
          insertedOrphans={swap.insertedOrphans}
          hoveredId={hover.hoveredId}
          onChunkEnter={hover.onEnter}
          onChunkLeave={hover.onLeave}
          onChunkClick={handleChunkClick}
          onOrphanToggle={swap.toggleOrphan}
          setChunkRef={setChunkRef}
        />
        <CompareRibbonTrack
          items={ribbonItems}
          hoveredId={hover.hoveredId}
          onEnter={hover.onEnter}
          onLeave={hover.onLeave}
          onClick={handleRibbonClick}
        />
      </div>

      {sidebarContainer &&
        createPortal(
          <div
            className="relative"
            style={{ minHeight: `${Math.max(bodyHeight, 40)}px` }}
            onMouseLeave={hover.onLeave}
          >
            <CompareSidebarPanel data={panelData} onEnter={() => hover.hoveredId && hover.onEnter(hover.hoveredId)} onLeave={hover.onLeave} />
          </div>,
          sidebarContainer,
        )}
    </>
  );
};

export default CompareView;
