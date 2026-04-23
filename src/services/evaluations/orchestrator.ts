/**
 * Evaluation Orchestrator
 *
 * Runs all evaluation pipelines and merges results.
 * Phase 1: Fallacy detection + claims extraction/matching run in parallel.
 * Phase 2: Web search runs sequentially per claim, with progressive updates.
 */

import type { EvaluationResult, EvaluationSpan } from "./types";
import { checkFallacies } from "./fallacyService";
import { runClaimsMatchPipeline } from "./claimsPipeline";
import { webSearchClaim } from "./webSearchService";

/**
 * Resolve overlapping spans per the product rules:
 *  - claim_match and web_search spans come from the same claim_extract source
 *    and are expected to have identical ranges when they match the same claim.
 *    This is treated as an invariant — a mismatch is logged but not repaired.
 *  - A fallacy span that overlaps any snippet (claim_match/web_search) is
 *    reattached to the first overlapping snippet's range, so fallacy and
 *    snippet share the same merged region and a single flag icon.
 *  - A fallacy span that doesn't overlap any snippet is kept as-is.
 *  - Fallacy spans among themselves are assumed not to overlap.
 */
function normalizeSpanOverlaps(spans: EvaluationSpan[]): EvaluationSpan[] {
  const snippetSpans = spans.filter(s => s.source === "claim_match" || s.source === "web_search");
  const fallacySpans = spans.filter(s => s.source === "fallacy");

  // Invariant check: matched claim_match/web_search pairs (same segment) should align.
  const bySegment = new Map<string, EvaluationSpan[]>();
  for (const s of snippetSpans) {
    const key = s.segment;
    if (!bySegment.has(key)) bySegment.set(key, []);
    bySegment.get(key)!.push(s);
  }
  for (const [, group] of bySegment) {
    if (group.length > 1) {
      const first = group[0];
      for (const other of group.slice(1)) {
        if (other.start !== first.start || other.end !== first.end) {
          console.warn(
            `Snippet invariant violated: ${first.source}(${first.start},${first.end}) vs ${other.source}(${other.start},${other.end}) for segment "${first.segment.slice(0, 40)}"`,
          );
        }
      }
    }
  }

  // Sort snippets by start so "first overlapping" is deterministic.
  const sortedSnippets = [...snippetSpans].sort((a, b) => a.start - b.start || a.end - b.end);

  const adjustedFallacies = fallacySpans.map(f => {
    const overlap = sortedSnippets.find(s => f.start < s.end && f.end > s.start);
    if (!overlap) return f;
    return {
      ...f,
      start: overlap.start,
      end: overlap.end,
      segment: overlap.segment,
    };
  });

  return [...snippetSpans, ...adjustedFallacies].sort((a, b) => a.start - b.start);
}

/**
 * Run all evaluation pipelines on the given text.
 *
 * @param text - The full answer text to analyze
 * @param onUpdate - Called with intermediate results as they become available.
 *   First call: after fallacy + claim_match complete (enables UI toggle).
 *   Subsequent calls: after each web_search completes with a new flag.
 *   Final call: when all web_search calls finish (webSearchPending = false).
 * @returns Final combined evaluation result
 */
export async function runAllEvaluations(
  text: string,
  onUpdate?: (result: EvaluationResult) => void,
): Promise<EvaluationResult> {
  if (!text.trim()) {
    const empty: EvaluationResult = {
      spans: [],
      pipelineStatus: { fallacy: "success", claims: "success" },
      webSearchPending: false,
    };
    onUpdate?.(empty);
    return empty;
  }

  // Phase 1: Run fallacy detection and claims match pipeline in parallel
  const [fallacyResult, claimsResult] = await Promise.allSettled([
    checkFallacies(text),
    runClaimsMatchPipeline(text),
  ]);

  const fallacySpans =
    fallacyResult.status === "fulfilled" && fallacyResult.value !== null
      ? fallacyResult.value
      : [];

  const claimsMatchSpans =
    claimsResult.status === "fulfilled" && claimsResult.value !== null
      ? claimsResult.value.spans
      : [];

  const extractedClaims =
    claimsResult.status === "fulfilled" && claimsResult.value !== null
      ? claimsResult.value.extractedClaims
      : [];

  const fallacyStatus: "success" | "error" =
    fallacyResult.status === "fulfilled" && fallacyResult.value !== null
      ? "success"
      : "error";

  const claimsStatus: "success" | "error" =
    claimsResult.status === "fulfilled" && claimsResult.value !== null
      ? "success"
      : "error";

  // Raw spans are kept unnormalized in `result.spans` so incremental web_search
  // additions below can reason about them; normalization is applied on emit.
  const allSpans = [...fallacySpans, ...claimsMatchSpans].sort((a, b) => a.start - b.start);

  const result: EvaluationResult = {
    spans: allSpans,
    pipelineStatus: { fallacy: fallacyStatus, claims: claimsStatus },
    webSearchPending: extractedClaims.length > 0,
  };

  // Emit Phase 1 results so UI can show them immediately
  onUpdate?.({ ...result, spans: normalizeSpanOverlaps(result.spans) });

  // Phase 2: Run web_search sequentially for each unique claim text,
  // then apply the result to all sub-snippets sharing that claim.
  const uniqueClaimTexts = [...new Set(extractedClaims.map(c => c.claim))];

  for (const claimText of uniqueClaimTexts) {
    try {
      const searchResult = await webSearchClaim(claimText);
      if (searchResult?.claimDebunked && searchResult.debunkReport) {
        // Build explanation with hyperlinked sources
        let explanation = searchResult.debunkReport;
        if (searchResult.debunkingSources.length > 0) {
          const validSources = searchResult.debunkingSources
            .filter(s => s.source && s.citationNumber)
            .sort((a, b) => (a.citationNumber ?? Infinity) - (b.citationNumber ?? Infinity));

          // Enrich inline citations [N] → [N|||name|||url] so RichText can show tooltips
          for (const s of validSources) {
            const num = s.citationNumber;
            const name = (s.origin || s.source).replace(/\|/g, '-');
            const url = s.source.replace(/\|/g, '-');
            // Replace all occurrences of [N] with the enriched format
            explanation = explanation.split(`[${num}]`).join(
              `[${num}|||${name}|||${url}]`
            );
          }

          const sourceLinks = validSources
            .map(s => `- [${s.citationNumber}] [${s.origin || s.source}](${s.source})`)
            .join("\n");
          if (sourceLinks) {
            explanation += `\n\n**Sources:**\n${sourceLinks}`;
          }
        }

        // Create a span for each sub-snippet of this claim
        for (const entry of extractedClaims.filter(c => c.claim === claimText)) {
          const newSpan: EvaluationSpan = {
            start: entry.snippetStart,
            end: entry.snippetStart + entry.snippet.length,
            segment: entry.snippet,
            confidence: 1.0,
            value: "factual_inaccuracy",
            source: "web_search",
            explanation,
          };
          result.spans.push(newSpan);
        }
        result.spans.sort((a, b) => a.start - b.start);
        onUpdate?.({ ...result, spans: normalizeSpanOverlaps(result.spans) });
      }
    } catch (err) {
      console.error(`Web search failed for claim: "${claimText.slice(0, 60)}..."`, err);
    }
  }

  // All web_search calls done
  result.webSearchPending = false;
  const finalized: EvaluationResult = { ...result, spans: normalizeSpanOverlaps(result.spans) };
  onUpdate?.(finalized);

  return finalized;
}
