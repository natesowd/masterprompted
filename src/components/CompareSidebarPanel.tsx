import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";

export interface SidebarPanelData {
  /** Text shown in the panel — always the *complement* of what's currently in the body. */
  text: string;
  /** Approximate Y position of the source chunk in the body (px from container top). */
  anchorTop: number;
  /** Whether the panel content is from the compared version (purple) or main version (blue, only when swapped). */
  variant: "compared" | "main";
  /** Whether this panel represents an orphan-compared insertion (no main counterpart). */
  isOrphan?: boolean;
  /** Cosine similarity score (0..1) for paired chunks; omitted for orphans. Shown as a "% similar" footnote. */
  score?: number;
}

interface Props {
  data: SidebarPanelData | null;
  onEnter: () => void;
  onLeave: () => void;
}

/**
 * The on-demand sidebar panel. Shown for ONE chunk at a time when the user
 * hovers a body chunk, its right-edge ribbon, or this panel itself.
 *
 * Color coding:
 *   variant="compared" → purple (alternative text, body is showing main).
 *   variant="main"     → blue (alternative text, body is currently swapped to compared).
 */
const CompareSidebarPanel = ({ data, onEnter, onLeave }: Props) => {
  if (!data) {
    return (
      <div className="text-xs text-muted-foreground/70 italic p-3">
        Hover a chunk or ribbon to preview the alternative.
      </div>
    );
  }

  const tone = data.variant === "compared"
    ? "border-brand-purple-300 bg-brand-purple-50 text-brand-purple-900"
    : "border-brand-blue-300 bg-brand-blue-50 text-brand-blue-900";

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute left-0 right-0 px-1 transition-[top] duration-150 ease-out"
      style={{ top: `${Math.max(0, data.anchorTop - 8)}px` }}
    >
      <div className={cn("rounded-md border-2 p-3 shadow-sm text-sm leading-relaxed break-words", tone)}>
        {data.isOrphan && (
          <div className="text-[10px] uppercase tracking-wide opacity-70 mb-1">
            Compared-only
          </div>
        )}
        <RichText text={data.text} inline />
        {typeof data.score === "number" && data.score > 0 && (
          <p className="text-xs text-muted-foreground italic mt-2">
            {Math.round(data.score * 100)}% similar
          </p>
        )}
      </div>
    </div>
  );
};

export default CompareSidebarPanel;
