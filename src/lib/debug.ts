// Toggle dev-only logging without stripping calls from the codebase.
// Logs fire in `pnpm dev` (import.meta.env.DEV === true) and stay quiet
// in production builds, unless VITE_DEBUG_LOGS=true forces them on.
//
// Usage:
//   import { debugLog, debugWarn, debugError } from "@/lib/debug";
//   debugLog("thread payload", payload);

const FORCE_ON =
  (import.meta.env?.VITE_DEBUG_LOGS as string | undefined) === "true";

export const DEBUG_LOGS_ENABLED = Boolean(import.meta.env?.DEV) || FORCE_ON;

export const debugLog = (...args: unknown[]): void => {
  if (DEBUG_LOGS_ENABLED) console.log(...args);
};

export const debugWarn = (...args: unknown[]): void => {
  if (DEBUG_LOGS_ENABLED) console.warn(...args);
};

export const debugError = (...args: unknown[]): void => {
  if (DEBUG_LOGS_ENABLED) console.error(...args);
};
