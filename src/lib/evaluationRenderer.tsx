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
    return [<RichText key="text" text={text} inline />];
  }

  // Sort spans by start position
  const sortedSpans = [...spans].sort((a, b) => a.start - b.start);

  // Build segments array
  const segments: TextSegment[] = [];
  let currentPos = 0;

  for (const span of sortedSpans) {
    // Skip invalid spans
    if (span.start < currentPos || span.end > text.length || span.start >= span.end) {
      continue;
    }

    // Add plain text before this span
    if (span.start > currentPos) {
      segments.push({
        type: "text",
        content: text.slice(currentPos, span.start),
      });
    }

    // Add the flagged segment
    segments.push({
      type: "flag",
      content: text.slice(span.start, span.end),
      span,
    });

    currentPos = span.end;
  }

  // Add remaining text after last span
  if (currentPos < text.length) {
    segments.push({
      type: "text",
      content: text.slice(currentPos),
    });
  }

  // Render segments to React nodes
  return segments.map((segment, index) => {
    if (segment.type === "text") {
      return <RichText key={index} text={segment.content} inline />;
    }

    const explanation = getFallacyExplanation(segment.span!.value);

    return (
      <TextFlag
        key={index}
        text={segment.content}
        evaluationFactor="factual_accuracy"
        explanation={explanation}
        severity="error"
      />
    );
  });
}
