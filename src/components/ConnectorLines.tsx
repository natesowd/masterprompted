// src/components/ConnectorLines.tsx

import React from 'react';

type Position = { top: number; left: number; right: number; bottom: number };

interface ConnectorLinesProps {
  hoveredId: string | null;
  markerPositions: Record<string, Position>;
  commentPositions: Record<string, Position>;
  sidebarRect: DOMRect | null;
}

const ConnectorLines: React.FC<ConnectorLinesProps> = ({
  hoveredId,
  markerPositions,
  commentPositions,
  sidebarRect,
}) => {
  if (!hoveredId || !markerPositions[hoveredId] || !sidebarRect) {
    return null;
  }

  const startPos = markerPositions[hoveredId];
  const endPos = commentPositions[hoveredId];

  // Vertical center of the starting icon
  const startY = startPos.top + startPos.bottom / 2 - startPos.top / 2;
  const startX = startPos.right;

  let endY: number;
  const endX = endPos ? endPos.left : sidebarRect.left;

  // Check if the corresponding comment is visible within the sidebar
  if (endPos && endPos.top < sidebarRect.bottom && endPos.bottom > sidebarRect.top) {
    // It's visible, target its vertical center
    endY = endPos.top + endPos.bottom / 2 - endPos.top / 2;
  } else {
    // Not visible, point to the top or bottom edge of the sidebar
    if (endPos && endPos.top < sidebarRect.top) {
      endY = sidebarRect.top + 5; // Point to top
    } else {
      endY = sidebarRect.bottom - 5; // Point to bottom
    }
  }
  
  // Define control points for a smooth Bézier curve
  const controlX1 = startX + 60;
  const controlY1 = startY;
  const controlX2 = endX - 60;
  const controlY2 = endY;

  const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

  return (
    <svg
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <path
        d={pathData}
        stroke="rgba(156, 163, 175, 0.5)" // A faint gray color
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export default ConnectorLines;