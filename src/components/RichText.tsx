// RichText.tsx

import React from "react";

type RichTextProps = {
  text: string;
  className?: string;
  // This prop controls the rendering mode.
  inline?: boolean;
};

// Escapes HTML to prevent injection.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Handles inline markdown formatting like **bold** and *italics*.
function applyInlineFormatting(raw: string): string {
  let html = escapeHtml(raw);
  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/gs, "<strong>$1</strong>");
  // Italics: *text* and _text_
  html = html.replace(/(^|\W)\*(?!\s)(.+?)(?!\s)\*(?=\W|$)/gs, "$1<em>$2</em>");
  html = html.replace(/(^|\W)_(?!\s)(.+?)(?!\s)_(?=\W|$)/gs, "$1<em>$2</em>");
  
  html = html.replace(/\n/g, "<br/>");
  return html;
}

// Handles block-level rendering (paragraphs and line breaks).
function renderBlockText(input: string): string {
  // Split into paragraphs by one or more empty lines
  const paragraphs = input.split(/\n\s*\n/);
  return paragraphs
    .map(paragraph => {
      // Don't render empty paragraphs
      if (!paragraph.trim()) return '';
      // Apply inline formatting and convert single newlines to <br>
      const formatted = applyInlineFormatting(paragraph).replace(/\n/g, "<br/>");
      return `<p>${formatted}</p>`;
    })
    .join("");
}

const RichText: React.FC<RichTextProps> = ({ text, className, inline = false }) => {
  // Use a <span> for inline mode, otherwise use a <div> fragment.
  const Component = inline ? 'span' : 'div';
  
  // Choose the correct rendering function based on the 'inline' prop.
  const html = inline ? applyInlineFormatting(text) : renderBlockText(text);

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichText;