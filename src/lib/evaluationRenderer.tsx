/**
 * Evaluation Renderer Utility
 *
 * Renders text with inline TextFlag components based on evaluation spans.
 * Supports multiple overlapping spans with paginated explanations.
 */

import React from "react";
import TextFlag from "@/components/TextFlag";
import type { ExplanationEntry } from "@/components/TextFlag";
import RichText, { applyInlineFormatting } from "@/components/RichText.tsx";
import { EvaluationSpan } from "@/services/evaluations/types";
import { getFallacyExplanation } from "@/services/evaluations/fallacyService";

/**
 * Collect all spans that overlap a given region and build explanation entries.
 * Used to create paginated explanations when multiple evaluations flag the same text.
 */
function collectExplanations(
  activeSpanIds: Set<number>,
  spanMap: Map<number, EvaluationSpan>,
  allSpans: EvaluationSpan[],
  regionStart: number,
  regionEnd: number,
): ExplanationEntry[] {
  // Gather all spans that overlap with the active region
  const overlapping = new Set<number>(activeSpanIds);

  // Also check all spans for overlap with this region (for spans not in activeSpanIds
  // but sharing the same start/end range, e.g., claim_match and web_search on same snippet)
  allSpans.forEach((span, globalIdx) => {
    // Find the corresponding local index in spanMap
    spanMap.forEach((mappedSpan, localIdx) => {
      if (mappedSpan === span) return; // skip self
      if (span.start < regionEnd && span.end > regionStart) {
        // This span overlaps - check if it's already in the map
        if (!overlapping.has(localIdx)) {
          // Check if this exact span object is in the spanMap under a different key
          for (const [k, v] of spanMap.entries()) {
            if (v.start === span.start && v.end === span.end && v.source === span.source && v.explanation === span.explanation) {
              overlapping.add(k);
              break;
            }
          }
        }
      }
    });
  });

  const entries: ExplanationEntry[] = [];
  const seen = new Set<string>();

  for (const id of overlapping) {
    const spanInfo = spanMap.get(id);
    if (!spanInfo) continue;

    const explanation = spanInfo.explanation ?? getFallacyExplanation(spanInfo.value);
    // Deduplicate by explanation text
    const key = `${spanInfo.source}:${explanation}`;
    if (seen.has(key)) continue;
    seen.add(key);

    entries.push({
      explanation,
      href: spanInfo.href,
      source: spanInfo.source,
    });
  }

  return entries;
}

/**
 * Renders text with inline TextFlag components for flagged segments.
 * Uses a marker-injection strategy to ensure compatibility with RichText formatting.
 *
 * @param text - The full text to render
 * @param spans - Array of evaluation spans with start/end positions
 * @returns Array of React nodes (plain text and TextFlag components)
 */
export function renderTextWithFlags(
  text: string,
  spans: EvaluationSpan[]
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

    // Deduplicate spans that have the same start/end (keep all for explanation collection)
    // But only inject one set of markers per unique start/end range
    const uniqueRanges = new Map<string, number>(); // "start-end" -> first span index
    const markerSpans: Array<{ start: number; end: number; spanIndex: number }> = [];

    intersectingSpans.forEach((span, i) => {
      const key = `${span.start}-${span.end}`;
      if (!uniqueRanges.has(key)) {
        uniqueRanges.set(key, i);
        markerSpans.push({ start: span.start, end: span.end, spanIndex: i });
      }
    });

    // Sort marker spans descending by start for safe injection
    markerSpans.sort((a, b) => b.start - a.start);

    // Create marked text for rich evaluation rendering
    let markedContent = actualText;
    markerSpans.forEach((ms, i) => {
      markedContent =
        markedContent.slice(0, ms.end) + `§§END_${i}§§` +
        markedContent.slice(ms.end);
      markedContent =
        markedContent.slice(0, ms.start) + `§§START_${i}§§` +
        markedContent.slice(ms.start);
    });

    // Apply RichText formatting to the content (bypassing block structural transforms)
    const htmlWithMarkers = applyInlineFormatting(markedContent, false, true);

    // Parse the HTML by markers
    const parts = htmlWithMarkers.split(/(§§START_\d+§§|§§END_\d+§§)/);
    const nodes: React.ReactNode[] = [];
    const activeMarkers = new Set<number>();

    // Track active HTML tags to "re-apply" them inside flags if they straddle
    const tagStack: string[] = [];
    // Prepare maps for lookup
    const markerMap = new Map(markerSpans.map((ms, i) => [i, ms]));
    const spanMap = new Map(intersectingSpans.map((s, i) => [i, s]));

    parts.forEach((part, pIdx) => {
      const startMatch = part.match(/§§START_(\d+)§§/);
      const endMatch = part.match(/§§END_(\d+)§§/);

      if (startMatch) {
        activeMarkers.add(parseInt(startMatch[1]));
      } else if (endMatch) {
        activeMarkers.delete(parseInt(endMatch[1]));
      } else if (part) {
        // Find tags in this part to update tagStack for the next parts
        const tags = part.match(/<[^>]+>/g) || [];
        tags.forEach(tag => {
          if (tag.startsWith('</')) {
            tagStack.pop();
          } else if (!tag.endsWith('/>')) {
            tagStack.push(tag);
          }
        });

        if (activeMarkers.size > 0) {
          const markerId = Array.from(activeMarkers).pop()!;
          const markerInfo = markerMap.get(markerId)!;
          const primarySpan = spanMap.get(markerInfo.spanIndex)!;

          // Collect all explanations from overlapping spans at this range
          const regionStart = primarySpan.start + pStart + gutterLen;
          const regionEnd = primarySpan.end + pStart + gutterLen;

          // Find all intersecting spans that share this range
          const rangeKey = `${primarySpan.start}-${primarySpan.end}`;
          const overlappingSpanIndices = new Set<number>();
          intersectingSpans.forEach((s, i) => {
            const sk = `${s.start}-${s.end}`;
            if (sk === rangeKey) {
              overlappingSpanIndices.add(i);
            }
          });

          // Also add any currently active markers
          for (const mid of activeMarkers) {
            const mi = markerMap.get(mid);
            if (mi) overlappingSpanIndices.add(mi.spanIndex);
          }

          const explanationEntries: ExplanationEntry[] = [];
          const seenExplanations = new Set<string>();

          for (const si of overlappingSpanIndices) {
            const sp = spanMap.get(si);
            if (!sp) continue;
            const expl = sp.explanation ?? getFallacyExplanation(sp.value);
            const dedupKey = `${sp.source}:${expl}`;
            if (seenExplanations.has(dedupKey)) continue;
            seenExplanations.add(dedupKey);
            explanationEntries.push({
              explanation: expl,
              href: sp.href,
              source: sp.source,
            });
          }

          // Re-wrap the part in active tags so the formatting persists inside the flag
          let wrappedPart = part;
          [...tagStack].reverse().forEach(tag => {
            const tagName = tag.match(/<([^\s>]+)/)?.[1];
            if (tagName) {
              wrappedPart = tag + wrappedPart + `</${tagName}>`;
            }
          });

          nodes.push(
            <TextFlag
              key={`${pIdx}`}
              text={wrappedPart}
              isHtml={true}
              evaluationFactor="factual_accuracy"
              explanations={explanationEntries}
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
