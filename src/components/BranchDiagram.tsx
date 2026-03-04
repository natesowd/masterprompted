import React, { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Monitor, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  predictionTree,
  getNodeAtPath,
  getOptionsForPath,
  getDefaultPath,
  getMaxDepth,
  createEmptySelections,
  END_TOKEN,
  type PredictionNode } from
"@/data/predictionTreeData";

/**
 * BranchDiagram - Visualizes word prediction paths as a horizontal column-based diagram
 * Now driven by dynamic N-ary tree data from predictionTreeData.ts
 */

interface WordTreeDiagramProps {
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  className?: string;
}

export function BranchDiagram({
  selectedPath,
  onPathChange,
  className
}: WordTreeDiagramProps) {
  const maxDepth = useMemo(() => getMaxDepth(), []);
  const defaultPath = useMemo(() => getDefaultPath(), []);

  // Intro animation disabled - start interactive immediately
  const [isIntroAnimating, setIsIntroAnimating] = useState(false);
  const [introLevel, setIntroLevel] = useState(0);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isInteractive, setIsInteractive] = useState(true);

  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [selections, setSelections] = useState<(string | null)[]>(() => createEmptySelections());
  const [hasUserSelected, setHasUserSelected] = useState(false);

  // Sync internal selections with incoming selectedPath prop
  useEffect(() => {
    if (selectedPath && selectedPath.length > 1) {
      // Normalize: handle "European" vs "European Union" at root
      const normalized = [...selectedPath];
      if (normalized[0] === "European" && normalized[1] === "Union") {
        normalized.splice(0, 2, "European Union");
      }

      // Verify the path exists in the tree
      const node = getNodeAtPath(normalized);
      if (node || normalized.length <= 1) {
        const newSelections = createEmptySelections();
        for (let i = 0; i < normalized.length; i++) {
          newSelections[i] = normalized[i];
        }
        setSelections(newSelections);
        setUnlockedLevel(normalized.length);
        if (normalized.length > 1) setHasUserSelected(true);
      }
    }
  }, []);

  // Selection history for ghost trails
  const [selectionHistory, setSelectionHistory] = useState<Array<{
    level: number;
    word: string;
    pathPrefix: string[];
    yPosition: number;
  }>>([]);

  // Ghost tooltip hover state
  const [ghostTooltip, setGhostTooltip] = useState<{visible: boolean;x: number;y: number;}>({
    visible: false, x: 0, y: 0
  });

  // Animation states
  const [animatingLevel, setAnimatingLevel] = useState<number | null>(null);
  const [animatedWord, setAnimatedWord] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(false);
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);
  const [selectedProbability, setSelectedProbability] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const levelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get current path from selections
  const currentPath = useMemo(() => {
    const path: string[] = [predictionTree.word];
    for (let i = 1; i < selections.length; i++) {
      if (selections[i]) path.push(selections[i]!);else
      break;
    }
    return path;
  }, [selections]);

  // Get options at a level based on current selections
  const getOptionsAtLevel = (level: number): {word: string;probability: number;}[] => {
    if (level === 0) return [{ word: predictionTree.word, probability: 1 }];
    const pathToLevel = currentPath.slice(0, level);
    return getOptionsForPath(pathToLevel);
  };

  // Check if the current path has reached a terminal node (can show end-of-sequence)
  const currentNode = useMemo(() => getNodeAtPath(currentPath), [currentPath]);
  const isTerminal = currentNode ? currentNode.children.length === 0 : currentPath[currentPath.length - 1] === END_TOKEN;
  const canEnd = currentNode ? currentNode.endProb > 0 : false;

  // Compute the active depth (how many levels are currently filled)
  const activeDepth = currentPath.length;

  // Determine how many levels to render
  const maxLevelToRender = useMemo(() => {
    // Render up to unlockedLevel + 1 (to show the next options), capped by tree depth
    let depth = 1;
    let node = predictionTree;
    const path = currentPath;
    for (let i = 1; i < path.length; i++) {
      const child = node.children.find((c) => c.word === path[i]);
      if (!child || child.children.length === 0) break;
      depth++;
      node = child;
    }
    // The last selected node may have children - add 1 for the next selection level
    if (currentNode && currentNode.children.length > 0) depth++;
    return Math.max(depth, unlockedLevel);
  }, [currentPath, currentNode, unlockedLevel]);

  // Handle reset
  const handleReset = () => {
    setUnlockedLevel(1);
    setSelections(createEmptySelections());
    setSelectionHistory([]);
    setHasUserSelected(false);
    setAnimatingLevel(null);
    setAnimatedWord(null);
    setShowPulse(false);
    setShowSelectionMessage(false);
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    onPathChange([predictionTree.word]);
  };

  // Handle "Start your own"
  const handleStartOwn = () => {
    setIsInteractive(true);
    handleReset();
  };

  // Handle word selection
  const handleWordClick = (level: number, word: string) => {
    if (!hasUserSelected) setHasUserSelected(true);

    const newSelections = [...selections];

    // Save history
    const historyToAdd: typeof selectionHistory = [];
    for (let i = level; i < newSelections.length; i++) {
      if (newSelections[i]) {
        const pathPrefix = newSelections.slice(0, i).filter(Boolean) as string[];
        const yPosition = getSelectedYAtLevel(i);
        historyToAdd.push({ level: i, word: newSelections[i]!, pathPrefix, yPosition });
      }
    }
    if (historyToAdd.length > 0) {
      setSelectionHistory((prev) => [...prev, ...historyToAdd]);
    }

    // Clear from this level onwards
    for (let i = level; i < newSelections.length; i++) {
      newSelections[i] = null;
    }
    newSelections[level] = word;
    setSelections(newSelections);

    // Unlock next level
    if (level < maxDepth - 1) {
      setUnlockedLevel(level + 1);
    }

    // Notify parent
    const newPath = [predictionTree.word];
    for (let i = 1; i <= level; i++) {
      if (newSelections[i]) newPath.push(newSelections[i]!);
    }
    onPathChange(newPath);
  };

  // Auto-scroll to keep current frontier visible (horizontal + vertical)
  const scrollToFrontier = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const targetEl = levelRefs.current[unlockedLevel];
    if (!targetEl) return;

    const containerRect = container.getBoundingClientRect();
    const levelRect = targetEl.getBoundingClientRect();

    // Horizontal: ensure the frontier level column is fully visible
    const rightOverflow = levelRect.right - containerRect.right + 120;
    if (rightOverflow > 0) {
      container.scrollBy({ left: rightOverflow, behavior: 'smooth' });
    }

    // Vertical: center all option buttons in the viewport
    const buttons = targetEl.querySelectorAll('button');
    if (buttons.length > 1) {
      let minTop = Infinity,maxBottom = -Infinity;
      buttons.forEach((btn) => {
        const r = btn.getBoundingClientRect();
        if (r.top < minTop) minTop = r.top;
        if (r.bottom > maxBottom) maxBottom = r.bottom;
      });
      const buttonsCenterY = (minTop + maxBottom) / 2;
      const containerCenterY = (containerRect.top + containerRect.bottom) / 2;
      const diff = buttonsCenterY - containerCenterY;
      if (Math.abs(diff) > 20) {
        container.scrollTop += diff;
      }
    }
  };

  // Trigger on level/selection changes
  useEffect(() => {
    if (unlockedLevel < 1) return;
    const timer = setTimeout(scrollToFrontier, 150);
    return () => clearTimeout(timer);
  }, [unlockedLevel, selections]);

  // Also trigger on initial mount — retry a few times to handle popovers/tooltips
  useEffect(() => {
    const timers = [300, 600, 1000].map((delay) => setTimeout(scrollToFrontier, delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Play auto-select animation
  const playAnimation = (level: number) => {
    if (animatingLevel !== null) return;
    setAnimatingLevel(level);
    setShowSelectionMessage(false);
    const options = getOptionsAtLevel(level);
    let currentIndex = 0;
    const cycleCount = 8;
    let cycles = 0;
    const interval = setInterval(() => {
      setAnimatedWord(options[currentIndex % options.length].word);
      currentIndex++;
      cycles++;
      if (cycles >= cycleCount) {
        clearInterval(interval);
        const highest = options[0];
        setAnimatedWord(highest.word);
        setSelectedProbability(highest.probability);
        setShowPulse(true);
        setShowSelectionMessage(true);
        setTimeout(() => {
          setShowPulse(false);
          setAnimatedWord(null);
          setAnimatingLevel(null);
          setShowSelectionMessage(false);
          setSelectedProbability(null);
          handleWordClick(level, highest.word);
        }, 1500);
      }
    }, 180);
  };

  // --- Layout constants ---
  const nodeHeight = 40;
  const levelGap = 36;
  const containerHeight = 400;

  const getNodeY = (idx: number, count: number, centerY?: number) => {
    const totalHeight = count * nodeHeight + (count - 1) * levelGap;
    const base = centerY !== undefined ? centerY - totalHeight / 2 : (containerHeight - totalHeight) / 2;
    return base + idx * (nodeHeight + levelGap) + nodeHeight / 2;
  };

  const getSelectedYAtLevel = (level: number): number => {
    if (level === 0) return containerHeight / 2;
    const prevY = getSelectedYAtLevel(level - 1);
    const options = getOptionsAtLevel(level);
    const selectedWord = selections[level];
    const idx = options.findIndex((o) => o.word === selectedWord);
    if (idx >= 0) return getNodeY(idx, options.length, prevY);
    return prevY;
  };

  // Build display headline
  const buildDisplayHeadline = (): string => currentPath.filter(Boolean).join(" ");

  // Get ghost words at a level (lower-probability siblings not shown as main options)
  const getGhostWordsAtLevel = (level: number): {word: string;prob: number;}[] => {
    if (level === 0) return [];
    const pathToLevel = currentPath.slice(0, level);
    const node = getNodeAtPath(pathToLevel);
    if (!node) return [];
    // Get all children sorted by probability, skip top ones that are the main options
    const allChildren = [...node.children].sort((a, b) => b.prob - a.prob);
    // Main options are the ones returned by getOptionsForPath (which are all children sorted)
    // Ghost words would be shown if there were MORE candidates beyond what's displayed
    // Since we show all candidates, show a "+N more" to indicate real LLMs have thousands
    return allChildren.slice(0, 2).map((c) => ({ word: c.word, prob: c.prob }));
  };

  // --- Render functions ---

  const renderLevel = (level: number) => {
    const options = level <= unlockedLevel ? getOptionsAtLevel(level) : [];
    const prevSelectedY = level > 0 ? getSelectedYAtLevel(level - 1) : containerHeight / 2;
    const activeYPositions = options.map((_, idx) => getNodeY(idx, options.length, level > 0 ? prevSelectedY : undefined));

    if (options.length === 0) return null;

    const canSelect = level > 0 && level <= unlockedLevel;
    const isCurrentFrontier = level === unlockedLevel && !selections[level];

    // Ghost data
    const realYPositions = options.map((_, idx) =>
    getNodeY(idx, options.length, level > 0 ? prevSelectedY : undefined)
    );
    const minRealY = Math.min(...realYPositions);
    const maxRealY = Math.max(...realYPositions);

    const ghostChipHeight = 24;
    const ghostGapToReal = 28;
    const ghostGapToDots = 12;
    const dotSizes = [5, 4];
    const dotSpacing = 16;
    const moreSpacing = 12;

    const topRealTop = minRealY - nodeHeight / 2;
    const bottomRealBottom = maxRealY + nodeHeight / 2;

    const ghostAboveTop = topRealTop - ghostGapToReal - ghostChipHeight;
    const ghostBelowTop = bottomRealBottom + ghostGapToReal;

    const dotAboveTops = [
    ghostAboveTop - ghostGapToDots - dotSizes[0],
    ghostAboveTop - ghostGapToDots - dotSizes[0] - dotSpacing - dotSizes[1]];

    const dotBelowTops = [
    ghostBelowTop + ghostChipHeight + ghostGapToDots,
    ghostBelowTop + ghostChipHeight + ghostGapToDots + dotSizes[0] + dotSpacing];

    const moreTop = dotBelowTops[1] + dotSizes[1] + moreSpacing;
    const moreCount = level > 0 ? 30 + level * 7 : 0;

    return (
      <div
        key={level}
        ref={(el) => {levelRefs.current[level] = el;}}
        className="relative"
        style={{ height: containerHeight, minWidth: 110 }}
        {...isCurrentFrontier && level === 1 ? { "data-feature": "word-options" } : {}}>
        
        {/* Ghost elements - only at current frontier */}
        {level > 0 && isCurrentFrontier &&
        <div
          className="cursor-default"
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: containerHeight, pointerEvents: "none" }}>
          
            <div
            onMouseEnter={(e) => setGhostTooltip({ visible: true, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setGhostTooltip({ visible: true, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setGhostTooltip({ visible: false, x: 0, y: 0 })}
            style={{ position: "absolute", top: dotAboveTops[1] - 8, left: -10, right: -10, height: moreTop - dotAboveTops[1] + 60, pointerEvents: "auto" }} />
          

            {/* Ellipsis below */}
            <div style={{ position: "absolute", top: ghostBelowTop, left: "50%", transform: "translateX(-50%)" }}>
              <div
                className="text-base font-medium tracking-widest transition-opacity duration-200"
                style={{ color: ghostTooltip.visible ? "hsl(var(--muted-foreground) / 0.8)" : "hsl(var(--muted-foreground) / 0.4)" }}>
                …
              </div>
            </div>
          </div>
        }

        {/* Active word buttons */}
        <div
          className="absolute"
          style={{
            top: getNodeY(0, options.length, level > 0 ? prevSelectedY : undefined) - nodeHeight / 2 - 4,
            bottom: containerHeight - getNodeY(options.length - 1, options.length, level > 0 ? prevSelectedY : undefined) - nodeHeight / 2 - 4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'fit-content',
            minWidth: 100,
            padding: '0 4px'
          }}
          {...isCurrentFrontier && level === 1 ? { "data-feature": "word-options" } : {}} />
        
        {options.map((option, idx) => {
          const isSelected = selections[level] === option.word;
          const isAnimated = animatingLevel === level && animatedWord === option.word;
          const isPulsing = showPulse && animatingLevel === level && animatedWord === option.word;
          const nodeY = getNodeY(idx, options.length, level > 0 ? prevSelectedY : undefined);

          return (
            <div key={option.word} style={{ position: 'absolute', top: nodeY - nodeHeight / 2, left: 0, right: 0 }}>
              {showSelectionMessage && isPulsing &&
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                    Highest: {selectedProbability !== null ? (selectedProbability * 100).toFixed(0) : 0}%
                  </div>
                </div>
              }

              <button
                onClickCapture={() => canSelect && handleWordClick(level, option.word)}
                disabled={!canSelect}
                data-word={option.word}
                data-selected={isSelected ? "true" : "false"}
                className={cn(
                  "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 whitespace-nowrap",
                  "min-w-[100px] h-11",
                  option.word === END_TOKEN ?
                  (isSelected ?
                    "bg-amber-100 border-amber-400 text-amber-900 shadow-md scale-105 cursor-pointer italic" :
                    canSelect ?
                    "bg-amber-50 border-amber-200 hover:border-amber-400 hover:bg-amber-100 cursor-pointer italic text-amber-700" :
                    "bg-muted/50 border-muted text-muted-foreground/60 cursor-not-allowed italic") :
                  level === 0 ?
                  "bg-primary text-primary-foreground border-primary cursor-default" :
                  isSelected ?
                  "bg-green-200 border-green-400 text-green-900 shadow-md scale-105 cursor-pointer" :
                  canSelect ?
                  "bg-card border-border hover:border-primary/50 hover:bg-muted cursor-pointer" :
                  "bg-muted/50 border-muted text-muted-foreground/60 cursor-not-allowed",
                  isAnimated && !isPulsing && "border-primary bg-primary/10",
                  isPulsing && "bg-primary text-primary-foreground border-primary shadow-lg scale-110"
                )}>
                
                {option.word === END_TOKEN ? "End ." : option.word}
                {level > 0 &&
                <span
                  className={cn(
                    "absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap",
                    isPulsing ? "bg-primary text-primary-foreground" :
                    isSelected ? "bg-green-200 text-green-800" :
                    "bg-muted text-muted-foreground"
                  )}
                  {...idx === 0 && isCurrentFrontier ? { "data-feature": "probability" } : {}}>
                  
                    {option.probability < 0.005 ? '<.01' : option.probability.toFixed(2)}
                  </span>
                }
              </button>
            </div>);

        })}
      </div>);

  };

  // Render connector lines between levels
  const renderConnector = (fromLevel: number, toLevel: number) => {
    if (toLevel > unlockedLevel) return null;
    if (fromLevel > 0 && !selections[fromLevel]) return null;
    const toOptions = getOptionsAtLevel(toLevel);
    if (toOptions.length === 0) return null;

    const fromY = getSelectedYAtLevel(fromLevel);

    return (
      <div key={`conn-${fromLevel}-${toLevel}`} className="flex items-center w-24" style={{ height: containerHeight }}>
        <svg className="w-full h-full" viewBox={`0 0 96 ${containerHeight}`} preserveAspectRatio="none">
          {toOptions.map((toOpt, toIdx) => {
            const toY = getNodeY(toIdx, toOptions.length, fromY);
            const isSelected = selections[toLevel] === toOpt.word;
            const curveOffset = (toIdx * 7 % 5 - 2) * 8;
            const vertOffset = (toIdx * 3 % 3 - 1) * 6;
            return (
              <path
                key={`real-${toOpt.word}`}
                d={`M 0 ${fromY} C ${34 + curveOffset} ${fromY + vertOffset}, ${62 - curveOffset} ${toY - vertOffset}, 96 ${toY}`}
                fill="none"
                stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                strokeWidth={isSelected ? 1.5 : 0.75}
                strokeOpacity={isSelected ? 1 : 0.3} />);


          })}
        </svg>
      </div>);

  };

  const displayHeadline = buildDisplayHeadline();

  // Determine levels to render (dynamic based on tree structure)
  const levelsToRender = useMemo(() => {
    const levels: number[] = [];
    for (let i = 1; i <= Math.min(unlockedLevel, maxDepth - 1); i++) {
      levels.push(i);
    }
    return levels;
  }, [unlockedLevel, maxDepth]);

  return (
    <div className={cn("relative", className)}>
      <div className={cn("transition-all duration-500", isIntroComplete && !isInteractive && "opacity-25 blur-sm pointer-events-none")}>
        {/* Current headline display */}
        <div className="flex items-center justify-between bg-card rounded-lg px-4 py-3 mb-4">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-medium text-foreground">
              {(() => {
                if (!hasUserSelected && isInteractive) {
                  return (
                    <>
                      {defaultPath.map((word, idx) =>
                      <span key={idx}>
                          {idx > 0 && " "}
                          <span className={cn(idx === 0 ? "" : "text-muted-foreground/50")}>{word}</span>
                        </span>
                      )}
                    </>);

                }

                const words = (displayHeadline || predictionTree.word).split(" ");
                if (!isTerminal) {
                  const lastWord = words.pop();
                  const prefix = words.join(" ");
                  return (
                    <>
                      {prefix && <>{prefix} </>}
                      <span className="bg-green-200 text-green-900 px-1 rounded">{lastWord}</span>
                    </>);

                }
                return words.join(" ");
              })()}
              {!isTerminal && displayHeadline && hasUserSelected &&
              <span className="text-muted-foreground/50">...</span>
              }
            </p>
          </div>
          {isInteractive && unlockedLevel > 1 &&
          <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs gap-1.5 ml-4 flex-shrink-0">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          }
        </div>

        {/* Scrollable tree container */}
        <div ref={containerRef} className="overflow-x-auto overflow-y-auto scroll-smooth bg-card rounded-xl py-[20px]" style={{ maxHeight: 'calc(100vh - 420px)' }}>
          <div className="min-w-[1600px] p-6 pr-[320px]">
            <div className="flex items-start gap-1">
              {renderLevel(0)}

              {levelsToRender.map((level) => {
                const isCurrentFrontier = level === unlockedLevel && !selections[level];
                const options = level <= unlockedLevel ? getOptionsAtLevel(level) : [];
                const prevSelectedY = level > 0 ? getSelectedYAtLevel(level - 1) : containerHeight / 2;

                const optionYPositions = options.map((_, idx) =>
                getNodeY(idx, options.length, level > 0 ? prevSelectedY : undefined)
                );
                const minY = Math.min(...optionYPositions);
                const maxY = Math.max(...optionYPositions);
                const centerY = options.length > 0 ? (minY + maxY) / 2 : prevSelectedY;

                return (
                  <React.Fragment key={level}>
                    {renderConnector(level - 1, level)}
                    {renderLevel(level)}

                    {isCurrentFrontier && options.length > 1 &&
                    <div
                      className="relative flex items-center justify-center"
                      style={{ height: containerHeight, width: 40 }}>
                      
                        <div className="absolute" style={{ top: centerY - 14 }}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                onClick={() => playAnimation(level)}
                                disabled={animatingLevel !== null}
                                className={cn(
                                  "p-1.5 rounded-md transition-all duration-200",
                                  animatingLevel === level ?
                                  "bg-primary/20 text-primary animate-pulse" :
                                  "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                                )}>
                                
                                  <Monitor className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>See what word the LLM would be likely to select</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    }
                  </React.Fragment>);

              })}

            </div>
          </div>
        </div>
      </div>

      {/* Start your own overlay */}
      {isIntroComplete && !isInteractive &&
      <div className="absolute left-0 right-0 top-24 flex justify-center animate-fade-in z-10">
          <Button onClick={handleStartOwn} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Start Your Own Headline
          </Button>
        </div>
      }

      {/* Ghost tooltip */}
      {ghostTooltip.visible &&
      <div className="fixed z-50 pointer-events-none animate-fade-in" style={{ left: ghostTooltip.x + 16, top: ghostTooltip.y + 16 }}>
          <div className="bg-card border border-border shadow-lg rounded-lg px-4 py-3 max-w-[280px]">
            <p className="text-sm text-foreground leading-relaxed">
              At each step, the LLM evaluates <strong>thousands of possible next tokens</strong> and assigns a probability to each one. Only the top candidates are shown here.
            </p>
          </div>
        </div>
      }
    </div>);

}