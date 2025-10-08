import React from "react";

type RichTextProps = {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

// Very lightweight Markdown renderer for bold (**text**), italics (*text* or _text_), and newlines
// Escapes HTML first to avoid injection, then applies formatting tokens.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function applyInlineFormatting(raw: string): string {
  // Escape first
  let html = escapeHtml(raw);
  // Emoji shortcodes
  const emojiMap: Record<string, string> = {
    smile: "😊",
    grinning: "😀",
    wink: "😉",
    thumbsup: "👍",
    thumbsdown: "👎",
    rocket: "🚀",
    fire: "🔥",
    star: "⭐",
    tada: "🎉",
    thinking: "🤔",
    warning: "⚠️",
    check: "✅",
    x: "❌",
  };
  html = html.replace(/:([a-z0-9_+\-]+):/gi, (m, p1) => (emojiMap[p1.toLowerCase()] ?? m));
  // Allow common whitespace entities produced by LMs
  html = html
    .replace(/&amp;nbsp;/g, "&nbsp;")
    .replace(/&amp;ensp;/g, "&ensp;")
    .replace(/&amp;emsp;/g, "&emsp;");
  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, (_m, p1) => `<code>${p1}</code>`);
  // Strikethrough: ~~text~~
  html = html.replace(/~~(.+?)~~/gs, "<del>$1</del>");
  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/gs, "<strong>$1</strong>");
  // Italics: *text* and _text_
  html = html.replace(/(^|\W)\*(?!\s)(.+?)(?!\s)\*(?=\W|$)/gs, "$1<em>$2</em>");
  html = html.replace(/(^|\W)_(?!\s)(.+?)(?!\s)_(?=\W|$)/gs, "$1<em>$2</em>");
  return html;
}

function toBasicMarkdownHtml(input: string): string {
  // Normalize newlines
  const text = input.replace(/\r\n?/g, "\n");

  // Extract fenced code blocks first to avoid formatting inside
  const codeBlocks: string[] = [];
  let placeholderIndex = 0;
  const withoutFenced = text.replace(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = escapeHtml(code);
    const cls = lang ? ` class="language-${escapeHtml(lang)}"` : "";
    const html = `<pre class="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-gray-50 p-3 my-3"><code${cls}>${escaped}</code></pre>`;
    const token = `@@CODE_BLOCK_${placeholderIndex}@@`;
    codeBlocks.push(html);
    placeholderIndex += 1;
    return token;
  });

  const lines = withoutFenced.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Headers and blockquotes disabled; fall through to regular paragraph handling

    // Tables: lines that look like pipes. Supports optional separator row.
    if (/^\|.+\|\s*$/.test(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\|.+\|\s*$/.test(lines[i])) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const rows = tableLines.map(l => l.trim().replace(/^\|/, "").replace(/\|$/, "").split(/\s*\|\s*/));
      let headerHtml = "";
      let bodyRows = rows;
      if (rows.length >= 2 && rows[1].every(cell => /^:?-{3,}:?$/.test(cell))) {
        headerHtml = `<thead><tr>${rows[0].map(c => `<th class="text-left font-semibold p-2">${applyInlineFormatting(c)}</th>`).join("")}</tr></thead>`;
        bodyRows = rows.slice(2);
      }
      const bodyHtml = bodyRows.length
        ? `<tbody>${bodyRows.map(r => `<tr>${r.map(c => `<td class="p-2 align-top">${applyInlineFormatting(c)}</td>`).join("")}</tr>`).join("")}</tbody>`
        : "";
      out.push(`<table class="w-full border-collapse my-3 text-sm">${headerHtml || ""}${bodyHtml || ""}</table>`);
      continue;
    }

    // Unordered list: *, -, + at line start
    if (/^(?:\*|\-|\+)\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^(?:\*|\-|\+)\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^(?:\*|\-|\+)\s+/, "");
        items.push(`<li>${applyInlineFormatting(itemText)}</li>`);
        i += 1;
      }
      out.push(`<ul class="list-disc pl-6 my-2 space-y-1">${items.join("")}</ul>`);
      continue;
    }

    // Empty line -> paragraph separator
    if (line.trim() === "") {
      out.push("");
      i += 1;
      continue;
    }

    // Paragraph: collect consecutive non-empty lines until a block starts
    const paraLines: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(?:\*|\-|\+)\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }
    const paraHtml = applyInlineFormatting(paraLines.join("\n")).replace(/\n/g, "<br/>");
    out.push(`<p>${paraHtml}</p>`);
  }

  let html = out.filter(Boolean).join("");

  // Restore fenced code blocks placeholders
  html = html.replace(/@@CODE_BLOCK_(\d+)@@/g, (_m, idx) => codeBlocks[Number(idx)] || "");

  return html;
}

const RichText: React.FC<RichTextProps> = ({ text, className, as = "span" }) => {
  const Component = as as any;
  const html = toBasicMarkdownHtml(text);
  return (
    <Component
      className={className}
      style={{ whiteSpace: 'pre-wrap' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichText;


