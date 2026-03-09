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
        block: "prose max-w-none whitespace-pre-wrap break-words",
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
};

/**
 * Escapes HTML to prevent injection
 */
function escapeHtml(input: string): string {
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
function applyInlineFormatting(raw: string, diff: boolean): string {
  // Convert tabs to spaces and escape HTML
  const expanded = raw.replace(/\t/g, "    ");
  let html = escapeHtml(expanded);

  if (!diff) {
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/gs, "<strong>$1</strong>");
    // Italics: *text* and _text_
    html = html.replace(/(^|\W)\*(?!\s)(.+?)(?!\s)\*(?=\W|$)/gs, "$1<em>$2</em>");
    html = html.replace(/(^|\W)_(?!\s)(.+?)(?!\s)_(?=\W|$)/gs, "$1<em>$2</em>");

    // Headers: #, ##, ### (descending order of size)
    // Note: Use text-base instead of text-md as 'md' is not a standard Tailwind size
    html = html.replace(/^###\s+(.+)$/gm, '<strong class="text-base">$1</strong>');
    html = html.replace(/^##\s+(.+)$/gm, '<strong class="text-lg">$1</strong>');
    html = html.replace(/^#\s+(.+)$/gm, '<strong class="text-xl">$1</strong>');

    // Error highlight: [[ERROR: text]]
    // Use negative lookahead to ensure we match the final ]] in case of messages ending with brackets like [[ERROR: [MSG]]]
    html = html.replace(/\[\[ERROR:\s*(.+?)\s*\]\](?!\])/gs, '<span class="text-red-500 font-bold bg-red-50 px-1 py-0.5 rounded border border-red-200">$1</span>');
  }

  // Handle Indentation and Lists (Block indents)
  const lines = html.split('\n');
  const processedLines = lines.map(line => {
    if (diff) return line;

    // Matches any line starting with spaces followed by content
    const indentMatch = line.match(/^( +)(.+)$/);
    if (indentMatch) {
      const indentation = indentMatch[1].length;
      const content = indentMatch[2];
      // Use display: block with padding-left to ensure wrapped lines are flush
      // Using 'ch' unit ensures we match the width of the characters fairly well
      return `<span style="display: block; padding-left: ${indentation}ch;">${content}</span>`;
    }

    return line;
  });

  // Rejoin lines. Block elements (display: block) manage their own line breaks.
  let finalHtml = "";
  for (let i = 0; i < processedLines.length; i++) {
    finalHtml += processedLines[i];
    if (i < processedLines.length - 1) {
      // Only add <br/> if both the current and next line are plain text (no block wrapper)
      const isCurrentBlock = processedLines[i].startsWith('<span style="display: block');
      const isNextBlock = processedLines[i + 1].startsWith('<span style="display: block');
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
  // Split into paragraphs by one or more empty lines
  const paragraphs = input.split(/\n\s*\n/);
  return paragraphs
    .map(paragraph => {
      // Don't render empty paragraphs
      if (!paragraph.trim()) return '';
      // Apply inline formatting (which already handles internal newlines)
      const formatted = applyInlineFormatting(paragraph, diff);
      return `<p>${formatted}</p>`;
    })
    .join("");
}

const RichText: React.FC<RichTextProps> = ({
  text,
  className,
  inline = false,
  diff = false,
  mode,
  variant
}) => {
  // Use a <span> for inline mode, otherwise use a <div> fragment
  const Component = inline ? 'span' : 'div';

  // Choose the correct rendering function based on the 'inline' prop
  const html = inline ? applyInlineFormatting(text, diff) : renderBlockText(text, diff);

  return (
    <Component
      className={cn(richTextVariants({ mode: inline ? "inline" : "block", variant }), className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichText;
