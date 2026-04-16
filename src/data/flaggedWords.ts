export type FlaggedEvaluationFactor = "factual_accuracy" | "relevance";

export interface FlaggedWordConfig {
  tooltip: string;
  evaluationFactor: FlaggedEvaluationFactor;
}

export const FLAGGED_WORDS_MAP: Record<string, FlaggedWordConfig> = {
  "Robotic": {
    tooltip: "The word robotic is not associated with the EU AI Act and is not AI. Therefore, it would be inappropriate and misleading to use this term in this headline.",
    evaluationFactor: "factual_accuracy",
  },
  "Treaty": {
    tooltip: "The EU AI Act is not a treaty, and saying so would be incorrect. This is an example of how LLMs can hallucinate and create factual inaccuracies.",
    evaluationFactor: "factual_accuracy",
  },
  "Nationwide": {
    tooltip: "The EU AI Act is an international regulation, not a national one. Using 'nationwide' would be factually inaccurate as it implies a single country's scope.",
    evaluationFactor: "factual_accuracy",
  },
  "Nationally": {
    tooltip: "The EU AI Act is an international regulation, not a national one. Using 'nationally' would be factually inaccurate as it implies a single country's scope.",
    evaluationFactor: "factual_accuracy",
  },
  "Morality": {
    tooltip: "While morality is tangentially related to AI ethics, the EU AI Act focuses on regulation and governance — not morality per se. A more precise and relevant term would better serve the headline.",
    evaluationFactor: "relevance",
  },
  "Globally": {
    tooltip: "While 'globally' might seem accurate for an international regulation, the EU AI Act specifically applies to the European Union — not the entire globe. Using 'globally' overstates its geographic scope.",
    evaluationFactor: "factual_accuracy",
  },
};

export const FLAGGED_WORDS_LIST = Object.keys(FLAGGED_WORDS_MAP).map(w => w.toLowerCase());

export function isFlaggedWord(word: string): boolean {
  return word in FLAGGED_WORDS_MAP;
}

export function getFlaggedConfig(word: string): FlaggedWordConfig | undefined {
  return FLAGGED_WORDS_MAP[word];
}

export const FACTOR_META: Record<FlaggedEvaluationFactor, { label: string; colorClass: string; hslColor: string }> = {
  factual_accuracy: { label: "Factual Accuracy", colorClass: "destructive", hslColor: "hsl(var(--destructive))" },
  relevance: { label: "Relevance", colorClass: "amber-500", hslColor: "hsl(38 92% 50%)" },
};
