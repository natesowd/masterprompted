/**
 * Fallacy Detection Service
 *
 * Calls the disinformation_signals endpoint to analyze text for logical fallacies.
 */

import type { EvaluationSpan } from "./types";
import { fetchWithRetry } from "./fetchWithRetry";
import { findSnippetRange } from "./claimsPipeline";

interface DisinformationResponse {
  signals: Array<{
    name: string;
    spans: Array<{
      start: number;
      end: number;
      segment: string;
      confidence: number;
      value: string;
    }>;
  }>;
  fallacies: Array<{
    fallacy_type: string;
    fallacious_text: string;
    confidence_score: number;
  }>;
  allowed_fallacies: string[];
  metadata: {
    total_fallacies: number;
    model_info: {
      provider: string;
      model_name: string;
      double_stage: boolean;
    };
  };
}

const DISINFORMATION_ENDPOINT = "https://fd-vc.ilabhub.atc.gr/api/v1/disinformation_signals";

/**
 * Human-readable explanations for fallacy types
 */
export const fallacyExplanations: Record<string, string> = {
  "hasty generalization": "This draws a conclusion from insufficient evidence, making a broad claim based on limited examples.",
  "false dilemma": "This presents only two options when more alternatives exist, oversimplifying the situation.",
  "ad populum": "This appeals to popularity rather than evidence, suggesting something is true because many people believe it.",
  "circular reasoning": "This uses the conclusion as a premise, essentially restating the claim rather than proving it.",
  "false causality": "This incorrectly assumes one event caused another simply because it occurred first or alongside it.",
  "ad hominem": "This attacks the person making the argument rather than addressing the argument itself.",
  "slippery slope": "This assumes one action will inevitably lead to extreme consequences without sufficient justification.",
};

/**
 * Get explanation for a fallacy type
 */
export function getFallacyExplanation(fallacyType: string): string {
  const normalized = fallacyType.toLowerCase();
  return fallacyExplanations[normalized] ?? `This text contains a "${fallacyType}" fallacy.`;
}

/**
 * Check text for disinformation signals (fallacies)
 * @param text - The text to analyze
 * @returns Array of evaluation spans or null if error
 */
export async function checkFallacies(text: string): Promise<EvaluationSpan[] | null> {
  if (!text.trim()) return [];

  try {
    const response = await fetchWithRetry(DISINFORMATION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        use_groq: true,
        double_stage: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fallacy API error: ${response.status} - ${errorText}`);
      return null;
    }

    const responseText = await response.text();

    // The API returns a plain-text message when no fallacies are found
    if (responseText.includes("no fallacies")) {
      return [];
    }

    const data: DisinformationResponse = JSON.parse(responseText);

    const rawSpans = data.signals
      ?.filter(s => s.name === "FALLACY")
      .flatMap(s => s.spans) ?? [];

    // The API often returns start/end covering the entire text even though
    // the segment field is a specific substring. Relocate each segment in
    // the source text to get accurate positions. If the segment can't be
    // located or is too short/empty to trust, skip it entirely — falling back
    // to the API positions would highlight the whole output.
    const MIN_SEGMENT_LEN = 3;
    return rawSpans.flatMap<EvaluationSpan>(span => {
      if (!span.segment || span.segment.trim().length < MIN_SEGMENT_LEN) {
        console.warn(`Fallacy span dropped: segment too short (${JSON.stringify(span.segment)})`);
        return [];
      }
      const range = findSnippetRange(text, span.segment);
      if (!range) {
        console.warn(`Fallacy span dropped: segment not found in text (${JSON.stringify(span.segment.slice(0, 60))})`);
        return [];
      }
      return [{
        start: range.start,
        end: range.end,
        segment: text.slice(range.start, range.end),
        confidence: span.confidence,
        value: span.value,
        source: "fallacy" as const,
      }];
    });
  } catch (error) {
    console.error("checkFallacies error:", error);
    return null;
  }
}
