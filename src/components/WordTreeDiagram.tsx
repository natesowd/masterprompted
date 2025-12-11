import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * WordTreeDiagram - Visualizes word prediction paths as a horizontal tree diagram
 * @param selectedPath - Currently selected path through the tree
 * @param onPathChange - Callback when user selects a different path
 */

interface TreeNode {
  word: string;
  probability?: string;
  children?: TreeNode[];
  completion?: string;
}

interface WordTreeDiagramProps {
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  className?: string;
}

// Tree data structure for word predictions
const treeData: TreeNode = {
  word: "European Union",
  children: [
    {
      word: "Unites",
      probability: "0.67",
      children: [
        {
          word: "On",
          probability: "0.73",
          completion: "Historic AI Ethics Framework, Charting Path for Responsible Technology Development"
        },
        {
          word: "Around",
          probability: "0.42",
          completion: "Sweeping AI Ethics Charter, Pioneering International Tech Policy Standards"
        },
        {
          word: "Behind",
          probability: "0.12",
          completion: "Historic AI Ethics Framework, Setting Standards for Responsible Innovation"
        }
      ]
    },
    {
      word: "Reaches",
      probability: "0.24",
      children: [
        {
          word: "Consensus",
          probability: "0.65",
          completion: "on Historic AI Ethics Framework, Paving the Way for Responsible Tech Innovation"
        },
        {
          word: "Agreement",
          probability: "0.28",
          completion: "on Historic AI Ethics Framework, Laying Groundwork for Safe Tech Development"
        },
        {
          word: "Milestone",
          probability: "0.07",
          completion: "in AI Ethics, Advancing a Unified Vision for Responsible Innovation"
        }
      ]
    },
    {
      word: "Finalizes",
      probability: "0.09",
      children: [
        {
          word: "Landmark",
          probability: "0.58",
          completion: "AI Ethics Agreement, Setting Global Benchmark for Safe Technology Development"
        },
        {
          word: "Sweeping",
          probability: "0.31",
          completion: "AI Ethics Agreement, Establishing New Norms for Responsible Tech"
        },
        {
          word: "Pioneering",
          probability: "0.11",
          completion: "AI Ethics Framework, Guiding the Future of Safe Innovation"
        }
      ]
    }
  ]
};

export function WordTreeDiagram({ selectedPath, onPathChange, className }: WordTreeDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const isInPath = (level: number, word: string) => {
    if (level === 0) return true; // Root always selected
    if (level === 1) return selectedPath[2]?.toLowerCase() === word.toLowerCase();
    if (level === 2) return selectedPath[3]?.toLowerCase() === word.toLowerCase();
    return false;
  };

  const handleNodeClick = (level: number, node: TreeNode, parentWord?: string) => {
    if (level === 1) {
      // Selecting second word (Unites/Reaches/Finalizes)
      const firstChild = node.children?.[0];
      if (firstChild) {
        onPathChange(["European", "Union", node.word, firstChild.word]);
      }
    } else if (level === 2 && parentWord) {
      // Selecting third word
      onPathChange(["European", "Union", parentWord, node.word]);
    }
  };

  const getSelectedSecondWord = () => selectedPath[2] || "Unites";
  const getSelectedThirdWord = () => selectedPath[3] || "On";

  const selectedSecondNode = treeData.children?.find(
    c => c.word.toLowerCase() === getSelectedSecondWord().toLowerCase()
  );
  const selectedThirdNode = selectedSecondNode?.children?.find(
    c => c.word.toLowerCase() === getSelectedThirdWord().toLowerCase()
  );

  return (
    <div className={cn("relative overflow-x-auto", className)}>
      <div className="min-w-[900px] p-6">
        {/* Tree container */}
        <div className="flex items-start gap-2">
          {/* Level 0: Root */}
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold text-sm shadow-md">
              European Union
            </div>
          </div>

          {/* Connector lines to Level 1 */}
          <div className="flex flex-col items-center justify-center min-h-[400px] w-12">
            <svg className="w-full h-[300px]" viewBox="0 0 48 300" preserveAspectRatio="none">
              {treeData.children?.map((_, idx) => {
                const startY = 150;
                const endY = 50 + idx * 125;
                const isActive = isInPath(1, treeData.children![idx].word);
                return (
                  <path
                    key={idx}
                    d={`M 0 ${startY} C 24 ${startY}, 24 ${endY}, 48 ${endY}`}
                    fill="none"
                    stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                    strokeWidth={isActive ? 3 : 1.5}
                    strokeOpacity={isActive ? 1 : 0.4}
                  />
                );
              })}
            </svg>
          </div>

          {/* Level 1: Second words */}
          <div className="flex flex-col justify-center gap-8 min-h-[400px]">
            {treeData.children?.map((node) => {
              const isActive = isInPath(1, node.word);
              return (
                <button
                  key={node.word}
                  onClick={() => handleNodeClick(1, node)}
                  onMouseEnter={() => setHoveredNode(`l1-${node.word}`)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 min-w-[100px]",
                    isActive
                      ? "bg-green-200 border-green-400 text-green-900 shadow-md scale-105"
                      : "bg-card border-border hover:border-primary/50 hover:bg-muted"
                  )}
                >
                  {node.word}
                  <span className={cn(
                    "absolute -top-5 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded",
                    isActive ? "bg-green-200 text-green-800" : "bg-muted text-muted-foreground"
                  )}>
                    {node.probability}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Connector lines to Level 2 */}
          <div className="flex flex-col items-center justify-center min-h-[400px] w-16">
            <svg className="w-full h-[300px]" viewBox="0 0 64 300" preserveAspectRatio="none">
              {selectedSecondNode?.children?.map((child, idx) => {
                const parentIdx = treeData.children?.findIndex(
                  c => c.word.toLowerCase() === getSelectedSecondWord().toLowerCase()
                ) ?? 0;
                const startY = 50 + parentIdx * 125;
                const baseY = 50;
                const spacing = 100;
                const endY = baseY + idx * spacing;
                const isActive = isInPath(2, child.word);
                return (
                  <path
                    key={idx}
                    d={`M 0 ${startY} C 32 ${startY}, 32 ${endY}, 64 ${endY}`}
                    fill="none"
                    stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                    strokeWidth={isActive ? 3 : 1.5}
                    strokeOpacity={isActive ? 1 : 0.4}
                  />
                );
              })}
            </svg>
          </div>

          {/* Level 2: Third words */}
          <div className="flex flex-col justify-center gap-6 min-h-[400px]">
            {selectedSecondNode?.children?.map((node) => {
              const isActive = isInPath(2, node.word);
              return (
                <button
                  key={node.word}
                  onClick={() => handleNodeClick(2, node, selectedSecondNode.word)}
                  onMouseEnter={() => setHoveredNode(`l2-${node.word}`)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 min-w-[100px]",
                    isActive
                      ? "bg-green-200 border-green-400 text-green-900 shadow-md scale-105"
                      : "bg-card border-border hover:border-primary/50 hover:bg-muted"
                  )}
                >
                  {node.word}
                  <span className={cn(
                    "absolute -top-5 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded",
                    isActive ? "bg-green-200 text-green-800" : "bg-muted text-muted-foreground"
                  )}>
                    {node.probability}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Connector to completion */}
          <div className="flex flex-col items-center justify-center min-h-[400px] w-8">
            <svg className="w-full h-[300px]" viewBox="0 0 32 300" preserveAspectRatio="none">
              {selectedThirdNode && (
                <path
                  d={`M 0 150 L 32 150`}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                />
              )}
            </svg>
          </div>

          {/* Completion text */}
          <div className="flex flex-col justify-center min-h-[400px] max-w-[300px]">
            {selectedThirdNode && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-1">Completion:</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedThirdNode.completion}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full headline preview */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-2">Full Headline:</p>
          <p className="text-lg font-medium text-foreground">
            European Union {getSelectedSecondWord()} {getSelectedThirdWord()} {selectedThirdNode?.completion}
          </p>
        </div>
      </div>
    </div>
  );
}
