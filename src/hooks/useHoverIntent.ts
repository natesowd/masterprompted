import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Single shared hover state for chunks/ribbons/sidebar panel. The close delay
 * is what lets the user's cursor travel from a body chunk to the sidebar panel
 * without the panel disappearing en route.
 *
 * Pattern: each interactive element calls `onEnter(id)` on mouseenter and
 * `onLeave()` on mouseleave; the hook coalesces these so a leave-then-enter
 * within `closeDelayMs` is treated as continuous hover.
 */
export function useHoverIntent(closeDelayMs: number = 150) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const onEnter = useCallback((id: string) => {
    clearTimer();
    setHoveredId(id);
  }, []);

  const onLeave = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setHoveredId(null);
      timerRef.current = null;
    }, closeDelayMs);
  }, [closeDelayMs]);

  useEffect(() => () => clearTimer(), []);

  return { hoveredId, onEnter, onLeave };
}
