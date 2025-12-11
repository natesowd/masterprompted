import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Monitor } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  children: [{
    word: "Unites",
    probability: "0.67",
    children: [{
      word: "On",
      probability: "0.73",
      completion: "Historic AI Ethics Framework, Charting Path for Responsible Technology Development"
    }, {
      word: "Around",
      probability: "0.42",
      completion: "Sweeping AI Ethics Charter, Pioneering International Tech Policy Standards"
    }, {
      word: "Behind",
      probability: "0.12",
      completion: "Historic AI Ethics Framework, Setting Standards for Responsible Innovation"
    }]
  }, {
    word: "Reaches",
    probability: "0.24",
    children: [{
      word: "Consensus",
      probability: "0.65",
      completion: "on Historic AI Ethics Framework, Paving the Way for Responsible Tech Innovation"
    }, {
      word: "Agreement",
      probability: "0.28",
      completion: "on Historic AI Ethics Framework, Laying Groundwork for Safe Tech Development"
    }, {
      word: "Milestone",
      probability: "0.07",
      completion: "in AI Ethics, Advancing a Unified Vision for Responsible Innovation"
    }]
  }, {
    word: "Finalizes",
    probability: "0.09",
    children: [{
      word: "Landmark",
      probability: "0.58",
      completion: "AI Ethics Agreement, Setting Global Benchmark for Safe Technology Development"
    }, {
      word: "Sweeping",
      probability: "0.31",
      completion: "AI Ethics Agreement, Establishing New Norms for Responsible Tech"
    }, {
      word: "Pioneering",
      probability: "0.11",
      completion: "AI Ethics Framework, Guiding the Future of Safe Innovation"
    }]
  }]
};

export function WordTreeDiagram({
  selectedPath,
  onPathChange,
  className
}: WordTreeDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Animation states for Level 1
  const [isAnimatingL1, setIsAnimatingL1] = useState(false);
  const [animatedWordL1, setAnimatedWordL1] = useState<string | null>(null);
  const [showPulseL1, setShowPulseL1] = useState(false);
  
  // Animation states for Level 2
  const [isAnimatingL2, setIsAnimatingL2] = useState(false);
  const [animatedWordL2, setAnimatedWordL2] = useState<string | null>(null);
  const [showPulseL2, setShowPulseL2] = useState(false);

  const playLevel1Animation = () => {
    if (isAnimatingL1) return;
    setIsAnimatingL1(true);
    
    const options = treeData.children?.map(c => c.word) || [];
    let currentIndex = 0;
    const cycleCount = 8;
    let cycles = 0;
    
    const interval = setInterval(() => {
      setAnimatedWordL1(options[currentIndex % options.length]);
      currentIndex++;
      cycles++;
      
      if (cycles >= cycleCount) {
        clearInterval(interval);
        // Land on highest probability (Unites = 0.67)
        setAnimatedWordL1("Unites");
        setShowPulseL1(true);
        
        setTimeout(() => {
          setShowPulseL1(false);
          setAnimatedWordL1(null);
          setIsAnimatingL1(false);
        }, 2000);
      }
    }, 200);
  };

  const playLevel2Animation = () => {
    if (isAnimatingL2) return;
    setIsAnimatingL2(true);
    
    const selectedSecond = treeData.children?.find(c => c.word.toLowerCase() === (selectedPath[2] || "Unites").toLowerCase());
    const options = selectedSecond?.children?.map(c => c.word) || [];
    const highestProb = selectedSecond?.children?.reduce((a, b) => 
      parseFloat(a.probability || "0") > parseFloat(b.probability || "0") ? a : b
    );
    
    let currentIndex = 0;
    const cycleCount = 8;
    let cycles = 0;
    
    const interval = setInterval(() => {
      setAnimatedWordL2(options[currentIndex % options.length]);
      currentIndex++;
      cycles++;
      
      if (cycles >= cycleCount) {
        clearInterval(interval);
        setAnimatedWordL2(highestProb?.word || options[0]);
        setShowPulseL2(true);
        
        setTimeout(() => {
          setShowPulseL2(false);
          setAnimatedWordL2(null);
          setIsAnimatingL2(false);
        }, 2000);
      }
    }, 200);
  };
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
  const selectedSecondNode = treeData.children?.find(c => c.word.toLowerCase() === getSelectedSecondWord().toLowerCase());
  const selectedThirdNode = selectedSecondNode?.children?.find(c => c.word.toLowerCase() === getSelectedThirdWord().toLowerCase());
  // Calculate node positions for accurate line drawing
  const nodeHeight = 40;
  const level1Gap = 48; // gap-12 = 48px
  const level2Gap = 40; // gap-10 = 40px
  const level1Count = treeData.children?.length || 3;
  const level2Count = selectedSecondNode?.children?.length || 3;
  
  const level1TotalHeight = level1Count * nodeHeight + (level1Count - 1) * level1Gap;
  const level2TotalHeight = level2Count * nodeHeight + (level2Count - 1) * level2Gap;
  
  const containerHeight = Math.max(level1TotalHeight, level2TotalHeight) + 80;
  
  const getLevel1Y = (idx: number) => {
    const startOffset = (containerHeight - level1TotalHeight) / 2;
    return startOffset + idx * (nodeHeight + level1Gap) + nodeHeight / 2;
  };
  
  const getLevel2Y = (idx: number) => {
    const startOffset = (containerHeight - level2TotalHeight) / 2;
    return startOffset + idx * (nodeHeight + level2Gap) + nodeHeight / 2;
  };
  
  const rootY = containerHeight / 2;

  return <div className={cn("relative overflow-x-auto", className)}>
      <div className="min-w-[900px] p-6">
        {/* Tree container */}
        <div className="flex items-start gap-2">
          {/* Level 0: Root */}
          <div className="flex flex-col items-center justify-center" style={{ height: containerHeight }}>
            <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold text-sm shadow-md">
              European Union
            </div>
          </div>

          {/* Connector lines to Level 1 */}
          <div className="flex flex-col items-center justify-center w-16" style={{ height: containerHeight }}>
            <svg className="w-full h-full" viewBox={`0 0 64 ${containerHeight}`} preserveAspectRatio="none">
              {treeData.children?.map((_, idx) => {
                const startY = rootY;
                const endY = getLevel1Y(idx);
                const isActive = isInPath(1, treeData.children![idx].word);
                return <path key={idx} d={`M 0 ${startY} C 32 ${startY}, 32 ${endY}, 64 ${endY}`} fill="none" stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} strokeWidth={isActive ? 3 : 1.5} strokeOpacity={isActive ? 1 : 0.4} />;
              })}
            </svg>
          </div>

          {/* Level 1: Second words */}
          <div className="flex flex-col" style={{ height: containerHeight }}>
            {/* Monitor button above */}
            <div className="flex justify-center mb-2 pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={playLevel1Animation}
                      disabled={isAnimatingL1}
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        isAnimatingL1 
                          ? "bg-primary/20 text-primary animate-pulse" 
                          : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      )}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Watch LLM select word</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {/* Word buttons */}
            <div className="flex flex-col justify-center gap-12 flex-1">
              {treeData.children?.map(node => {
                const isActive = isInPath(1, node.word);
                const isAnimated = animatedWordL1 === node.word;
                const isPulsing = showPulseL1 && animatedWordL1 === node.word;
                return <button 
                  key={node.word} 
                  onClick={() => handleNodeClick(1, node)} 
                  onMouseEnter={() => setHoveredNode(`l1-${node.word}`)} 
                  onMouseLeave={() => setHoveredNode(null)} 
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 min-w-[100px] h-10",
                    isActive ? "bg-green-200 border-green-400 text-green-900 shadow-md scale-105" : "bg-card border-border hover:border-primary/50 hover:bg-muted",
                    isAnimated && !isPulsing && "ring-2 ring-primary ring-offset-2 bg-primary/10",
                    isPulsing && "ring-4 ring-green-400 ring-offset-2 bg-green-200 border-green-400 text-green-900 animate-pulse scale-110"
                  )}>
                  {node.word}
                  <span className={cn("absolute -top-5 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded", isActive ? "bg-green-200 text-green-800" : "bg-muted text-muted-foreground")}>
                    {node.probability}
                  </span>
                </button>;
              })}
            </div>
          </div>

          {/* Connector lines to Level 2 */}
          <div className="flex flex-col items-center justify-center w-20" style={{ height: containerHeight }}>
            <svg className="w-full h-full" viewBox={`0 0 80 ${containerHeight}`} preserveAspectRatio="none">
              {selectedSecondNode?.children?.map((child, idx) => {
                const parentIdx = treeData.children?.findIndex(c => c.word.toLowerCase() === getSelectedSecondWord().toLowerCase()) ?? 0;
                const startY = getLevel1Y(parentIdx);
                const endY = getLevel2Y(idx);
                const isActive = isInPath(2, child.word);
                return <path key={idx} d={`M 0 ${startY} C 40 ${startY}, 40 ${endY}, 80 ${endY}`} fill="none" stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} strokeWidth={isActive ? 3 : 1.5} strokeOpacity={isActive ? 1 : 0.4} />;
              })}
            </svg>
          </div>

          {/* Level 2: Third words */}
          <div className="flex flex-col" style={{ height: containerHeight }}>
            {/* Monitor button above */}
            <div className="flex justify-center mb-2 pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={playLevel2Animation}
                      disabled={isAnimatingL2}
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        isAnimatingL2 
                          ? "bg-primary/20 text-primary animate-pulse" 
                          : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      )}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Watch LLM select word</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {/* Word buttons */}
            <div className="flex flex-col justify-center gap-10 flex-1">
              {selectedSecondNode?.children?.map(node => {
                const isActive = isInPath(2, node.word);
                const isAnimated = animatedWordL2 === node.word;
                const isPulsing = showPulseL2 && animatedWordL2 === node.word;
                return <button 
                  key={node.word} 
                  onClick={() => handleNodeClick(2, node, selectedSecondNode.word)} 
                  onMouseEnter={() => setHoveredNode(`l2-${node.word}`)} 
                  onMouseLeave={() => setHoveredNode(null)} 
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 min-w-[100px] h-10",
                    isActive ? "bg-green-200 border-green-400 text-green-900 shadow-md scale-105" : "bg-card border-border hover:border-primary/50 hover:bg-muted",
                    isAnimated && !isPulsing && "ring-2 ring-primary ring-offset-2 bg-primary/10",
                    isPulsing && "ring-4 ring-green-400 ring-offset-2 bg-green-200 border-green-400 text-green-900 animate-pulse scale-110"
                  )}>
                  {node.word}
                  <span className={cn("absolute -top-5 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded", isActive ? "bg-green-200 text-green-800" : "bg-muted text-muted-foreground")}>
                    {node.probability}
                  </span>
                </button>;
              })}
            </div>
          </div>

          {/* Connector to completion */}
          <div className="flex flex-col items-center justify-center w-8" style={{ height: containerHeight }}>
            <svg className="w-full h-full" viewBox={`0 0 32 ${containerHeight}`} preserveAspectRatio="none">
              {selectedThirdNode && (() => {
                const thirdIdx = selectedSecondNode?.children?.findIndex(c => c.word.toLowerCase() === getSelectedThirdWord().toLowerCase()) ?? 0;
                const lineY = getLevel2Y(thirdIdx);
                return <path d={`M 0 ${lineY} L 32 ${lineY}`} fill="none" stroke="hsl(var(--primary))" strokeWidth={3} />;
              })()}
            </svg>
          </div>

          {/* Completion text */}
          <div className="flex flex-col justify-center max-w-[300px]" style={{ height: containerHeight }}>
            {selectedThirdNode && <div className="bg-muted/50 border border-border rounded-lg p-4 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-1">Completion:</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedThirdNode.completion}
                </p>
              </div>}
          </div>
        </div>
      </div>
    </div>;
}