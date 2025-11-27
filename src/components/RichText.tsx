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
        block: "prose max-w-none",
        inline: "inline"
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
  let html = escapeHtml(raw);
  
  if (!diff) {
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/gs, "<strong>$1</strong>");
    // Italics: *text* and _text_
    html = html.replace(/(^|\W)\*(?!\s)(.+?)(?!\s)\*(?=\W|$)/gs, "$1<em>$2</em>");
    html = html.replace(/(^|\W)_(?!\s)(.+?)(?!\s)_(?=\W|$)/gs, "$1<em>$2</em>");
  }

  html = html.replace(/\n/g, "<br/>");
  return html;
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
      // Apply inline formatting and convert single newlines to <br>
      const formatted = applyInlineFormatting(paragraph, diff).replace(/\n/g, "<br/>");
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
