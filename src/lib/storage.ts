// Browser storage adapter.
//
// Why this exists:
// - SSR-safe: every call no-ops if `window` / the storage backend is missing.
// - Quota-safe: writes that throw (private mode, full disk) don't bubble up.
// - Centralizes the five storage keys this app uses, so a typo can't drift
//   one consumer's key away from another's.
//
// The string keys below match what existed before this adapter was
// introduced — do NOT change them or existing users lose their state.
//
// Usage:
//   import { local, session, STORAGE_KEYS } from "@/lib/storage";
//   local.get(STORAGE_KEYS.INTRO_HIGHLIGHT_SEEN);
//   session.set(STORAGE_KEYS.NWP_SKIP_HIGHLIGHTS, "true");

export const STORAGE_KEYS = {
  /** localStorage — set after the user dismisses the first flag-intro tooltip. */
  INTRO_HIGHLIGHT_SEEN: "textflag-intro-shown",
  /** localStorage — JSON array of visited route paths (Set serialized). */
  MODULE_PROGRESS: "prompted_visited_pages",
  /** localStorage — set after the user dismisses the playground popover series. */
  PROMPT_PLAYGROUND_POPOVER_SEEN: "promptPlayground.popoverSeen",
  /** sessionStorage — back-nav from NWP takeaways skips the intro highlight. */
  NWP_SKIP_HIGHLIGHTS: "nwp-skip-highlights",
  /** sessionStorage — set after the user dismisses the LLM training struct hint. */
  LLM_TRAINING_HINT_SEEN: "llm-training-struct-hint-seen",
} as const;

function getBackend(kind: "local" | "session"): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function makeApi(kind: "local" | "session") {
  return {
    get(key: string): string | null {
      const s = getBackend(kind);
      if (!s) return null;
      try {
        return s.getItem(key);
      } catch {
        return null;
      }
    },
    set(key: string, value: string): void {
      const s = getBackend(kind);
      if (!s) return;
      try {
        s.setItem(key, value);
      } catch {
        // Quota exceeded, private-mode write blocked, etc. Swallow — these
        // values are non-critical UI state that can be re-shown safely.
      }
    },
    remove(key: string): void {
      const s = getBackend(kind);
      if (!s) return;
      try {
        s.removeItem(key);
      } catch {
        /* ignore */
      }
    },
    getJSON<T>(key: string): T | null {
      const raw = this.get(key);
      if (raw == null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    setJSON(key: string, value: unknown): void {
      try {
        this.set(key, JSON.stringify(value));
      } catch {
        /* ignore — JSON.stringify can throw on circular refs */
      }
    },
  };
}

export const local = makeApi("local");
export const session = makeApi("session");
