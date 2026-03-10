/**
 * Evaluation Renderer Utility
 * 
 * Renders text with inline TextFlag components based on disinformation spans.
 */

import React from "react";
import TextFlag from "@/components/TextFlag";
import RichText, { applyInlineFormatting } from "@/components/RichText.tsx";
import { DisinformationSpan, getFallacyExplanation } from "@/services/disinformationApi";

interface TextSegment {
  type: "text" | "flag";
  content: string;
  span?: DisinformationSpan;
}

/**
 * Renders text with inline TextFlag components for flagged segments.
 * Uses a marker-injection strategy to ensure compatibility with RichText formatting.
 * 
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

  // Split into paragraphs to maintain consistent structure
  const paragraphMatches = text.split(/(\n\s*\n)/);
  let globalOffset = 0;

  return paragraphMatches.map((content, index) => {
    const pStart = globalOffset;
    const pEnd = globalOffset + content.length;
    globalOffset = pEnd;

    // Skip separators
    if (content.match(/^\n\s*\n$/)) return null;
    if (!content.trim()) return null;

    // Extract gutter (indents/markers) and actual content
    // We strictly require a space after markers like * and - to avoid splitting markdown bold/italic triples
    const gutterMatch = content.match(/^(\s*)(?:([*\-]|(?:\d+\.))(?=\s|$))?(\s*)/);
    const gutter = gutterMatch ? gutterMatch[0] : "";
    const gutterLen = gutter.length;
    const actualText = content.slice(gutterLen);

    // Identify spans for this paragraph, adjusted relative to actualText
    const intersectingSpans = spans
      .filter(s => s.start < pEnd && s.end > pStart)
      .map(s => ({
        ...s,
        start: Math.max(0, s.start - pStart - gutterLen),
        end: Math.min(actualText.length, s.end - pStart - gutterLen)
      }))
      .filter(s => s.start < s.end)
      .sort((a, b) => b.start - a.start); // Sort descending to inject markers safely

    // Create marked text for rich evaluation rendering
    let markedContent = actualText;
    intersectingSpans.forEach((span, i) => {
      // Use unique markers that won't be matched by RichText regexes
      markedContent =
        markedContent.slice(0, span.end) + `§§END_${i}§§` +
        markedContent.slice(span.end);
      markedContent =
        markedContent.slice(0, span.start) + `§§START_${i}§§` +
        markedContent.slice(span.start);
    });

    // Apply RichText formatting to the content (bypassing block structural transforms)
    const htmlWithMarkers = applyInlineFormatting(markedContent, false, true);

    // Parse the HTML by markers
    // Regex to split and capture markers
    const parts = htmlWithMarkers.split(/(§§START_\d+§§|§§END_\d+§§)/);
    const nodes: React.ReactNode[] = [];
    const activeSpans = new Set<number>();

    // Track active HTML tags to "re-apply" them inside flags if they straddle
    const tagStack: string[] = [];
    // Prepare a map for easy lookup of original span info
    const spanMap = new Map(intersectingSpans.map((s, i) => [i, s]));

    parts.forEach((part, pIdx) => {
      const startMatch = part.match(/§§START_(\d+)§§/);
      const endMatch = part.match(/§§END_(\d+)§§/);

      if (startMatch) {
        activeSpans.add(parseInt(startMatch[1]));
      } else if (endMatch) {
        activeSpans.delete(parseInt(endMatch[1]));
      } else if (part) {
        // Find tags in this part to update tagStack for the next parts
        // This is a simple heuristic to handle straddling tags
        const tags = part.match(/<[^>]+>/g) || [];
        tags.forEach(tag => {
          if (tag.startsWith('</')) {
            tagStack.pop();
          } else if (!tag.endsWith('/>')) { // Ignore self-closing tags for stack
            tagStack.push(tag);
          }
        });

        if (activeSpans.size > 0) {
          // This part is inside one or more flags. 
          // For simplicity, we wrap it in the most recent active span's TextFlag.
          const spanId = Array.from(activeSpans).pop()!;
          const spanInfo = spanMap.get(spanId)!;
          const explanation = getFallacyExplanation(spanInfo.value);

          // Re-wrap the part in active tags so the formatting persists inside the flag
          let wrappedPart = part;
          [...tagStack].reverse().forEach(tag => {
            const tagName = tag.match(/<([^\s>]+)/)?.[1];
            if (tagName) { // Ensure a valid tag name was found
              wrappedPart = tag + wrappedPart + `</${tagName}>`;
            }
          });

          nodes.push(
            <TextFlag
              key={`${pIdx}`}
              text={wrappedPart}
              isHtml={true}
              evaluationFactor="factual_accuracy"
              explanation={explanation}
              severity="error"
            />
          );
        } else {
          // Plain text/HTML segment
          nodes.push(<span key={`${pIdx}`} dangerouslySetInnerHTML={{ __html: part }} />);
        }
      }
    });

    return (
      <p key={index} style={{ display: 'flex', alignItems: 'flex-start' }}>
        <span style={{ whiteSpace: 'pre', flexShrink: 0 }}>{gutter}</span>
        <span style={{ display: 'block' }}>
          {nodes}
        </span>
      </p>
    );
  }).filter(Boolean);
}
