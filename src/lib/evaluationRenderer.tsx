/**
 * Evaluation Renderer Utility
 *
 * Renders text with inline TextFlag components based on evaluation spans.
 * Merges overlapping spans into single regions so only one flag icon appears.
 * Supports paginated explanations when multiple evaluations overlap.
 */

import React from "react";
import TextFlag from "@/components/TextFlag";
import type { ExplanationEntry } from "@/components/TextFlag";
import RichText, { applyInlineFormatting } from "@/components/RichText.tsx";
import { EvaluationSpan } from "@/services/evaluations/types";
import { getFallacyExplanation } from "@/services/evaluations/fallacyService";

/** A merged region covering one or more overlapping spans. */
interface MergedRegion {
  start: number;
  end: number;
  /** Indices into the original spans array for this paragraph */
  spanIndices: number[];
}

/**
 * Merge overlapping or touching spans into continuous regions.
 * Each region collects the indices of all contributing spans.
 */
function mergeOverlappingSpans(
  spans: Array<{ start: number; end: number }>,
): MergedRegion[] {
  if (spans.length === 0) return [];

  const indexed = spans
    .map((s, i) => ({ start: s.start, end: s.end, idx: i }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const merged: MergedRegion[] = [];
  let current: MergedRegion = {
    start: indexed[0].start,
    end: indexed[0].end,
    spanIndices: [indexed[0].idx],
  };

  for (let i = 1; i < indexed.length; i++) {
    const s = indexed[i];
    if (s.start <= current.end) {
      // Overlapping or adjacent — extend region
      current.end = Math.max(current.end, s.end);
      current.spanIndices.push(s.idx);
    } else {
      merged.push(current);
      current = { start: s.start, end: s.end, spanIndices: [s.idx] };
    }
  }
  merged.push(current);
  return merged;
}

/**
 * Build deduplicated explanation entries from a set of span indices.
 */
function buildExplanations(
  spanIndices: number[],
  spanMap: Map<number, EvaluationSpan>,
): ExplanationEntry[] {
  const entries: ExplanationEntry[] = [];
  const seen = new Set<string>();

  for (const si of spanIndices) {
    const sp = spanMap.get(si);
    if (!sp) continue;
    const expl = sp.explanation ?? getFallacyExplanation(sp.value);
    const key = `${sp.source}:${expl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ explanation: expl, href: sp.href, source: sp.source });
  }
  return entries;
}

/**
 * Renders text with inline TextFlag components for flagged segments.
 * Overlapping spans are merged into single regions — one flag icon per region.
 *
 * @param text - The full text to render
 * @param spans - Array of evaluation spans with start/end positions
 * @returns Array of React nodes (plain text and TextFlag components)
 */
export function renderTextWithFlags(
  text: string,
  spans: EvaluationSpan[],
): React.ReactNode[] {
  if (!spans.length) {
    return [<RichText key="text" text={text} />];
  }

  const paragraphMatches = text.split(/(\n\s*\n)/);
  let globalOffset = 0;

  return paragraphMatches
    .map((content, index) => {
      const pStart = globalOffset;
      const pEnd = globalOffset + content.length;
      globalOffset = pEnd;

      if (content.match(/^\n\s*\n$/)) return null;
      if (!content.trim()) return null;

      // Extract gutter (indents/markers) and actual content
      const gutterMatch = content.match(
        /^(\s*)(?:([*\-]|(?:\d+\.))(?=\s|$))?(\s*)/,
      );
      const gutter = gutterMatch ? gutterMatch[0] : "";
      const gutterLen = gutter.length;
      const actualText = content.slice(gutterLen);

      // Identify spans for this paragraph, adjusted relative to actualText
      const intersectingSpans = spans
        .filter((s) => s.start < pEnd && s.end > pStart)
        .map((s) => ({
          ...s,
          start: Math.max(0, s.start - pStart - gutterLen),
          end: Math.min(actualText.length, s.end - pStart - gutterLen),
        }))
        .filter((s) => s.start < s.end);

      if (intersectingSpans.length === 0) {
        // No flags in this paragraph
        return (
          <p key={index} style={{ display: "flex", alignItems: "flex-start" }}>
            <span style={{ whiteSpace: "pre", flexShrink: 0 }}>{gutter}</span>
            <span style={{ display: "block" }}>
              <RichText text={actualText} inline />
            </span>
          </p>
        );
      }

      const spanMap = new Map(intersectingSpans.map((s, i) => [i, s]));

      // Merge overlapping spans into single regions
      const regions = mergeOverlappingSpans(intersectingSpans);

      // Sort regions descending by start for safe marker injection
      const sortedRegions = [...regions].sort((a, b) => b.start - a.start);

      // Inject markers into text
      let markedContent = actualText;
      sortedRegions.forEach((region, i) => {
        markedContent =
          markedContent.slice(0, region.end) +
          `§§END_${i}§§` +
          markedContent.slice(region.end);
        markedContent =
          markedContent.slice(0, region.start) +
          `§§START_${i}§§` +
          markedContent.slice(region.start);
      });

      const htmlWithMarkers = applyInlineFormatting(markedContent, false, true);

      const parts = htmlWithMarkers.split(/(§§START_\d+§§|§§END_\d+§§)/);
      const nodes: React.ReactNode[] = [];
      // Track which region is currently active (at most one at a time after merging)
      let activeRegionIdx: number | null = null;
      // Track whether we've already shown the icon for the current region
      const regionIconShown = new Set<number>();

      const tagStack: string[] = [];
      const regionMap = new Map(sortedRegions.map((r, i) => [i, r]));

      parts.forEach((part, pIdx) => {
        const startMatch = part.match(/§§START_(\d+)§§/);
        const endMatch = part.match(/§§END_(\d+)§§/);

        if (startMatch) {
          activeRegionIdx = parseInt(startMatch[1]);
        } else if (endMatch) {
          activeRegionIdx = null;
        } else if (part) {
          // Update tag stack
          const tags = part.match(/<[^>]+>/g) || [];
          tags.forEach((tag) => {
            if (tag.startsWith("</")) {
              tagStack.pop();
            } else if (!tag.endsWith("/>")) {
              tagStack.push(tag);
            }
          });

          if (activeRegionIdx !== null) {
            const region = regionMap.get(activeRegionIdx)!;
            const explanationEntries = buildExplanations(
              region.spanIndices,
              spanMap,
            );

            // Only show icon on the first text chunk of each region
            const isFirstChunk = !regionIconShown.has(activeRegionIdx);
            if (isFirstChunk) regionIconShown.add(activeRegionIdx);

            // Re-wrap in active tags for formatting continuity
            let wrappedPart = part;
            [...tagStack].reverse().forEach((tag) => {
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
                showIcon={isFirstChunk}
              />,
            );
          } else {
            nodes.push(
              <span
                key={`${pIdx}`}
                dangerouslySetInnerHTML={{ __html: part }}
              />,
            );
          }
        }
      });

      return (
        <p key={index} style={{ display: "flex", alignItems: "flex-start" }}>
          <span style={{ whiteSpace: "pre", flexShrink: 0 }}>{gutter}</span>
          <span style={{ display: "block" }}>{nodes}</span>
        </p>
      );
    })
    .filter(Boolean);
}
