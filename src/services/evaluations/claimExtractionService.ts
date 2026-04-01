/**
 * Claim Extraction Service
 *
 * Extracts individual claims and their associated text snippets from input text.
 */

import { fetchWithRetry } from "./fetchWithRetry";

const EXTRACT_CLAIMS_ENDPOINT = "https://claim-detection-aicode.ilabhub.atc.gr/extract_claims";

export interface ExtractedClaim {
  claim: string;
  snippet: string;
}

/**
 * Extract claims from text
 * @param text - The text to extract claims from
 * @returns Array of extracted claims or null if error
 */
export async function extractClaims(text: string): Promise<ExtractedClaim[] | null> {
  if (!text.trim()) return [];

  try {
    const response = await fetchWithRetry(EXTRACT_CLAIMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Extract claims API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data.claims ?? [];
  } catch (error) {
    console.error("extractClaims error:", error);
    return null;
  }
}
