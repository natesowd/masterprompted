import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeatureHighlightProps {
  /** CSS selector for the element to highlight */
  target: string;
  /** Content to display in the tooltip */
  children: React.ReactNode;
  /** Whether the highlight is visible */
  open: boolean;
  /** Called when the user closes the highlight */
  onClose: () => void;
  /** Which side of the target to show the tooltip */
  side?: "top" | "bottom" | "left" | "right";
  /** Offset from the target element in px */
  sideOffset?: number;
  /** Custom close button text */
  closeLabel?: string;
}

/**
 * FeatureHighlight - A guided tooltip component that dims the screen,
 * cuts out a highlighted element, and shows a styled callout with a
 * connector line + dot, matching the brand green style.
 */
export default function FeatureHighlight({
  target,
  children,
  open,
  onClose,
  side = "right",
  sideOffset = 24,
  closeLabel,
}: FeatureHighlightProps) {
  const { t } = useLanguage();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [borderRadius, setBorderRadius] = useState(0);
  const CUTOUT_PADDING = 8;

  const measure = useCallback(() => {
    const el = document.querySelector<HTMLElement>(target);
    if (el) {
      setRect(el.getBoundingClientRect());
      const computedRadius = parseFloat(window.getComputedStyle(el).borderRadius) || 0;
      setBorderRadius(Math.max(computedRadius, 12));
    }
  }, [target]);

  // Measure on open & resize/scroll
  useEffect(() => {
    if (!open) return;
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, measure]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !rect) return null;

  // Compute tooltip position & connector line
  const DOT_R = 6;
  let tooltipStyle: React.CSSProperties = {};
  let dotCx: number, dotCy: number, lineX1: number, lineY1: number, lineX2: number, lineY2: number;

  // The tooltip is placed at sideOffset + DOT_R from the rect edge.
  // The line runs from the dot (at DOT_R from edge) to the tooltip card.
  const tooltipGap = sideOffset + DOT_R;

  switch (side) {
    case "right":
      dotCx = rect.right + CUTOUT_PADDING + DOT_R;
      dotCy = rect.top + rect.height / 2;
      lineX1 = dotCx;
      lineY1 = dotCy;
      lineX2 = rect.right + CUTOUT_PADDING + tooltipGap;
      lineY2 = dotCy;
      tooltipStyle = { left: rect.right + CUTOUT_PADDING + tooltipGap, top: rect.top + rect.height / 2, transform: "translateY(-50%)" };
      break;
    case "left":
      dotCx = rect.left - CUTOUT_PADDING - DOT_R;
      dotCy = rect.top + rect.height / 2;
      lineX1 = dotCx;
      lineY1 = dotCy;
      lineX2 = rect.left - CUTOUT_PADDING - tooltipGap;
      lineY2 = dotCy;
      tooltipStyle = { right: window.innerWidth - rect.left + CUTOUT_PADDING + tooltipGap, top: rect.top + rect.height / 2, transform: "translateY(-50%)" };
      break;
    case "bottom":
      dotCx = rect.left + rect.width / 2;
      dotCy = rect.bottom + CUTOUT_PADDING + DOT_R;
      lineX1 = dotCx;
      lineY1 = dotCy;
      lineX2 = dotCx;
      lineY2 = rect.bottom + CUTOUT_PADDING + tooltipGap;
      tooltipStyle = { left: rect.left + rect.width / 2, top: rect.bottom + CUTOUT_PADDING + tooltipGap, transform: "translateX(-50%)" };
      break;
    case "top":
      dotCx = rect.left + rect.width / 2;
      dotCy = rect.top - CUTOUT_PADDING - DOT_R;
      lineX1 = dotCx;
      lineY1 = dotCy;
      lineX2 = dotCx;
      lineY2 = rect.top - CUTOUT_PADDING - tooltipGap;
      tooltipStyle = { left: rect.left + rect.width / 2, bottom: window.innerHeight - rect.top + CUTOUT_PADDING + tooltipGap, transform: "translateX(-50%)" };
      break;
  }

  const maskId = "feature-highlight-mask";

  return createPortal(
    <div className="fixed inset-0 z-[9999]" onClick={onClose}>
      {/* SVG overlay with cutout */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={maskId} x="0" y="0" width="100%" height="100%">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - CUTOUT_PADDING}
              y={rect.top - CUTOUT_PADDING}
              width={rect.width + CUTOUT_PADDING * 2}
              height={rect.height + CUTOUT_PADDING * 2}
              rx={borderRadius + CUTOUT_PADDING / 2}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0" y="0"
          width="100%" height="100%"
          fill="rgba(0,0,0,0.55)"
          mask={`url(#${maskId})`}
        />
        {/* Connector dot */}
        <circle cx={dotCx} cy={dotCy} r={DOT_R} className="fill-brand-tertiary-500" />
        {/* Connector line */}
        <line
          x1={lineX1} y1={lineY1}
          x2={lineX2} y2={lineY2}
          className="stroke-brand-tertiary-500"
          strokeWidth={2}
        />
      </svg>

      {/* Tooltip card */}
      <div
        className="fixed z-[10000] max-w-sm rounded-2xl bg-brand-tertiary-500 px-6 py-5 shadow-xl"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white text-sm font-medium leading-relaxed mb-4">
          {children}
        </div>
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full px-5 font-semibold text-brand-tertiary-500 bg-white hover:bg-white/90"
            onClick={onClose}
          >
            {closeLabel || t('components.popoverSeries.gotIt')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
