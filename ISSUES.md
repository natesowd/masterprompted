# Running issues list

Tech-debt and audit-derived items not yet handled. UI bug priorities live in [TODO](TODO); this file is for codebase-health work. Items move out of here as they ship.

## Deferred — not greenlit yet

### Bundled: A4 (exhaustive-deps audit) + decompose `PromptPlayground.tsx`
These are bundled because the dep warnings are concentrated in PromptPlayground / PromptPlaygroundV2, and any honest fix for them gets entangled with the same state-and-effect surface that the decomposition touches. Better to do both in one pass than to re-litigate the same lines twice.

**A4 surface — six unsilenced `react-hooks/exhaustive-deps` warnings:**
- [src/pages/PromptPlayground.tsx:740](src/pages/PromptPlayground.tsx) — missing `t`
- [src/pages/PromptPlayground.tsx:958](src/pages/PromptPlayground.tsx) — missing `uploadedFiles`
- [src/pages/PromptPlaygroundV2.tsx:577](src/pages/PromptPlaygroundV2.tsx) — missing `TEMPERATURE_STEPS`
- [src/pages/PromptPlaygroundV2.tsx:673](src/pages/PromptPlaygroundV2.tsx) — missing `t`
- [src/pages/PromptPlaygroundV2.tsx:796](src/pages/PromptPlaygroundV2.tsx) — same pattern as the documented disable in PromptPlayground; should mirror the fix
- [src/pages/PromptPlaygroundV2.tsx:865](src/pages/PromptPlaygroundV2.tsx) — missing `uploadedFiles`

**Decomp surface — [PromptPlayground.tsx](src/pages/PromptPlayground.tsx) is ~1,100 lines.** Plan: extract `useThreads`, `useFileUploads`, `useChatSubmit`, `useOptimization` hooks; pull out `<SummarizationDialog>` and `<ControlPanelPopover>`; the page becomes a thin compositor. Then [PromptPlaygroundV2.tsx](src/pages/PromptPlaygroundV2.tsx) can adopt the same hooks in a follow-up. The bundled exhaustive-deps fixes ride along since they live inside the new hook boundaries.

**Also fold in: stream the V2 optimize call.** The same fix landed in V1 (PR #129) — `handlePromptOptimize` in [PromptPlaygroundV2.tsx](src/pages/PromptPlaygroundV2.tsx) still does non-streaming `await response.json()` and will hit the Netlify edge wall-time limit on large PDFs. The fix is mechanical: add `stream: true`, replace the JSON read with an `SSEContentParser` reader loop, assemble deltas into `rawOptimizedPrompt`. Easy to do as part of the V2 hook extraction since `useOptimization` will be the natural home for it.

This is a big, behavior-preserving refactor — likely its own multi-commit PR with manual smoke-testing of every playground flow at each extraction step.

### Make lint a CI gate
With `pnpm lint` now at 0 errors, this is unblocked. Add husky + lint-staged pre-commit (or a Netlify build check) running `pnpm lint --max-warnings=29` initially, tightening to `--max-warnings=0` once A4 lands.

### C1 — Vitest scaffolding + first tests
Add Vitest config; first tests for the service layer ([src/services/evaluations](src/services/evaluations), [src/services/webSearch](src/services/webSearch), [src/services/embeddings](src/services/embeddings)) where contracts matter most.

### C2 — TS strict mode, file-by-file
[tsconfig.json](tsconfig.json) currently has `strictNullChecks`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters` all off. Flip one at a time, fix fallout per flag, ship per flag.

### C3 — Zod at API boundaries
Runtime schemas for [src/services/evaluations/fetchWithRetry.ts](src/services/evaluations/fetchWithRetry.ts), [src/services/webSearch/webSearchClient.ts](src/services/webSearch/webSearchClient.ts), [src/services/embeddings/embeddingsClient.ts](src/services/embeddings/embeddingsClient.ts). Replaces cast-and-pray with real validation.

### Silent catch blocks
e.g. [src/lib/pdfParser.ts:69](src/lib/pdfParser.ts) and the truncate-on-failure path in [src/lib/pdfSummarizer.ts:154](src/lib/pdfSummarizer.ts). Surface failures to the user (toast or inline error) instead of swallowing.

### `Math.random()` in render paths
[src/components/TreeDiagram.tsx:171](src/components/TreeDiagram.tsx), [src/components/BranchDiagram.tsx:280](src/components/BranchDiagram.tsx) — non-deterministic, untestable. Seed or move out of render.

### `dangerouslySetInnerHTML` audit
Confirm sanitization of inputs at:
- [src/components/RichText.tsx:207](src/components/RichText.tsx)
- [src/components/ChatBody.tsx:367](src/components/ChatBody.tsx)
- [src/components/ui/chart.tsx:70](src/components/ui/chart.tsx)
- [src/components/TextFlag.tsx:177](src/components/TextFlag.tsx)
- [src/lib/evaluationRenderer.tsx:247](src/lib/evaluationRenderer.tsx)

### Memoize hot chat components
[src/components/ChatBody.tsx](src/components/ChatBody.tsx) re-renders on every parent update with array props. Wrap in `React.memo`, stabilize props.

### Compare view — lexical-overlap bonus in `bestMatches`
Pure embedding similarity in [src/lib/cosineSimilarity.ts:22](src/lib/cosineSimilarity.ts) misses obvious textual matches when chunk granularity differs between versions. Concrete repro: when one version has `"Higher Upfront Costs: EVs are…"` as a single sentence and the other has `"Higher upfront costs"` as a standalone heading-style chunk, the long sentence pairs greedily with `"Overall, EVs offer many benefits…"` at ~0.76 cosine because they share more topics, leaving the obvious lexical match orphaned. Fix: before sorting candidates, add a small score boost (e.g. +0.10–0.15) when one chunk is a substring/prefix of the other, capped at 1.0. Cheap, targeted, no UX change.

### Compare view — Phase 2: side-by-side full-text diff
Phase 1 (heatmap + ribbons + on-demand sidebar; this PR) keeps the sidebar-portal layout from the original Compare view. Phase 2 explores a GitHub/VSCode-style two-column full-text view so users can compare not just *content* between versions but *position and surrounding context*. The data layer added in Phase 1 ([useRelationalAnchors](src/hooks/useRelationalAnchors.ts), [usePairedThreshold](src/hooks/usePairedThreshold.ts), [useChunkRects](src/hooks/useChunkRects.ts), [useSwapState](src/hooks/useSwapState.ts)) was designed to be reusable here — the work is mostly a new layout component plus syncing scroll/highlight between the two columns.

## Permanently out (per user direction)

- **Stripping `console.log` calls** — calls stay in source forever; only their runtime output is silenced in prod via [src/lib/debug.ts](src/lib/debug.ts).
- **Decomposing other oversized files** — exercise pages, diagram components, [LanguageContext](src/contexts/LanguageContext.tsx) all left as-is. (Exception: [PromptPlayground.tsx](src/pages/PromptPlayground.tsx) is bundled with A4 above.)
- **Adding security headers in netlify.toml** — handled via Apache; this app is low-sensitivity.
- **`alt` attribute pass on prompt-controls images** — deprioritized.
