/**
 * Claims Pipeline
 *
 * Orchestrates: extract_claims -> claim_match per claim -> merged EvaluationSpan[]
 * Web search is handled separately by the orchestrator for sequential execution.
 */

import type { EvaluationSpan, ClaimsMatchPipelineResult } from "./types";
import { extractClaims } from "./claimExtractionService";
import { matchClaim } from "./claimMatchService";

/**
 * Find the start index of a snippet in the source text.
 * Falls back to whitespace-normalized search if exact match fails.
 */
export function findSnippetPosition(text: string, snippet: string): number {
  const exactIndex = text.indexOf(snippet);
  if (exactIndex !== -1) return exactIndex;

  // Fallback: normalize whitespace and try again
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
  const normalizedText = normalize(text);
  const normalizedSnippet = normalize(snippet);
  const normIndex = normalizedText.indexOf(normalizedSnippet);
  if (normIndex === -1) return -1;

  // Map normalized index back to original text position.
  let origPos = 0;
  let normPos = 0;
  while (normPos < normIndex && origPos < text.length) {
    if (/\s/.test(text[origPos])) {
      while (origPos < text.length && /\s/.test(text[origPos])) origPos++;
      normPos++;
    } else {
      origPos++;
      normPos++;
    }
  }
  return origPos;
}

/**
 * Run the claims extraction + claim_match pipeline (no web_search).
 * Returns both the flagged spans and the extracted claims for later web_search use.
 */
export async function runClaimsMatchPipeline(text: string): Promise<ClaimsMatchPipelineResult | null> {
  if (!text.trim()) return { spans: [], extractedClaims: [] };

  const claims = await extractClaims(text);
  if (claims === null) return null;
  if (claims.length === 0) return { spans: [], extractedClaims: [] };

  // Locate all snippets first
  const locatedClaims = claims.map(claim => {
    const snippetStart = findSnippetPosition(text, claim.snippet);
    if (snippetStart === -1) {
      console.warn(`Claims pipeline: could not locate snippet in text: "${claim.snippet.slice(0, 80)}..."`);
    }
    return { ...claim, snippetStart };
  }).filter(c => c.snippetStart !== -1);

  // Run claim_match for all claims in parallel
  const matchResults = await Promise.allSettled(
    locatedClaims.map(claim => matchClaim(claim.claim))
  );

  const spans: EvaluationSpan[] = [];

  matchResults.forEach((result, i) => {
    const match = result.status === "fulfilled" ? result.value : null;
    if (!match?.debunked) return;

    const claim = locatedClaims[i];
    spans.push({
      start: claim.snippetStart,
      end: claim.snippetStart + claim.snippet.length,
      segment: claim.snippet,
      confidence: match.similarityScore,
      value: "factual_inaccuracy",
      source: "claim_match",
      explanation: `This claim was debunked [here](${match.url}).`,
      href: match.url,
    });
  });

  return {
    spans,
    extractedClaims: locatedClaims.map(c => ({
      claim: c.claim,
      snippet: c.snippet,
      snippetStart: c.snippetStart,
    })),
  };
}
