// src/components/RemovedTextSidebar.tsx

type Comment = {
  id: string;
  value: string;
};

type RemovedTextSidebarProps = {
  comments: Comment[];
  positions: Record<string, number>;
  onHover: (id: string | null) => void;
  inlineCommentIds: Set<string>;
  onCommentClick: (id: string) => void;
  minHeight?: number; // New prop
};

const PADDING_BETWEEN_COMMENTS = 8;

export default function RemovedTextSidebar({
  comments,
  positions,
  onHover,
  inlineCommentIds,
  onCommentClick,
  minHeight = 0,
}: RemovedTextSidebarProps) {
  const sidebarComments = comments.filter(c => !inlineCommentIds.has(c.id));

  if (sidebarComments.length === 0) {
    return null;
  }

  const sortedComments = [...sidebarComments].sort((a, b) => (positions[a.id] || 0) - (positions[b.id] || 0));

  // Anchor every comment at its true Y (1:1 with the body) and cap its height
  // at the gap to the next comment. Anything taller than that gap is clipped
  // as a preview.
  const slots = new Map<string, { top: number; maxHeight?: number }>();
  for (let i = 0; i < sortedComments.length; i++) {
    const c = sortedComments[i];
    const top = positions[c.id] || 0;
    const next = sortedComments[i + 1];
    const nextTop = next ? (positions[next.id] || 0) : null;
    const maxHeight = nextTop !== null
      ? Math.max(24, nextTop - top - PADDING_BETWEEN_COMMENTS)
      : undefined;
    slots.set(c.id, { top, maxHeight });
  }

  return (
    <div
      className="relative min-h-full"
      style={{ height: minHeight }}
    >
      {sortedComments.map((comment) => {
        const slot = slots.get(comment.id);
        const top = slot?.top ?? 0;
        const maxHeight = slot?.maxHeight;
        return (
          <div
            id={`sidebar-${comment.id}`}
            key={comment.id}
            onClick={() => onCommentClick(comment.id)}
            onMouseEnter={() => onHover(comment.id)}
            onMouseLeave={() => onHover(null)}
            className="absolute w-full p-1 rounded transition-colors duration-200 text-sm text-blue-800 cursor-pointer line-through border border-blue-200 overflow-hidden"
            style={{
              top: `${top}px`,
              maxHeight: maxHeight !== undefined ? `${maxHeight}px` : undefined,
              maskImage: maxHeight !== undefined
                ? "linear-gradient(to bottom, black 70%, transparent 100%)"
                : undefined,
              WebkitMaskImage: maxHeight !== undefined
                ? "linear-gradient(to bottom, black 70%, transparent 100%)"
                : undefined,
            }}
          >
            {comment.value}
          </div>
        );
      })}
    </div>
  );
}