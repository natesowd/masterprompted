import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface HighlightGroup {
  id: string;
  keywords: string[];
}

interface Segment {
  text: string;
  groupId: string | null;
}

/** Map group IDs to highlight background colors */
const GROUP_COLORS: Record<string, string> = {
  format: "rgba(56, 189, 248, 0.3)",
  topic: "rgba(52, 211, 153, 0.35)",
  content: "rgba(167, 139, 250, 0.3)",
  scope: "rgba(251, 191, 36, 0.3)",
  subject: "rgba(251, 113, 133, 0.3)",
};

/**
 * Split text into segments, matching keywords (case-insensitive, longest first).
 */
function segmentText(text: string, groups: HighlightGroup[]): Segment[] {
  const entries: { keyword: string; groupId: string }[] = [];
  for (const g of groups) {
    for (const kw of g.keywords) {
      entries.push({ keyword: kw, groupId: g.id });
    }
  }
  // Longest keywords first to avoid partial matches
  entries.sort((a, b) => b.keyword.length - a.keyword.length);

  if (entries.length === 0) return [{ text, groupId: null }];

  const pattern = entries
    .map((e) => e.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), groupId: null });
    }
    const matchedText = match[0];
    const entry = entries.find(
      (e) => e.keyword.toLowerCase() === matchedText.toLowerCase()
    );
    segments.push({ text: matchedText, groupId: entry?.groupId ?? null });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), groupId: null });
  }

  return segments;
}

interface HighlightableTextProps {
  text: string;
  groups: HighlightGroup[];
  activeGroup: string | null;
  onGroupHover: (groupId: string | null) => void;
  className?: string;
}

/**
 * Renders text with keyword-based highlight segments.
 * Hovering a keyword activates its group, highlighting all matching keywords
 * (including in sibling HighlightableText components sharing the same state).
 */
export default function HighlightableText({
  text,
  groups,
  activeGroup,
  onGroupHover,
  className,
}: HighlightableTextProps) {
  const segments = useMemo(() => segmentText(text, groups), [text, groups]);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (!seg.groupId) {
          return <span key={i}>{seg.text}</span>;
        }

        const isActive = activeGroup === seg.groupId;
        const color = GROUP_COLORS[seg.groupId] || "rgba(253, 224, 71, 0.35)";

        return (
          <span
            key={i}
            className={cn(
              "rounded-sm px-0.5 transition-all duration-200 cursor-default border-b border-dotted",
              isActive
                ? "border-foreground/40"
                : "border-muted-foreground/30",
              activeGroup && !isActive ? "opacity-50" : ""
            )}
            style={{
              backgroundColor: isActive ? color : undefined,
            }}
            onMouseEnter={() => onGroupHover(seg.groupId)}
            onMouseLeave={() => onGroupHover(null)}
          >
            {seg.text}
          </span>
        );
      })}
    </span>
  );
}
