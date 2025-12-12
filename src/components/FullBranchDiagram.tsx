import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw, Monitor } from "lucide-react";

/**
 * FullBranchDiagram - Shows all words on the tree with one selected branch highlighted.
 * Word selection moved to bottom with computer animation button.
 */

interface TreePath {
  words: string[];
  probabilities: number[];
  headline: string;
}

// All 64 paths data
const treePaths: TreePath[] = [
  { words: ["European Union", "Unites", "On", "Historic", "AI", "Ethics", "Framework"], probabilities: [1, 0.34, 0.28, 0.41, 0.52, 0.67, 0.45], headline: "Charting Path for Responsible Technology Development" },
  { words: ["European Union", "Unites", "On", "Historic", "AI", "Ethics", "Charter"], probabilities: [1, 0.34, 0.28, 0.41, 0.52, 0.67, 0.33], headline: "Amid Growing Concerns Over Digital Rights" },
  { words: ["European Union", "Unites", "On", "Historic", "AI", "Governance", "Framework"], probabilities: [1, 0.34, 0.28, 0.41, 0.52, 0.19, 0.58], headline: "As Industry Leaders Push Back" },
  { words: ["European Union", "Unites", "On", "Historic", "AI", "Governance", "Charter"], probabilities: [1, 0.34, 0.28, 0.41, 0.52, 0.19, 0.42], headline: "Following Years of Contentious Negotiations" },
  { words: ["European Union", "Unites", "On", "Historic", "Technology", "Ethics", "Framework"], probabilities: [1, 0.34, 0.28, 0.41, 0.23, 0.61, 0.39], headline: "Signaling Shift in Global Regulatory Approach" },
  { words: ["European Union", "Unites", "On", "Historic", "Technology", "Ethics", "Charter"], probabilities: [1, 0.34, 0.28, 0.41, 0.23, 0.61, 0.29], headline: "Despite Pressure from Silicon Valley Giants" },
  { words: ["European Union", "Unites", "On", "Historic", "Technology", "Governance", "Framework"], probabilities: [1, 0.34, 0.28, 0.41, 0.23, 0.26, 0.52], headline: "In Response to Public Outcry" },
  { words: ["European Union", "Unites", "On", "Historic", "Technology", "Governance", "Charter"], probabilities: [1, 0.34, 0.28, 0.41, 0.23, 0.26, 0.48], headline: "Marking End to Decade of Debate" },
  { words: ["European Union", "Unites", "On", "Sweeping", "AI", "Ethics", "Framework"], probabilities: [1, 0.34, 0.28, 0.33, 0.56, 0.69, 0.38], headline: "Setting New Global Standards" },
  { words: ["European Union", "Unites", "On", "Sweeping", "AI", "Ethics", "Charter"], probabilities: [1, 0.34, 0.28, 0.33, 0.56, 0.69, 0.44], headline: "With Implications for Global Markets" },
  { words: ["European Union", "Unites", "On", "Sweeping", "AI", "Governance", "Framework"], probabilities: [1, 0.34, 0.28, 0.33, 0.56, 0.17, 0.63], headline: "That Could Reshape Digital Economy" },
  { words: ["European Union", "Unites", "On", "Sweeping", "AI", "Governance", "Charter"], probabilities: [1, 0.34, 0.28, 0.33, 0.56, 0.17, 0.37], headline: "Challenging American Tech Dominance" },
  { words: ["European Union", "Unites", "On", "Sweeping", "Technology", "Ethics", "Framework"], probabilities: [1, 0.34, 0.28, 0.33, 0.29, 0.58, 0.47], headline: "After Marathon Brussels Summit" },
  { words: ["European Union", "Unites", "On", "Sweeping", "Technology", "Ethics", "Charter"], probabilities: [1, 0.34, 0.28, 0.33, 0.29, 0.58, 0.53], headline: "Breaking Deadlock on Controversial Provisions" },
  { words: ["European Union", "Unites", "On", "Sweeping", "Technology", "Governance", "Framework"], probabilities: [1, 0.34, 0.28, 0.33, 0.29, 0.31, 0.41], headline: "Defying Skeptics Who Predicted Failure" },
  { words: ["European Union", "Unites", "On", "Sweeping", "Technology", "Governance", "Charter"], probabilities: [1, 0.34, 0.28, 0.33, 0.29, 0.31, 0.59], headline: "As China Watches Closely" },
  { words: ["European Union", "Unites", "Around", "Historic", "AI", "Ethics", "Framework"], probabilities: [1, 0.34, 0.38, 0.52, 0.48, 0.64, 0.51], headline: "Setting Standards for Responsible Innovation" },
  { words: ["European Union", "Unites", "Around", "Historic", "AI", "Ethics", "Charter"], probabilities: [1, 0.34, 0.38, 0.52, 0.48, 0.64, 0.36], headline: "In Move That Surprises Tech Analysts" },
  { words: ["European Union", "Unites", "Around", "Historic", "AI", "Governance", "Framework"], probabilities: [1, 0.34, 0.38, 0.52, 0.48, 0.24, 0.55], headline: "Bridging Divides Between Member States" },
  { words: ["European Union", "Unites", "Around", "Historic", "AI", "Governance", "Charter"], probabilities: [1, 0.34, 0.38, 0.52, 0.48, 0.24, 0.45], headline: "Overcoming French and German Objections" },
  { words: ["European Union", "Unites", "Around", "Historic", "Technology", "Ethics", "Framework"], probabilities: [1, 0.34, 0.38, 0.52, 0.31, 0.57, 0.44], headline: "Seeking to Rival US Influence" },
  { words: ["European Union", "Unites", "Around", "Historic", "Technology", "Ethics", "Charter"], probabilities: [1, 0.34, 0.38, 0.52, 0.31, 0.57, 0.43], headline: "With Eye Toward 2030 Goals" },
  { words: ["European Union", "Unites", "Around", "Historic", "Technology", "Governance", "Framework"], probabilities: [1, 0.34, 0.38, 0.52, 0.31, 0.29, 0.62], headline: "Putting Privacy First" },
  { words: ["European Union", "Unites", "Around", "Historic", "Technology", "Governance", "Charter"], probabilities: [1, 0.34, 0.38, 0.52, 0.31, 0.29, 0.38], headline: "As Scandals Mount Worldwide" },
  { words: ["European Union", "Unites", "Around", "Sweeping", "AI", "Ethics", "Framework"], probabilities: [1, 0.34, 0.38, 0.41, 0.54, 0.71, 0.35], headline: "Establishing Blueprint for Responsible Development" },
  { words: ["European Union", "Unites", "Around", "Sweeping", "AI", "Ethics", "Charter"], probabilities: [1, 0.34, 0.38, 0.41, 0.54, 0.71, 0.49], headline: "Pioneering International Tech Policy Standards" },
  { words: ["European Union", "Unites", "Around", "Sweeping", "AI", "Governance", "Framework"], probabilities: [1, 0.34, 0.38, 0.41, 0.54, 0.21, 0.68], headline: "With Billions in Funding Attached" },
  { words: ["European Union", "Unites", "Around", "Sweeping", "AI", "Governance", "Charter"], probabilities: [1, 0.34, 0.38, 0.41, 0.54, 0.21, 0.32], headline: "Reflecting New Parliamentary Coalition" },
  { words: ["European Union", "Unites", "Around", "Sweeping", "Technology", "Ethics", "Framework"], probabilities: [1, 0.34, 0.38, 0.41, 0.27, 0.66, 0.46], headline: "As Public Demand Reaches Fever Pitch" },
  { words: ["European Union", "Unites", "Around", "Sweeping", "Technology", "Ethics", "Charter"], probabilities: [1, 0.34, 0.38, 0.41, 0.27, 0.66, 0.54], headline: "Before Upcoming Elections" },
  { words: ["European Union", "Unites", "Around", "Sweeping", "Technology", "Governance", "Framework"], probabilities: [1, 0.34, 0.38, 0.41, 0.27, 0.23, 0.57], headline: "Drawing Praise from Civil Society" },
  { words: ["European Union", "Unites", "Around", "Sweeping", "Technology", "Governance", "Charter"], probabilities: [1, 0.34, 0.38, 0.41, 0.27, 0.23, 0.43], headline: "Though Critics Warn of Overreach" },
  { words: ["European Union", "Reaches", "On", "Historic", "AI", "Ethics", "Framework"], probabilities: [1, 0.42, 0.52, 0.36, 0.59, 0.72, 0.49], headline: "Paving the Way for Responsible Tech Innovation" },
  { words: ["European Union", "Reaches", "On", "Historic", "AI", "Ethics", "Charter"], probabilities: [1, 0.42, 0.52, 0.36, 0.59, 0.72, 0.28], headline: "After Intense All-Night Negotiations" },
  { words: ["European Union", "Reaches", "On", "Historic", "AI", "Governance", "Framework"], probabilities: [1, 0.42, 0.52, 0.36, 0.59, 0.16, 0.67], headline: "Balancing Innovation with Protection" },
  { words: ["European Union", "Reaches", "On", "Historic", "AI", "Governance", "Charter"], probabilities: [1, 0.42, 0.52, 0.36, 0.59, 0.16, 0.33], headline: "Threatening Tech Giants with Heavy Fines" },
  { words: ["European Union", "Reaches", "On", "Historic", "Technology", "Ethics", "Framework"], probabilities: [1, 0.42, 0.52, 0.36, 0.34, 0.53, 0.56], headline: "Addressing Algorithmic Bias Head-On" },
  { words: ["European Union", "Reaches", "On", "Historic", "Technology", "Ethics", "Charter"], probabilities: [1, 0.42, 0.52, 0.36, 0.34, 0.53, 0.44], headline: "In Wake of Cambridge Analytica Fallout" },
  { words: ["European Union", "Reaches", "On", "Historic", "Technology", "Governance", "Framework"], probabilities: [1, 0.42, 0.52, 0.36, 0.34, 0.38, 0.48], headline: "Requiring Transparency from Developers" },
  { words: ["European Union", "Reaches", "On", "Historic", "Technology", "Governance", "Charter"], probabilities: [1, 0.42, 0.52, 0.36, 0.34, 0.38, 0.52], headline: "With Enforcement Starting 2026" },
  { words: ["European Union", "Reaches", "On", "Sweeping", "AI", "Ethics", "Framework"], probabilities: [1, 0.42, 0.52, 0.44, 0.61, 0.68, 0.42], headline: "Mandating Human Oversight Requirements" },
  { words: ["European Union", "Reaches", "On", "Sweeping", "AI", "Ethics", "Charter"], probabilities: [1, 0.42, 0.52, 0.44, 0.61, 0.68, 0.58], headline: "Creating New Regulatory Body" },
  { words: ["European Union", "Reaches", "On", "Sweeping", "AI", "Governance", "Framework"], probabilities: [1, 0.42, 0.52, 0.44, 0.61, 0.22, 0.71], headline: "Banning Certain High-Risk Applications" },
  { words: ["European Union", "Reaches", "On", "Sweeping", "AI", "Governance", "Charter"], probabilities: [1, 0.42, 0.52, 0.44, 0.61, 0.22, 0.29], headline: "Ahead of G7 Summit" },
  { words: ["European Union", "Reaches", "On", "Sweeping", "Technology", "Ethics", "Framework"], probabilities: [1, 0.42, 0.52, 0.44, 0.26, 0.63, 0.51], headline: "Protecting Workers from Automation" },
  { words: ["European Union", "Reaches", "On", "Sweeping", "Technology", "Ethics", "Charter"], probabilities: [1, 0.42, 0.52, 0.44, 0.26, 0.63, 0.37], headline: "Winning Support from Labor Unions" },
  { words: ["European Union", "Reaches", "On", "Sweeping", "Technology", "Governance", "Framework"], probabilities: [1, 0.42, 0.52, 0.44, 0.26, 0.27, 0.59], headline: "Closing Loopholes Exploited by Firms" },
  { words: ["European Union", "Reaches", "On", "Sweeping", "Technology", "Governance", "Charter"], probabilities: [1, 0.42, 0.52, 0.44, 0.26, 0.27, 0.41], headline: "While Markets React Nervously" },
  { words: ["European Union", "Reaches", "Around", "Historic", "AI", "Ethics", "Framework"], probabilities: [1, 0.42, 0.23, 0.48, 0.46, 0.65, 0.54], headline: "Laying Groundwork for Safe Tech Development" },
  { words: ["European Union", "Reaches", "Around", "Historic", "AI", "Ethics", "Charter"], probabilities: [1, 0.42, 0.23, 0.48, 0.46, 0.65, 0.35], headline: "Uniting Divided Northern and Southern Blocs" },
  { words: ["European Union", "Reaches", "Around", "Historic", "AI", "Governance", "Framework"], probabilities: [1, 0.42, 0.23, 0.48, 0.46, 0.27, 0.61], headline: "Satisfying Both Progressives and Conservatives" },
  { words: ["European Union", "Reaches", "Around", "Historic", "AI", "Governance", "Charter"], probabilities: [1, 0.42, 0.23, 0.48, 0.46, 0.27, 0.39], headline: "Rejecting Industry Lobbying Efforts" },
  { words: ["European Union", "Reaches", "Around", "Historic", "Technology", "Ethics", "Framework"], probabilities: [1, 0.42, 0.23, 0.48, 0.39, 0.59, 0.47], headline: "Cementing Brussels as Regulatory Leader" },
  { words: ["European Union", "Reaches", "Around", "Historic", "Technology", "Ethics", "Charter"], probabilities: [1, 0.42, 0.23, 0.48, 0.39, 0.59, 0.41], headline: "Sending Shockwaves Through Silicon Valley" },
  { words: ["European Union", "Reaches", "Around", "Historic", "Technology", "Governance", "Framework"], probabilities: [1, 0.42, 0.23, 0.48, 0.39, 0.32, 0.64], headline: "Following Whistleblower Revelations" },
  { words: ["European Union", "Reaches", "Around", "Historic", "Technology", "Governance", "Charter"], probabilities: [1, 0.42, 0.23, 0.48, 0.39, 0.32, 0.36], headline: "Under New Commission Leadership" },
  { words: ["European Union", "Reaches", "Around", "Sweeping", "AI", "Ethics", "Framework"], probabilities: [1, 0.42, 0.23, 0.37, 0.57, 0.74, 0.39], headline: "Transforming Global Governance Landscape" },
  { words: ["European Union", "Reaches", "Around", "Sweeping", "AI", "Ethics", "Charter"], probabilities: [1, 0.42, 0.23, 0.37, 0.57, 0.74, 0.52], headline: "Securing Cross-Party Parliamentary Support" },
  { words: ["European Union", "Reaches", "Around", "Sweeping", "AI", "Governance", "Framework"], probabilities: [1, 0.42, 0.23, 0.37, 0.57, 0.18, 0.69], headline: "Establishing Unprecedented Accountability Measures" },
  { words: ["European Union", "Reaches", "Around", "Sweeping", "AI", "Governance", "Charter"], probabilities: [1, 0.42, 0.23, 0.37, 0.57, 0.18, 0.31], headline: "Sparking Debate Over Sovereignty" },
  { words: ["European Union", "Reaches", "Around", "Sweeping", "Technology", "Ethics", "Framework"], probabilities: [1, 0.42, 0.23, 0.37, 0.32, 0.62, 0.53], headline: "Empowering Citizens with New Rights" },
  { words: ["European Union", "Reaches", "Around", "Sweeping", "Technology", "Ethics", "Charter"], probabilities: [1, 0.42, 0.23, 0.37, 0.32, 0.62, 0.48], headline: "Promising Enforcement Within 18 Months" },
  { words: ["European Union", "Reaches", "Around", "Sweeping", "Technology", "Governance", "Framework"], probabilities: [1, 0.42, 0.23, 0.37, 0.32, 0.29, 0.66], headline: "Demanding Algorithmic Explainability" },
  { words: ["European Union", "Reaches", "Around", "Sweeping", "Technology", "Governance", "Charter"], probabilities: [1, 0.42, 0.23, 0.37, 0.32, 0.29, 0.34], headline: "Positioning Europe as Democratic Alternative" },
];

// Word options at each level
const levelOptions = [
  ["European Union"],
  ["Unites", "Reaches"],
  ["On", "Around"],
  ["Historic", "Sweeping"],
  ["AI", "Technology"],
  ["Ethics", "Governance"],
  ["Framework", "Charter"],
];

interface FullBranchDiagramProps {
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  className?: string;
}

export function FullBranchDiagram({
  selectedPath,
  onPathChange,
  className
}: FullBranchDiagramProps) {
  const [selections, setSelections] = useState<string[]>([
    "European Union", "Unites", "On", "Historic", "AI", "Ethics", "Framework"
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingLevel, setAnimatingLevel] = useState<number | null>(null);
  const [animatedWord, setAnimatedWord] = useState<string | null>(null);

  // Get matching path for current selections
  const matchingPath = useMemo(() => {
    return treePaths.find(p => 
      p.words.every((word, i) => word === selections[i])
    );
  }, [selections]);

  // Build headline string
  const buildHeadline = (): string => {
    if (matchingPath) {
      return `${selections.join(" ")}, ${matchingPath.headline}`;
    }
    return selections.join(" ");
  };

  // Handle word selection
  const handleWordSelect = (level: number, word: string) => {
    const newSelections = [...selections];
    newSelections[level] = word;
    setSelections(newSelections);
    onPathChange(newSelections);
  };

  // Reset to default
  const handleReset = () => {
    const defaultPath = ["European Union", "Unites", "On", "Historic", "AI", "Ethics", "Framework"];
    setSelections(defaultPath);
    onPathChange(defaultPath);
  };

  // Play computer selection animation for a level
  const playAnimation = (level: number) => {
    if (isAnimating || level === 0) return;
    setIsAnimating(true);
    setAnimatingLevel(level);

    const options = levelOptions[level];
    let currentIndex = 0;
    const cycleCount = 8;
    let cycles = 0;

    const interval = setInterval(() => {
      setAnimatedWord(options[currentIndex % options.length]);
      currentIndex++;
      cycles++;

      if (cycles >= cycleCount) {
        clearInterval(interval);
        // Select highest probability option
        const highestProb = options[0]; // First option typically has higher prob in our data
        setAnimatedWord(highestProb);
        
        setTimeout(() => {
          handleWordSelect(level, highestProb);
          setAnimatedWord(null);
          setAnimatingLevel(null);
          setIsAnimating(false);
        }, 800);
      }
    }, 150);
  };

  // Calculate branch path for SVG
  const getBranchPath = (pathIndex: number) => {
    const path = treePaths[pathIndex];
    const totalPaths = 64;
    const startX = 30;
    const endX = 750;
    const height = 300;
    const ySpacing = height / totalPaths;
    const yStart = height / 2;
    
    // Calculate y position based on binary splits
    let y = yStart;
    let spread = height / 4;
    
    for (let level = 1; level < 7; level++) {
      const optionIndex = levelOptions[level].indexOf(path.words[level]);
      y += optionIndex === 0 ? -spread : spread;
      spread /= 2;
    }
    
    const yEnd = 10 + pathIndex * ySpacing;
    
    return `M ${startX} ${yStart} Q ${startX + 100} ${yStart} ${startX + 150} ${y * 0.3 + yEnd * 0.7} L ${endX} ${yEnd}`;
  };

  // Check if path matches current selections
  const pathMatchesSelections = (path: TreePath): boolean => {
    return path.words.every((word, i) => word === selections[i]);
  };

  // Get probability for selected word at level
  const getProbability = (level: number): number => {
    if (!matchingPath) return 0;
    return matchingPath.probabilities[level];
  };

  return (
    <div className={cn("relative", className)}>
      {/* Current headline display */}
      <div className="mb-4 p-4 bg-muted/30 rounded-lg flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Current Headline:</p>
          <p className="text-lg font-medium text-foreground">
            {buildHeadline()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-7 text-xs gap-1.5 ml-4 flex-shrink-0"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* Branch visualization with word labels */}
      <div className="overflow-x-auto mb-6">
        <div className="min-w-[800px] p-4">
          <svg className="w-full h-[320px]" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet">
            {/* Draw all 64 branches */}
            {treePaths.map((path, pathIndex) => {
              const isSelected = pathMatchesSelections(path);
              return (
                <path
                  key={pathIndex}
                  d={getBranchPath(pathIndex)}
                  fill="none"
                  stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  strokeWidth={isSelected ? 2.5 : 0.5}
                  strokeOpacity={isSelected ? 1 : 0.2}
                  className={cn(
                    "transition-all duration-300",
                    isSelected && "drop-shadow-sm"
                  )}
                />
              );
            })}
            
            {/* Word labels on the tree */}
            {levelOptions.map((options, level) => {
              const xPos = 30 + (level * 120);
              return options.map((word, optionIndex) => {
                const isSelected = selections[level] === word;
                const isAnimated = animatingLevel === level && animatedWord === word;
                
                // Calculate y position
                let baseY = 160;
                if (level > 0 && options.length === 2) {
                  baseY = optionIndex === 0 ? 120 : 200;
                }
                
                return (
                  <g key={`${level}-${word}`}>
                    <rect
                      x={xPos - 35}
                      y={baseY - 10}
                      width={70}
                      height={20}
                      rx={4}
                      fill={isSelected ? "hsl(var(--primary))" : isAnimated ? "hsl(var(--accent))" : "hsl(var(--background))"}
                      stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
                      strokeWidth={1}
                      className={cn(
                        "transition-all duration-200",
                        isAnimated && "animate-pulse"
                      )}
                    />
                    <text
                      x={xPos}
                      y={baseY + 4}
                      textAnchor="middle"
                      className={cn(
                        "text-[10px] font-medium pointer-events-none select-none",
                        isSelected ? "fill-primary-foreground" : "fill-foreground"
                      )}
                    >
                      {word.length > 10 ? word.slice(0, 8) + "..." : word}
                    </text>
                  </g>
                );
              });
            })}
          </svg>
        </div>
      </div>

      {/* Word selection controls at bottom */}
      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground mb-3">Select words to change the sentence path:</p>
        <div className="flex flex-wrap gap-4 items-end">
          {levelOptions.slice(1).map((options, levelIndex) => {
            const level = levelIndex + 1;
            const probability = getProbability(level);
            
            return (
              <div key={level} className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {(probability * 100).toFixed(0)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playAnimation(level)}
                    disabled={isAnimating}
                    className="h-5 w-5 p-0"
                    title="Watch computer select"
                  >
                    <Monitor className={cn(
                      "h-3 w-3",
                      animatingLevel === level ? "text-primary animate-pulse" : "text-muted-foreground"
                    )} />
                  </Button>
                </div>
                <div className="flex gap-1">
                  {options.map((word) => {
                    const isSelected = selections[level] === word;
                    const isAnimated = animatingLevel === level && animatedWord === word;
                    
                    return (
                      <Button
                        key={word}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleWordSelect(level, word)}
                        disabled={isAnimating}
                        className={cn(
                          "h-8 text-xs min-w-[80px]",
                          isAnimated && "ring-2 ring-primary ring-offset-2 animate-pulse"
                        )}
                      >
                        {word}
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
