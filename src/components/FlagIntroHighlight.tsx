/**
 * FlagIntroHighlight
 *
 * A global, mount-once component that shows an intro tooltip the first
 * time a user encounters a highlighted / flagged piece of content anywhere
 * in the app. It explains:
 *   - That highlighted text is hoverable / clickable for details
 *   - The red / yellow / green traffic-light severity system
 *
 * Any component that renders a flagged element just needs to add the
 * attribute `data-flag-intro` (no value needed). The first such element
 * that becomes visible in the viewport wins the intro. The highlight
 * is gated on a localStorage key so it only ever fires once per browser.
 *
 * Mount this component once at the application root.
 */

import { useEffect, useState } from "react";
import FeatureHighlight from "@/components/FeatureHighlight";
import { local, STORAGE_KEYS } from "@/lib/storage";

const TARGET_ID = "flag-intro-target";
// Module-level singleton so React StrictMode's double-mount and multiple
// instances of this component (dev only) can't cause races.
let introClaimed = false;

function isElementVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  // Require at least partial visibility
  return rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw;
}

export default function FlagIntroHighlight() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (local.get(STORAGE_KEYS.INTRO_HIGHLIGHT_SEEN)) return;
    if (introClaimed) return;

    let mo: MutationObserver | null = null;
    let timerId: number | null = null;
    let intervalId: number | null = null;
    let claimedLocal = false;

    const tryClaim = () => {
      if (introClaimed || claimedLocal) {
        mo?.disconnect();
        if (intervalId != null) window.clearInterval(intervalId);
        return;
      }
      // Defer if another FeatureHighlight (or any modal) is currently
      // active — they lock body.scroll. We'll retry on the next mutation,
      // scroll, or interval tick once that finishes.
      if (document.body.style.overflow === "hidden") return;

      const els = document.querySelectorAll<HTMLElement>("[data-flag-intro]");
      for (const el of els) {
        if (isElementVisible(el)) {
          introClaimed = true;
          claimedLocal = true;
          // Mark the specific element so FeatureHighlight can target it
          el.id = TARGET_ID;
          mo?.disconnect();
          if (intervalId != null) window.clearInterval(intervalId);
          // Small delay so FeatureHighlight measurement is stable after
          // any layout / scroll / animation settles.
          timerId = window.setTimeout(() => setShow(true), 350);
          return;
        }
      }
    };

    // Initial attempt (likely a no-op; routes may not be mounted yet)
    tryClaim();
    if (claimedLocal) return;

    // Watch DOM for new flagged elements and for body style changes
    // (so we re-try once any blocking modal closes).
    mo = new MutationObserver(() => tryClaim());
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-flag-intro", "class", "style"],
    });

    const onScrollOrResize = () => tryClaim();
    window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", onScrollOrResize);

    // Polling fallback in case Mutation/scroll events miss the moment
    // (e.g., the existing NWP 3-step tutorial finishing without further
    //  DOM changes). Cheap — just a querySelectorAll every 1.5s until claimed.
    intervalId = window.setInterval(() => tryClaim(), 1500);

    return () => {
      mo?.disconnect();
      if (timerId != null) window.clearTimeout(timerId);
      if (intervalId != null) window.clearInterval(intervalId);
      window.removeEventListener("scroll", onScrollOrResize, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  const handleClose = () => {
    local.set(STORAGE_KEYS.INTRO_HIGHLIGHT_SEEN, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <FeatureHighlight
      target={`#${TARGET_ID}`}
      open={show}
      onClose={handleClose}
      side="bottom"
      closeLabel="Got it"
    >
      <div className="space-y-3">
        <p className="font-semibold text-base">Highlighted text</p>
        <p>
          Whenever you see a{" "}
          <span className="underline decoration-white/80 decoration-2 underline-offset-2">
            highlighted word or phrase
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
