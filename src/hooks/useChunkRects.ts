import { RefObject, useEffect, useState } from "react";

export interface ChunkRect {
  top: number;
  height: number;
}

/**
 * Measures vertical extent of named DOM nodes inside a container, using
 * `Range.getClientRects()` so that line-wrapped inline spans report the
 * full first-line-top → last-line-bottom span (not the misleading union
 * `getBoundingClientRect` returns at line edges).
 *
 * `getElement` resolves a chunk id to a live DOM node — typically backed by
 * a Map<id, HTMLElement> kept in a ref by the consumer.
 */
export function useChunkRects(
  containerRef: RefObject<HTMLElement>,
  chunkIds: string[],
  getElement: (id: string) => HTMLElement | null,
  deps: ReadonlyArray<unknown>,
): Record<string, ChunkRect> {
  const [rects, setRects] = useState<Record<string, ChunkRect>>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const measure = () => {
      rafId = null;
      const containerTop = container.getBoundingClientRect().top;
      const next: Record<string, ChunkRect> = {};
      const range = document.createRange();
      for (const id of chunkIds) {
        const el = getElement(id);
        if (!el) continue;
        try {
          range.selectNodeContents(el);
          const lineRects = range.getClientRects();
          if (lineRects.length === 0) {
            const r = el.getBoundingClientRect();
            next[id] = { top: r.top - containerTop, height: r.height };
            continue;
          }
          const first = lineRects[0];
          const last = lineRects[lineRects.length - 1];
          next[id] = {
            top: first.top - containerTop,
            height: Math.max(0, last.bottom - first.top),
          };
        } catch {
          const r = el.getBoundingClientRect();
          next[id] = { top: r.top - containerTop, height: r.height };
        }
      }
      range.detach?.();

      setRects((prev) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (prevKeys.length !== nextKeys.length) return next;
        for (const k of nextKeys) {
          const a = prev[k];
          const b = next[k];
          if (!a || Math.round(a.top) !== Math.round(b.top) || Math.round(a.height) !== Math.round(b.height)) {
            return next;
          }
        }
        return prev;
      });
    };

    const schedule = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(measure);
    };

    schedule();

    const observer = new ResizeObserver(schedule);
    observer.observe(container);

    // Late-loading fonts shift line breaks; re-measure once they're ready.
    if (typeof document !== "undefined" && (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts) {
      (document as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready.then(schedule).catch(() => {});
    }

    return () => {
      observer.disconnect();
      if (rafId != null) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, chunkIds.join("|"), ...deps]);

  return rects;
}
