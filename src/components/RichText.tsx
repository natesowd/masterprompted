/**
 * RichText Component
 * 
 * Renders formatted text with markdown-like inline formatting (bold, italic).
 * Supports both inline and block rendering modes, with optional diff mode.
 * 
 * @example
 * ```tsx
 * <RichText text="This is **bold** and *italic*" />
 * <RichText text="Inline text" inline />
 * <RichText text="Diff text" diff inline />
 * ```
 */

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const richTextVariants = cva(
  "",
  {
    variants: {
      mode: {
        block: "whitespace-pre-wrap break-words",
        inline: "inline whitespace-pre-wrap break-words"
      },
      variant: {
        default: "",
        muted: "text-muted-foreground",
        emphasized: "font-medium"
      }
    },
    defaultVariants: {
      mode: "block",
      variant: "default"
    }
  }
);

type RichTextProps = VariantProps<typeof richTextVariants> & {
  /** The text to render with formatting */
  text: string;
  /** Additional CSS classes */
  className?: string;
  /** Render as inline span instead of block div */
  inline?: boolean;
  /** Disable markdown formatting (for diff views) */
  diff?: boolean;
  /** Whether to apply 'prose' class (typography styles). Defaults to true. */
  prose?: boolean;
  /** Whether to apply 'max-w-none' class. Defaults to true. */
  maxWNone?: boolean;
};

/**
 * Escapes HTML to prevent injection
 */
function escapeHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Handles inline markdown formatting like **bold** and *italics*
 */
export function applyInlineFormatting(raw: string, diff: boolean, isInline: boolean = false): string {
  if (!raw) return "";
  // Convert tabs to spaces and escape HTML
  const expanded = raw.replace(/\t/g, "    ");
  let html = escapeHtml(expanded);

  if (!diff) {
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/gs, "<strong>$1</strong>");
    // Italics: *text* and _text_
    html = html.replace(/(^|\W)\*(?!\s)(.+?)(?!\s)\*(?=\W|$)/gs, "$1<em>$2</em>");
    html = html.replace(/(^|\W)_(?!\s)(.+?)(?!\s)_(?=\W|$)/gs, "$1<em>$2</em>");

    // Markdown links: [text](url)
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>'
    );

    // Headers: #, ##, ### (descending order of size)
    // Note: Use text-base instead of text-md as 'md' is not a standard Tailwind size
    html = html.replace(/^###\s+(.+)$/gm, '<strong class="text-base">$1</strong>');
    html = html.replace(/^##\s+(.+)$/gm, '<strong class="text-lg">$1</strong>');
    html = html.replace(/^#\s+(.+)$/gm, '<strong class="text-xl">$1</strong>');

    // Error highlight: [[ERROR: text]]
    // Use negative lookahead to ensure we match the final ]] in case of messages ending with brackets like [[ERROR: [MSG]]]
    html = html.replace(/\[\[ERROR:\s*(.+?)\s*\]\](?!\])/gs, '<span class="text-red-500 font-bold bg-red-50 px-1 py-0.5 rounded border border-red-200">$1</span>');
  }

  // Handle Indentation and Lists (Block indents) - skip if specifically in inline mode
  const processedLines = !isInline ? html.split('\n').map(line => {
    if (diff) return line;

    // Match leading whitespace, optional list marker (*, -, 1.), and content
    // We require the marker to be followed by a space or end-of-line to avoid 
    // peeling off the first asterisk of markdown triples (like ***bold***)
    const match = line.match(/^(\s*)(?:([*\-]|(?:\d+\.))(?=\s|$))?(\s*)(.*)$/);

    // We process the line into a block if it has leading whitespace OR a marker
    if (match && (match[1] || match[2])) {
      const gutter = match[1] + (match[2] || "") + (match[3] || "");
      const content = match[4] || "";

      // Use flexbox strategy for perfect "flush" alignment across different fonts
      // This matches the logic in evaluationRenderer.tsx
      return `<span style="display: flex; align-items: flex-start;"><span style="white-space: pre; flex-shrink: 0;">${gutter}</span><span>${content}</span></span>`;
    }

    return line;
  }) : html.split('\n');

  // Rejoin lines. Block elements (display: block) manage their own line breaks.
  let finalHtml = "";
  for (let i = 0; i < processedLines.length; i++) {
    finalHtml += processedLines[i];
    if (i < processedLines.length - 1) {
      // Only add <br/> if both the current and next line are plain text (no block wrapper)
      const isCurrentBlock = processedLines[i].startsWith('<span style="display: flex');
      const isNextBlock = processedLines[i + 1] && processedLines[i + 1].startsWith('<span style="display: flex');
      if (!isCurrentBlock && !isNextBlock) {
        finalHtml += "<br/>";
      }
    }
  }

  return finalHtml;
}

/**
 * Handles block-level rendering (paragraphs and line breaks)
 */
function renderBlockText(input: string, diff: boolean): string {
  if (!input) return "";
  // Split into paragraphs by one or more empty lines
  const paragraphs = input.split(/\n\s*\n/);
  return paragraphs
    .map(paragraph => {
      // Don't render empty paragraphs
      if (!paragraph.trim()) return '';
      // Apply inline formatting (which already handles internal newlines)
      const formatted = applyInlineFormatting(paragraph, diff, false);
      return `<p>${formatted}</p>`;
    })
    .join("");
}

const RichText: React.FC<RichTextProps> = ({
  text,
  className,
  inline = false,
  diff = false,
  prose = true,
  maxWNone = true,
  mode,
  variant
}) => {
  // Use a <span> for inline mode, otherwise use a <div> fragment
  const Component = inline ? 'span' : 'div';

  // Choose the correct rendering function based on the 'inline' prop
  const html = inline ? applyInlineFormatting(text, diff, true) : renderBlockText(text, diff);

  return (
    <Component
      className={cn(
        richTextVariants({ mode: inline ? "inline" : "block", variant }),
        !inline && prose && "prose",
        !inline && maxWNone && "max-w-none",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichText;
