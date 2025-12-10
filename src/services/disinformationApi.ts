/**
 * Disinformation API Service
 * 
 * Calls the fallacy detection endpoint to analyze text for logical fallacies.
 */

export interface DisinformationSpan {
  start: number;
  end: number;
  segment: string;
  confidence: number;
  value: string; // fallacy type, e.g. "hasty generalization"
}

export interface DisinformationResponse {
  signals: Array<{
    name: string;
    spans: DisinformationSpan[];
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
 * Check text for disinformation signals (fallacies)
 * @param text - The text to analyze
 * @returns Array of disinformation spans or null if error
 */
export async function checkDisinformation(text: string): Promise<DisinformationSpan[] | null> {
  if (!text.trim()) return [];

  try {
    const response = await fetch(DISINFORMATION_ENDPOINT, {
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
      console.error(`Disinformation API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data: DisinformationResponse = await response.json();
    
    // Extract spans from the FALLACY signals
    const fallacySignal = data.signals?.find(s => s.name === "FALLACY");
    return fallacySignal?.spans ?? [];
  } catch (error) {
    console.error("checkDisinformation error:", error);
    return null;
  }
}

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
