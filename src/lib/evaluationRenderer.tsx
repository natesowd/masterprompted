/**
 * Evaluation Renderer Utility
 * 
 * Renders text with inline TextFlag components based on disinformation spans.
 */

import React from "react";
import TextFlag from "@/components/TextFlag";
import RichText from "@/components/RichText.tsx";
import { DisinformationSpan, getFallacyExplanation } from "@/services/disinformationApi";

interface TextSegment {
  type: "text" | "flag";
  content: string;
  span?: DisinformationSpan;
}

/**
 * Renders text with inline TextFlag components for flagged segments
 * @param text - The full text to render
 * @param spans - Array of disinformation spans with start/end positions
 * @returns Array of React nodes (plain text and TextFlag components)
 */
export function renderTextWithFlags(
  text: string,
  spans: DisinformationSpan[]
): React.ReactNode[] {
  if (!spans.length) {
    return [<RichText key="text" text={text} />];
  }

  // Split into paragraphs to maintain consistent formatting with RichText
  const paragraphStrings = text.split(/\n\s*\n/);
  let currentGlobalPos = 0;

  return paragraphStrings.map((paragraph, pIndex) => {
    if (!paragraph.trim()) {
      currentGlobalPos += paragraph.length + 2; // +2 for potentially \n\n
      return null;
    }

    const pStart = text.indexOf(paragraph, currentGlobalPos);
    const pEnd = pStart + paragraph.length;
    currentGlobalPos = pEnd;

    // Filter and adjust spans for this paragraph
    const pSpans = spans
      .filter(s => s.start >= pStart && s.end <= pEnd)
      .map(s => ({ ...s, start: s.start - pStart, end: s.end - pStart }));

    const sortedSpans = [...pSpans].sort((a, b) => a.start - b.start);
    const segments: TextSegment[] = [];
    let pPos = 0;

    for (const span of sortedSpans) {
      if (span.start > pPos) {
        segments.push({ type: "text", content: paragraph.slice(pPos, span.start) });
      }
      segments.push({ type: "flag", content: paragraph.slice(span.start, span.end), span });
      pPos = span.end;
    }
    if (pPos < paragraph.length) {
      segments.push({ type: "text", content: paragraph.slice(pPos) });
    }

    return (
      <p key={pIndex}>
        {segments.map((segment, sIndex) => {
          if (segment.type === "text") {
            return <RichText key={sIndex} text={segment.content} inline />;
          }

          const explanation = getFallacyExplanation(segment.span!.value);
          return (
            <TextFlag
              key={sIndex}
              text={segment.content}
              evaluationFactor="factual_accuracy"
              explanation={explanation}
              severity="error"
            />
          );
        })}
      </p>
    );
  }).filter(Boolean);
}
