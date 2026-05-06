import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { local, STORAGE_KEYS } from "@/lib/storage";

/** All pages that belong to each module – visit every page to "complete" the module */
const MODULE_PAGES: Record<string, string[]> = {
  introduction: [
    "/module/intro",
    "/module/intro/about-simulator",
  ],
  nextWordPrediction: [
    "/module/next-word-prediction",
    "/module/next-word-prediction/prompt",
    "/module/next-word-prediction/response",
    "/module/next-word-prediction/takeaways",
  ],
  promptConstruction: [
    "/module/prompt-construction",
    "/module/prompt-construction/summarize",
    "/module/prompt-construction/specificity",
    "/module/prompt-construction/specificity/response",
    "/module/prompt-construction/specificity/takeaways",
    "/module/prompt-construction/conversation-style",
    "/module/prompt-construction/context",
    "/module/prompt-construction/bias",
  ],
  systemParameters: [
    "/module/system-parameters",
    "/module/system-parameters/temperature",
    "/module/system-parameters/roles",
    "/module/system-parameters/takeaways",
  ],
  multipleSources: [
    "/module/multiple-sources",
    "/module/multiple-sources/exercise",
    "/module/multiple-sources/takeaways",
  ],
  llmTraining: [
    "/module/llm-training",
    "/module/llm-training/supervised",
    "/module/llm-training/few-shot",
    "/module/llm-training/takeaways",
  ],
};

function getVisitedPages(): Set<string> {
  const arr = local.getJSON<string[]>(STORAGE_KEYS.MODULE_PROGRESS);
  return new Set(arr ?? []);
}

function markPageVisited(path: string) {
  const visited = getVisitedPages();
  if (visited.has(path)) return;
  visited.add(path);
  local.setJSON(STORAGE_KEYS.MODULE_PROGRESS, [...visited]);
}

export function isModuleCompleted(moduleKey: string): boolean {
  const pages = MODULE_PAGES[moduleKey];
  if (!pages) return false;
  const visited = getVisitedPages();
  return pages.every((p) => visited.has(p));
}

export function getCompletedModules(): Record<string, boolean> {
  const visited = getVisitedPages();
  const result: Record<string, boolean> = {};
  for (const [key, pages] of Object.entries(MODULE_PAGES)) {
    result[key] = pages.every((p) => visited.has(p));
  }
  return result;
}

/**
 * Hook: automatically records the current page as visited,
 * and returns completion status for all modules.
 */
export function useModuleProgress() {
  const location = useLocation();

  // Record current page visit
  useEffect(() => {
    markPageVisited(location.pathname);
  }, [location.pathname]);

  const completed = useMemo(() => getCompletedModules(), [location.pathname]);

  return { completed };
}
