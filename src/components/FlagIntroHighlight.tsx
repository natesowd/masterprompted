/**
 * FlagIntroHighlight
 *
 * A guided tooltip shown the first time a user encounters an annotated /
 * flagged piece of text in the guided simulator. It explains:
 *   - What the highlight means (hover / click to read more)
 *   - The red / yellow / green traffic-light severity system
 *
 * Shared between the `TextFlag` component and the NWP `BranchDiagram`
 * flagged-word pills so either one can trigger the intro.
 *
 * The intro runs at most once per browser — it is gated on a localStorage
 * key. Close the highlight and it won't reappear unless the key is
 * cleared. A module-level singleton ensures only one intersection event
 * (across all mounted flag instances on the page) claims the highlight.
 */

import { useEffect, useRef, useState } from "react";
import FeatureHighlight from "@/components/FeatureHighlight";

export const INTRO_STORAGE_KEY = "textflag-intro-shown";

// Module-level singleton so only one flag wins the claim at a time.
let introHighlightClaimed = false;

/**
 * Hook: manages state for the intro highlight on a single flag instance.
 *
 * Call from any component that renders a highlightable/annotated element.
 * Spread the returned id onto the element and render <FlagIntroHighlight />
 * with the returned state.
 */
export function useFlagIntroHighlight() {
  const [show, setShow] = useState(false);
  const idRef = useRef(`flag-intro-${Math.random().toString(36).slice(2, 9)}`);
  const id = idRef.current;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(INTRO_STORAGE_KEY)) return;
    } catch {
      /* ignore — storage might be disabled */
    }
    if (introHighlightClaimed) return;

    const el = document.getElementById(id);
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !introHighlightClaimed) {
            introHighlightClaimed = true;
            observer.disconnect();
            // Small delay so FeatureHighlight measurement is stable after
            // any layout / scroll / animation settles.
            window.setTimeout(() => setShow(true), 350);
            return;
          }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  const close = () => {
    try {
      localStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return { id, show, close };
}

/**
 * Component: renders the FeatureHighlight tooltip with the intro copy.
 */
interface FlagIntroHighlightProps {
  targetId: string;
  open: boolean;
  onClose: () => void;
}

export default function FlagIntroHighlight({
  targetId,
  open,
  onClose,
}: FlagIntroHighlightProps) {
  if (!open) return null;
  return (
    <FeatureHighlight
      target={`#${targetId}`}
      open={open}
      onClose={onClose}
      side="bottom"
      closeLabel="Got it"
    >
      <div className="space-y-3">
        <p className="font-semibold text-base">Highlighted text</p>
        <p>
          Whenever you see an{" "}
          <span className="underline decoration-white/80 decoration-2 underline-offset-2">
            underlined or highlighted phrase
          </span>
          , hover over it or click it to read an explanation of why it&apos;s been
          flagged.
        </p>
        <div className="pt-1">
          <p className="font-semibold text-sm mb-2">Colour shows severity:</p>
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
              <span>
                <strong>Red</strong> — a big problem (e.g. fabricated quote,
                factual error)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-yellow-300 flex-shrink-0" />
              <span>
                <strong>Yellow</strong> — potentially dangerous (e.g. misleading
                tone)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-green-300 flex-shrink-0" />
              <span>
                <strong>Green</strong> — something the model did well
              </span>
            </li>
          </ul>
        </div>
      </div>
    </FeatureHighlight>
  );
}
