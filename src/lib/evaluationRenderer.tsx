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
  // We use a regex split that preserves enough info to track global positions
  const paragraphMatches = text.split(/(\n\s*\n)/);
  let globalOffset = 0;

  return paragraphMatches.map((content, index) => {
    const pStart = globalOffset;
    const pEnd = globalOffset + content.length;
    globalOffset = pEnd;

    // Is this a separator between paragraphs?
    if (content.match(/^\n\s*\n$/)) {
      return null; // The <p> tags below will handle spacing; separators aren't rendered directly
    }

    if (!content.trim()) return null;

    // Identify spans that intersect with this paragraph
    const intersectingSpans = spans
      .filter(s => s.start < pEnd && s.end > pStart)
      .map(s => ({
        ...s,
        // Clip to paragraph bounds and convert to local offset
        start: Math.max(0, s.start - pStart),
        end: Math.min(content.length, s.end - pStart)
      }))
      .sort((a, b) => a.start - b.start);

    // Identify indentation for consistent alignment
    const indentMatch = content.match(/^(\s*)([\*\-]|(?:\d+\.))?(\s*)/);
    const leadingWhitespace = indentMatch ? indentMatch[1] : "";
    const indentCount = (leadingWhitespace || "").replace(/\t/g, "    ").length;
    const hasStructure = indentMatch && (indentMatch[1] || indentMatch[2]);

    // Build segments for this paragraph
    const segments: TextSegment[] = [];
    let lastPos = 0;

    for (const span of intersectingSpans) {
      // Add plain text before the span
      if (span.start > lastPos) {
        segments.push({
          type: "text",
          content: content.slice(lastPos, span.start),
        });
      }

      // Add the flagged segment (handle overlapping/clipping)
      const actualStart = Math.max(lastPos, span.start);
      if (span.end > actualStart) {
        segments.push({
          type: "flag",
          content: content.slice(actualStart, span.end),
          span,
        });
        lastPos = span.end;
      }
    }

    // Add remaining text after last span
    if (lastPos < content.length) {
      segments.push({
        type: "text",
        content: content.slice(lastPos),
      });
    }

    const wrapperStyle = hasStructure
      ? { display: 'block', paddingLeft: `${indentCount}ch`, textIndent: `-${indentCount}ch` }
      : undefined;

    return (
      <p key={index} style={wrapperStyle}>
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
