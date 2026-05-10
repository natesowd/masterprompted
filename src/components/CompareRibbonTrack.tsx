import { cn } from "@/lib/utils";
import type { ChunkRect } from "@/hooks/useChunkRects";

export interface RibbonItem {
  pairId: string;
  rect: ChunkRect;
  /** purple = alternative is in the compared version; blue = alternative is in the main version (i.e. user has swapped). */
  variant: "compared" | "main";
  isOrphan?: boolean;
}

interface Props {
  items: RibbonItem[];
  hoveredId: string | null;
  onEnter: (pairId: string) => void;
  onLeave: () => void;
  onClick: (pairId: string) => void;
}

const RIBBON_WIDTH_PX = 4;
const RIBBON_HOVER_WIDTH_PX = 8;

/**
 * Right-edge ribbon strip — one segment per paired body chunk, vertically aligned
 * to its rendered text via Range-measured rects from `useChunkRects`.
 */
const CompareRibbonTrack = ({ items, hoveredId, onEnter, onLeave, onClick }: Props) => {
  return (
    <div
      className="absolute top-0 right-0 h-full pointer-events-none"
      style={{ width: `${RIBBON_HOVER_WIDTH_PX + 2}px` }}
      aria-hidden={false}
    >
      {items.map((item) => {
        const isHovered = hoveredId === item.pairId;
        const width = isHovered ? RIBBON_HOVER_WIDTH_PX : RIBBON_WIDTH_PX;
        const tone = item.variant === "compared"
          ? "bg-brand-purple-500"
          : "bg-brand-blue-500";
        return (
          <button
            key={item.pairId}
            type="button"
            onMouseEnter={() => onEnter(item.pairId)}
            onMouseLeave={onLeave}
            onClick={() => onClick(item.pairId)}
            className={cn(
              "absolute right-0 rounded-l-sm transition-[width,opacity] cursor-pointer pointer-events-auto",
              tone,
              isHovered ? "opacity-100" : "opacity-70 hover:opacity-100",
            )}
            style={{
              top: `${item.rect.top}px`,
              height: `${Math.max(4, item.rect.height)}px`,
              width: `${width}px`,
            }}
            aria-label={`Toggle alternative for chunk ${item.pairId}`}
          />
        );
      })}
    </div>
  );
};

export default CompareRibbonTrack;
