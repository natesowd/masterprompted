# Running issues list

Tech-debt and audit-derived items not yet handled. UI bug priorities live in [TODO](TODO); this file is for codebase-health work. Items move out of here as they ship.

## Greenlit, queued for next PRs

### A4 — Audit remaining `react-hooks/exhaustive-deps` warnings
Six unsilenced warnings in lint output. Each needs a read: either fix the deps or document why intentionally narrowed (the same pattern as the disable already justified at [src/pages/PromptPlayground.tsx:876](src/pages/PromptPlayground.tsx:876)).
- [src/pages/PromptPlayground.tsx:740](src/pages/PromptPlayground.tsx:740) — missing `t`
- [src/pages/PromptPlayground.tsx:958](src/pages/PromptPlayground.tsx:958) — missing `uploadedFiles`
- [src/pages/PromptPlaygroundV2.tsx:577](src/pages/PromptPlaygroundV2.tsx:577) — missing `TEMPERATURE_STEPS`
- [src/pages/PromptPlaygroundV2.tsx:673](src/pages/PromptPlaygroundV2.tsx:673) — missing `t`
- [src/pages/PromptPlaygroundV2.tsx:796](src/pages/PromptPlaygroundV2.tsx:796) — same pattern as the documented disable in PromptPlayground; should mirror the fix
- [src/pages/PromptPlaygroundV2.tsx:865](src/pages/PromptPlaygroundV2.tsx:865) — missing `uploadedFiles`

### B1 — Lazy-load `pdf.worker`
Bundle ships a 2.3 MB `pdf.worker-*.mjs` to every visitor. PDF parser is already dynamically imported in [src/pages/PromptPlayground.tsx:752](src/pages/PromptPlayground.tsx:752); confirm pdf.worker piggybacks on that and tighten if not.

### B2 — Code-split the main bundle
Main chunk is 1.08 MB (321 KB gzipped) because [src/App.tsx](src/App.tsx) eagerly imports all 102 routes. Convert page imports to `React.lazy()` + `<Suspense>`, grouped by module.

### B3 — Edge function CORS via env
Hardcoded allowlists in [netlify/edge-functions/chat.ts:18](netlify/edge-functions/chat.ts:18) and [netlify/edge-functions/embeddings.ts:12](netlify/edge-functions/embeddings.ts:12). Read from `Netlify.env.get("ALLOWED_ORIGINS")` (comma-split) with the current list as fallback.

### B4 — Strip `@ts-nocheck` from edge functions
[netlify/edge-functions/chat.ts:1](netlify/edge-functions/chat.ts:1), [netlify/edge-functions/embeddings.ts:1](netlify/edge-functions/embeddings.ts:1) blanket-disable type checking on the most security-sensitive code. Small contained typing pass.

### B5 — `localStorage` / `sessionStorage` adapter
Tiny wrapper at `src/lib/storage.ts` (`getItem`/`setItem`/`removeItem`, no-ops outside the browser, centralized keys). Migrate the known callsites incrementally:
- [src/components/FlagIntroHighlight.tsx](src/components/FlagIntroHighlight.tsx)
- [src/hooks/useModuleProgress.ts](src/hooks/useModuleProgress.ts)
- [src/pages/NextWordPredictionResponse.tsx](src/pages/NextWordPredictionResponse.tsx)
- [src/pages/PromptPlayground.tsx](src/pages/PromptPlayground.tsx)

### Decompose `PromptPlayground.tsx` (own PR)
1,104-line god component mixing thread state, file uploads, evaluations, web search, optimization, caching, and SSE streaming. Plan: extract `useThreads`, `useFileUploads`, `useEvaluations`, `useOptimization` hooks, then split JSX into 3–4 child components. Big surface area — separate PR. Same pattern would later apply to [PromptPlaygroundV2.tsx](src/pages/PromptPlaygroundV2.tsx) which mirrors the structure.

## Deferred — not greenlit yet

### C1 — Vitest scaffolding + first tests
Add Vitest config; first tests for the service layer ([src/services/evaluations](src/services/evaluations), [src/services/webSearch](src/services/webSearch), [src/services/embeddings](src/services/embeddings)) where contracts matter most.

### C2 — TS strict mode, file-by-file
[tsconfig.json](tsconfig.json) currently has `strictNullChecks`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters` all off. Flip one at a time, fix fallout per flag, ship per flag.

### C3 — Zod at API boundaries
Runtime schemas for [src/services/evaluations/fetchWithRetry.ts](src/services/evaluations/fetchWithRetry.ts), [src/services/webSearch/webSearchClient.ts](src/services/webSearch/webSearchClient.ts), [src/services/embeddings/embeddingsClient.ts](src/services/embeddings/embeddingsClient.ts). Replaces cast-and-pray with real validation.

### Make lint a CI gate (after errors are at zero)
Once `pnpm lint` is clean, add a husky + lint-staged pre-commit hook (or Netlify build check) running `pnpm lint --max-warnings=0`. Currently deferred until the existing 37 errors are cleared so the gate isn't immediately broken.

### Silent catch blocks
e.g. [src/lib/pdfParser.ts:65](src/lib/pdfParser.ts:65) and the truncate-on-failure path in [src/lib/pdfSummarizer.ts:154](src/lib/pdfSummarizer.ts:154). Surface failures to the user (toast or inline error) instead of swallowing.

### `Math.random()` in render paths
[src/components/TreeDiagram.tsx:171](src/components/TreeDiagram.tsx:171), [src/components/BranchDiagram.tsx:280](src/components/BranchDiagram.tsx:280) — non-deterministic, untestable. Seed or move out of render.

### `dangerouslySetInnerHTML` audit
Confirm sanitization of inputs at:
- [src/components/RichText.tsx:207](src/components/RichText.tsx:207)
- [src/components/ChatBody.tsx:367](src/components/ChatBody.tsx:367)
- [src/components/ui/chart.tsx:70](src/components/ui/chart.tsx:70)
- [src/components/TextFlag.tsx:177](src/components/TextFlag.tsx:177)
- [src/lib/evaluationRenderer.tsx:247](src/lib/evaluationRenderer.tsx:247)

### Memoize hot chat components
[src/components/ChatBody.tsx](src/components/ChatBody.tsx) re-renders on every parent update with array props. Wrap in `React.memo`, stabilize props.

## Permanently out (per user direction)

- **Stripping `console.log` calls** — calls stay in source forever; only their runtime output is silenced in prod via [src/lib/debug.ts](src/lib/debug.ts).
- **Decomposing other oversized files** — exercise pages, diagram components, [LanguageContext](src/contexts/LanguageContext.tsx) all left as-is. (Exception: [PromptPlayground.tsx](src/pages/PromptPlayground.tsx) is now greenlit for its own PR.)
- **Adding security headers in netlify.toml** — handled via Apache; this app is low-sensitivity.
- **`alt` attribute pass on prompt-controls images** — deprioritized.
