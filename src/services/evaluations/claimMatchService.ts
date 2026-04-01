/**
 * Claim Matching Service
 *
 * Checks if a claim has been previously debunked by searching against a database.
 */

import { fetchWithRetry } from "./fetchWithRetry";

const CLAIM_MATCH_ENDPOINT = "https://claim-matching-aicode.ilabhub.atc.gr/claim_match";

export interface ClaimMatchResult {
  debunked: boolean;
  url: string;
  title: string;
  report: string;
  similarityScore: number;
}

/**
 * Check if a single claim has been debunked
 * @param claim - The claim text to check
 * @returns Match result or null if error
 */
export async function matchClaim(claim: string): Promise<ClaimMatchResult | null> {
  try {
    const response = await fetchWithRetry(CLAIM_MATCH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: claim }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claim match API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    return {
      debunked: data.debunked === "yes",
      url: data.url ?? "",
      title: data.title ?? "",
      report: data.report ?? "",
      similarityScore: data.similarity_score ?? 0,
    };
  } catch (error) {
    console.error("matchClaim error:", error);
    return null;
  }
}
