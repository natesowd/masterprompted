import React, { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw, Monitor } from "lucide-react";
import {
  predictionTree,
  getNodeAtPath,
  getOptionsForPath,
  getDefaultPath,
  getMaxDepth,
  getAllLeafPaths,
  createEmptySelections,
  computePathY,
  type PredictionNode } from
"@/data/predictionTreeData";

/**
 * TreeDiagram - Shows all possible sentence branches,
 * with word selection embedded in the SVG. Selecting a word highlights the corresponding branch.
 * Now driven by dynamic N-ary tree data from predictionTreeData.ts
 */

interface TreeDiagramProps {
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  className?: string;
}

export function TreeDiagram({
  selectedPath,
  onPathChange,
  className
}: TreeDiagramProps) {
  const maxDepth = useMemo(() => getMaxDepth(), []);
  const defaultPathWords = useMemo(() => getDefaultPath(), []);
  const allLeafPaths = useMemo(() => getAllLeafPaths(), []);

  // Intro animation disabled - start interactive immediately
  const [isIntroAnimating, setIsIntroAnimating] = useState(false);
  const [introLevel, setIntroLevel] = useState(0);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isInteractive, setIsInteractive] = useState(true);

  // Track selections at each level - tree starts with only root selected
  const [selections, setSelections] = useState<(string | null)[]>(() => createEmptySelections());
  const [currentLevel, setCurrentLevel] = useState(1);
  const [hasUserSelected, setHasUserSelected] = useState(false);

  // Sync internal selections with incoming selectedPath prop
  useEffect(() => {
    if (selectedPath && selectedPath.length > 0) {
      const normalized = [...selectedPath];
      if (normalized[0] === "European" && normalized[1] === "Union") {
        normalized.splice(0, 2, "European Union");
      }
      const node = getNodeAtPath(normalized);
      if (node || normalized.length <= 1) {
        const newSelections = createEmptySelections();
        for (let i = 0; i < normalized.length; i++) {
          newSelections[i] = normalized[i];
        }
        setSelections(newSelections);
        setCurrentLevel(normalized.length);
        if (normalized.length > 1) setHasUserSelected(true);
      }
    }
  }, []);

  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedWord, setAnimatedWord] = useState<string | null>(null);
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);
  const [selectedProbability, setSelectedProbability] = useState<number | null>(null);
  const [closeUpView, setCloseUpView] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get current path from selections
  const currentPath = useMemo(() => {
    const path: string[] = [predictionTree.word];
    for (let i = 1; i < selections.length; i++) {
      if (selections[i]) path.push(selections[i]!);else
      break;
    }
    return path;
  }, [selections]);

  // Current node at end of selected path
  const currentNode = useMemo(() => getNodeAtPath(currentPath), [currentPath]);
  const isTerminal = currentNode ? currentNode.children.length === 0 : false;

  // Get options at each level based on current selections
  const getOptionsAtLevel = (level: number): {word: string;probability: number;}[] => {
    if (level === 0) return [{ word: predictionTree.word, probability: 1 }];
    const pathToLevel = currentPath.slice(0, level);
    return getOptionsForPath(pathToLevel);
  };

  // Current level options
  const currentOptions = useMemo(() => {
    if (currentLevel >= maxDepth || isTerminal) return [];
    return getOptionsAtLevel(currentLevel);
  }, [currentLevel, currentPath, isTerminal]);

  // Check if a leaf path matches current selections
  const leafPathMatchesSelections = (leafWords: string[]): boolean => {
    for (let i = 0; i < currentLevel && i < leafWords.length; i++) {
      if (selections[i] && leafWords[i] !== selections[i]) return false;
    }
    return true;
  };

  // Handle word selection
  const handleWordClick = (level: number, word: string) => {
    if (!isInteractive) return;
    if (!hasUserSelected) setHasUserSelected(true);

    const newSelections = [...selections];
    for (let i = level; i < newSelections.length; i++) {
      newSelections[i] = null;
    }
    newSelections[level] = word;
    setSelections(newSelections);
    setCurrentLevel(level + 1);

    const newPath = newSelections.filter(Boolean) as string[];
    onPathChange(newPath);
  };

  // Handle "Start your own"
  const handleStartOwn = () => {
    setIsInteractive(true);
    handleReset();
  };

  // Reset
  const handleReset = () => {
    setSelections(createEmptySelections());
    setCurrentLevel(1);
    setHasUserSelected(false);
    setIsAnimating(false);
    setAnimatedWord(null);
    setShowSelectionMessage(false);
    setSelectedProbability(null);
    onPathChange([predictionTree.word]);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  // Play computer selection animation
  const playAnimation = () => {
    if (isAnimating || currentOptions.length === 0) return;
    setIsAnimating(true);
    setShowSelectionMessage(false);
    const options = currentOptions;
    let cycleIndex = 0;
    const cycleCount = 8;
    const interval = setInterval(() => {
      setAnimatedWord(options[cycleIndex % options.length].word);
      cycleIndex++;
      if (cycleIndex >= cycleCount) {
        clearInterval(interval);
        const highestProb = options.reduce((a, b) => a.probability > b.probability ? a : b);
        setAnimatedWord(highestProb.word);
        setSelectedProbability(highestProb.probability);
        setShowSelectionMessage(true);
        setTimeout(() => {
          handleWordClick(currentLevel, highestProb.word);
          setAnimatedWord(null);
          setShowSelectionMessage(false);
          setSelectedProbability(null);
          setIsAnimating(false);
        }, 1500);
      }
    }, 150);
  };

  // --- Layout ---
  const stepX = closeUpView ? 240 : 160;
  const firstWordWidth = 124;
  const leftPadding = firstWordWidth / 2 + 6;
  const svgCenterY = 500; // generous center for layout computation

  // Compute Y for a leaf path at a specific level
  const getPathY = (pathWords: string[], level: number): number => {
    return computePathY(pathWords, level, selections, currentLevel, svgCenterY);
  };

  // Find Y range across all paths to determine SVG height
  const { svgMinY, svgMaxY, svgHeight, adjustedCenterY } = useMemo(() => {
    let minY = svgCenterY;
    let maxY = svgCenterY;
    for (const leafPath of allLeafPaths) {
      for (let level = 0; level <= leafPath.words.length - 1; level++) {
        const y = computePathY(leafPath.words, level, selections, currentLevel, svgCenterY);
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    const padding = 80;
    const height = Math.max(400, maxY - minY + padding * 2);
    return { svgMinY: minY - padding, svgMaxY: maxY + padding, svgHeight: height, adjustedCenterY: svgCenterY };
  }, [allLeafPaths, selections, currentLevel]);

  const svgWidth = leftPadding + (maxDepth - 1) * stepX + 100;
  const viewBoxY = svgMinY;

  // X position for a given level
  const levelX = (level: number) => leftPadding + level * stepX;

  // Auto-scroll when currentLevel or selections change to keep options visible
  useEffect(() => {
    const scrollToFrontier = (behavior: ScrollBehavior = "smooth") => {
      const cont = scrollContainerRef.current;
      if (!cont) return;
      const containerWidth = cont.clientWidth;
      const containerHeight = cont.clientHeight;

      // Horizontal: ensure the current frontier options are visible
      const nextLevelXPos = levelX(currentLevel);
      const targetLeft = currentLevel <= 1 ? 0 : Math.max(0, nextLevelXPos - containerWidth + 250);

      // Vertical: center on all options at the frontier
      const options = currentLevel < maxDepth ? getOptionsForPath(currentPath) : [];
      let targetTop: number;
      if (options.length > 0) {
        const optionYs = options.map(opt => {
          const hypotheticalPath = [...currentPath, opt.word];
          return computePathY(hypotheticalPath, currentLevel, selections, currentLevel, adjustedCenterY);
        });
        const minY = Math.min(...optionYs);
        const maxY = Math.max(...optionYs);
        const centerY = (minY + maxY) / 2;
        targetTop = Math.max(0, centerY - viewBoxY - containerHeight / 2);
      } else {
        const selectedY = computePathY(currentPath, currentPath.length - 1, selections, currentLevel, adjustedCenterY);
        targetTop = Math.max(0, selectedY - viewBoxY - containerHeight / 2);
      }
      cont.scrollTo({ left: targetLeft, top: targetTop, behavior });
    };

    // Use multiple timers to ensure DOM has settled
    const t1 = setTimeout(() => scrollToFrontier("smooth"), 80);
    const t2 = setTimeout(() => scrollToFrontier("smooth"), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [currentLevel, selections, viewBoxY, adjustedCenterY]);

  // Build display headline
  const displayHeadline = currentPath.filter(Boolean).join(" ");

  // Get the selected path's Y at a given level
  const getSelectedPathY = (level: number): number => {
    return computePathY(currentPath, level, selections, currentLevel, adjustedCenterY);
  };

  // Compute option Y position: for a word at the current frontier level
  const getOptionY = (word: string): number => {
    // Build a hypothetical path with this word at currentLevel
    const hypotheticalPath = [...currentPath, word];
    return computePathY(hypotheticalPath, currentLevel, selections, currentLevel, adjustedCenterY);
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "space-y-6 transition-all duration-500",
        isIntroComplete && !isInteractive && "opacity-25 blur-sm pointer-events-none"
      )}>
        {/* Current headline header */}
        <div className="flex items-center justify-between bg-card rounded-lg px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-xl font-medium text-foreground">
              {(() => {
                // Show full default sentence greyed out when user hasn't selected yet
                if (!hasUserSelected && isInteractive) {
                  return (
                    <>
                      {defaultPathWords.map((word, idx) =>
                      <span key={idx}>
                          {idx > 0 && " "}
                          <span className={cn(idx === 0 ? "" : "text-muted-foreground/50")}>
                            {word}
                          </span>
                        </span>
                      )}
                    </>);

                }

                // Normal display with last word highlighted
                const words = displayHeadline.split(" ");
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
          {isInteractive && currentLevel > 1 &&
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs gap-1.5 ml-4 flex-shrink-0">

              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          }
        </div>

        {/* Tree visualization */}
        <div className="flex flex-col gap-4">
          <div className="bg-card rounded-xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 420px)' }}>
            <div
              className={cn(
                "h-full",
                "overflow-x-auto overflow-y-auto"
              )}
              ref={scrollContainerRef}>

              <div className={cn("p-6 py-0 px-0", currentLevel > 1 ? "min-w-[600px]" : "")}>
                <svg
                  style={{
                    height: svgHeight,
                    width: currentLevel <= 1 ? '100%' : svgWidth,
                    maxHeight: undefined
                  }}
                  width={svgWidth}
                  height={svgHeight}
                  viewBox={`0 ${viewBoxY} ${svgWidth} ${svgHeight}`}
                  preserveAspectRatio="xMidYMid meet" className="my-[10px] py-0">

                  {/* Draw all leaf paths as branch lines */}
                  {allLeafPaths.map((leafPath, pathIndex) => {
                    const isMatching = leafPathMatchesSelections(leafPath.words);

                    // Compute points for this path
                    const points = leafPath.words.map((_, level) => ({
                      x: levelX(level),
                      y: computePathY(leafPath.words, level, selections, currentLevel, adjustedCenterY)
                    }));

                    // Create curved path
                    const pathD =
                    `M ${points[0].x} ${points[0].y} ` +
                    points.slice(1).map((p, i) => {
                      const prev = points[i];
                      const cpX = (prev.x + p.x) / 2;
                      return `C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
                    }).join(" ");

                    return (
                      <path
                        key={pathIndex}
                        d={pathD}
                        fill="none"
                        stroke={isMatching ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                        strokeWidth={isMatching ? 0.75 : 0.35}
                        opacity={isMatching ? 1 : 0.15}
                        className="transition-all duration-300" />);


                  })}

                  {/* Words along the selected path */}
                  {currentPath.map((word, level) => {
                    if (!word) return null;
                    const x = levelX(level);
                    const y = getSelectedPathY(level);
                    const isClickable = level > 0;

                    const handleWordClickOnTree = () => {
                      if (!isClickable) return;
                      const newSelections = [...selections];
                      for (let i = level; i < newSelections.length; i++) {
                        newSelections[i] = null;
                      }
                      setSelections(newSelections);
                      setCurrentLevel(level);
                      onPathChange(newSelections.filter(Boolean) as string[]);
                    };

                    const wordWidth = Math.max(70, word.length * 10 + 16);
                    const rectHeight = 28;
                    const isLatestSelection = level > 0 && level === currentLevel - 1;

                    // Get probability from tree
                    const node = getNodeAtPath(currentPath.slice(0, level + 1));
                    const parentNode = level > 0 ? getNodeAtPath(currentPath.slice(0, level)) : null;
                    const probability = parentNode ?
                    parentNode.children.find((c) => c.word === word)?.prob ?? 1 :
                    1;

                    return (
                      <g
                        key={`word-${level}`}
                        onClick={handleWordClickOnTree}
                        className={cn(isClickable && "cursor-pointer")}
                        style={{ pointerEvents: isClickable ? 'all' : 'none' }}>

                        {level > 0 &&
                        <text
                          x={x}
                          y={y - rectHeight / 2 - 6}
                          textAnchor="middle"
                          className="text-[10px] font-medium pointer-events-none select-none"
                          fill={isLatestSelection ? "hsl(142 76% 36%)" : "hsl(var(--muted-foreground))"}>

                            {probability.toFixed(2)}
                          </text>
                        }
                        <rect
                          x={x - wordWidth / 2}
                          y={y - rectHeight / 2}
                          width={wordWidth}
                          height={rectHeight}
                          rx={8}
                          fill={isLatestSelection ? "hsl(142 76% 90%)" : level === 0 ? "hsl(var(--primary))" : "hsl(142 76% 90%)"}
                          stroke={isLatestSelection ? "hsl(142 76% 56%)" : level === 0 ? "hsl(var(--primary))" : "hsl(142 76% 56%)"}
                          strokeWidth={2}
                          className={cn("transition-all duration-200", isClickable && "cursor-pointer")} />

                        <text
                          x={x}
                          y={y + 5}
                          textAnchor="middle"
                          className="text-[12px] font-semibold pointer-events-none select-none"
                          fill={level === 0 ? "hsl(var(--primary-foreground))" : "hsl(142 76% 20%)"}>

                          {word}
                        </text>
                      </g>);

                  })}

                  {/* Selection buttons at current frontier */}
                  {currentOptions.length > 0 && isInteractive && (() => {
                    const x = levelX(currentLevel);
                    const buttonWidth = 100;
                    const buttonHeight = 44;
                    const foreignObjectPadTop = 18;

                    return currentOptions.map((opt, idx) => {
                      const optY = getOptionY(opt.word);
                      const isAnimated = animatedWord === opt.word;

                      return (
                        <g key={`option-${idx}`}>
                          {/* Background occluder */}
                          <rect
                            x={x - buttonWidth / 2 - 6}
                            y={optY - buttonHeight / 2 - foreignObjectPadTop - 6}
                            width={buttonWidth + 12}
                            height={buttonHeight + foreignObjectPadTop + 12}
                            rx={12}
                            fill="hsl(var(--background))" />

                          <foreignObject
                            x={x - buttonWidth / 2}
                            y={optY - buttonHeight / 2 - foreignObjectPadTop}
                            width={buttonWidth}
                            height={buttonHeight + foreignObjectPadTop}>

                            <div className="flex justify-center h-full items-end pb-0">
                              <button
                                onClickCapture={() => handleWordClick(currentLevel, opt.word)}
                                disabled={isAnimating}
                                className={cn(
                                  "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 whitespace-nowrap min-w-[100px] h-11",
                                  "bg-card border-border hover:border-primary/50 hover:bg-muted cursor-pointer",
                                  isAnimated && "border-primary bg-primary/10"
                                )}>

                                {opt.word}
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap bg-muted text-muted-foreground">
                                  {opt.probability.toFixed(2)}
                                </span>
                              </button>
                            </div>
                          </foreignObject>
                        </g>);

                    });
                  })()}

                  {/* Auto-select button between word options */}
                  {currentOptions.length >= 2 && isInteractive && (() => {
                    const x = levelX(currentLevel);
                    const option1Y = getOptionY(currentOptions[0].word);
                    const option2Y = getOptionY(currentOptions[currentOptions.length - 1].word);
                    const centerY = (option1Y + option2Y) / 2;
                    const buttonSize = 32;

                    return (
                      <foreignObject
                        x={x - buttonSize / 2}
                        y={centerY - buttonSize / 2}
                        width={buttonSize}
                        height={buttonSize}
                        style={{ overflow: 'visible' }}>

                        <button
                          onClick={() => !isAnimating && playAnimation()}
                          disabled={isAnimating}
                          className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center",
                            "bg-muted hover:bg-accent transition-all duration-200 cursor-pointer",
                            isAnimating && "opacity-50 pointer-events-none"
                          )}
                          title="Watch LLM select highest probability">

                          <Monitor className={cn("h-4 w-4 text-muted-foreground", isAnimating && "text-primary animate-pulse")} />
                        </button>
                      </foreignObject>);

                  })()}
                </svg>
              </div>
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
    </div>);

}