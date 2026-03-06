export interface FlaggedWordConfig {
  tooltip: string;
}

export const FLAGGED_WORDS_MAP: Record<string, FlaggedWordConfig> = {
  "Robotic": {
    tooltip: "The word robotic is not associated with the EU AI Act and is not AI. Therefore, it would be inappropriate and misleading to use this term in this headline.",
  },
  "Treaty": {
    tooltip: "The EU AI Act is not a treaty, and saying so would be incorrect. This is an example of how LLMs can hallucinate and create factual inaccuracies.",
  },
  "Nationwide": {
    tooltip: "The EU AI Act is an international regulation, not a national one. Using 'nationwide' would be factually inaccurate as it implies a single country's scope.",
  },
  "Nationally": {
    tooltip: "The EU AI Act is an international regulation, not a national one. Using 'nationally' would be factually inaccurate as it implies a single country's scope.",
  },
};

export const FLAGGED_WORDS_LIST = Object.keys(FLAGGED_WORDS_MAP).map(w => w.toLowerCase());

export function isFlaggedWord(word: string): boolean {
  return word in FLAGGED_WORDS_MAP;
}

export function getFlaggedConfig(word: string): FlaggedWordConfig | undefined {
  return FLAGGED_WORDS_MAP[word];
}
