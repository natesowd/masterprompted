// src/components/RemovedTextSidebar.tsx

type Comment = {
  id: string;
  value: string;
};

type RemovedTextSidebarProps = {
  comments: Comment[];
  positions: Record<string, number>;
  hoveredCommentId: string | null;
  onHover: (id: string | null) => void;
  inlineCommentIds: Set<string>;
  onCommentClick: (id: string) => void;
};

const PADDING_BETWEEN_COMMENTS = 8; // in pixels

export default function RemovedTextSidebar({ 
  comments, 
  positions, 
  hoveredCommentId, 
  onHover, 
  inlineCommentIds, 
  onCommentClick 
}: RemovedTextSidebarProps) {

  // Filter out comments that are currently shown inline
  const sidebarComments = comments.filter(c => !inlineCommentIds.has(c.id));

  if (sidebarComments.length === 0) {
    return null;
  }

  // Sort comments by their vertical position to handle overlaps correctly
  const sortedComments = [...sidebarComments].sort((a, b) => (positions[a.id] || 0) - (positions[b.id] || 0));
  
  const positionedComments = new Map<string, number>();
  let lastBottom = 0;

  sortedComments.forEach(comment => {
    const el = document.getElementById(comment.id);
    const height = el ? el.offsetHeight : 50; // Estimate height if not rendered yet
    const desiredTop = positions[comment.id] || 0;

    // Adjust position to prevent overlap with the previous comment
    const newTop = Math.max(desiredTop, lastBottom);
    positionedComments.set(comment.id, newTop);
    lastBottom = newTop + height + PADDING_BETWEEN_COMMENTS;
  });

  return (
    <div className="relative h-full">
      {sortedComments.map((comment) => (
        <div
          id={comment.id}
          key={comment.id}
          onClick={() => onCommentClick(comment.id)}
          onMouseEnter={() => onHover(comment.id)}
          onMouseLeave={() => onHover(null)}
          className={`absolute w-full p-1 rounded transition-all duration-200 text-sm text-red-800 cursor-pointer line-through
          ${hoveredCommentId === comment.id ? 'bg-red-200/60' : ''}`}
          style={{ 
            top: `${positionedComments.get(comment.id) ?? 0}px`,
            backgroundColor: hoveredCommentId === comment.id ? 'rgba(254, 202, 202, 0.6)' : 'transparent',
          }}
        >
          {comment.value}
        </div>
      ))}
    </div>
  );
}