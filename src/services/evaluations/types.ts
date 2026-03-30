/**
 * Shared types for all evaluation services.
 */

export interface EvaluationSpan {
  start: number;
  end: number;
  segment: string;
  confidence: number;
  /** Fallacy type (e.g. "hasty generalization") or flag type (e.g. "factual_inaccuracy") */
  value: string;
  /** Which evaluation service produced this span */
  source: "fallacy" | "claim_match" | "web_search";
  /** Custom explanation text (markdown). When present, takes precedence over fallacy lookup. */
  explanation?: string;
  /** Optional link URL (e.g. debunking article) */
  href?: string;
}

export interface EvaluationResult {
  spans: EvaluationSpan[];
  pipelineStatus: {
    fallacy: "success" | "error";
    claims: "success" | "error";
  };
  /** True while web_search calls are still in progress */
  webSearchPending: boolean;
}

/** Result from the claims match pipeline (extract_claims + claim_match only) */
export interface ClaimsMatchPipelineResult {
  spans: EvaluationSpan[];
  /** The extracted claims, needed for subsequent web_search calls */
  extractedClaims: Array<{ claim: string; snippet: string; snippetStart: number }>;
}
