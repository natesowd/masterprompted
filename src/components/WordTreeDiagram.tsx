import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Monitor, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

/**
 * WordTreeDiagram - Visualizes word prediction paths as a horizontal tree diagram
 * Updated with 7-level deep tree structure based on EU AI headline data
 */

interface TreePath {
  words: string[];
  probabilities: number[];
  headline: string;
}

// Parse the provided data into tree paths
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

interface WordTreeDiagramProps {
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  className?: string;
}

// Level labels for context
const levelLabels = ["Root", "Verb", "Prep", "Adj", "Topic", "Aspect", "Type"];

export function WordTreeDiagram({
  selectedPath,
  onPathChange,
  className
}: WordTreeDiagramProps) {
  // Track unlocked level (0 = only root + first choices visible)
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  // Track selected words at each level
  const [selections, setSelections] = useState<(string | null)[]>([treePaths[0].words[0], null, null, null, null, null, null]);
  
  // Animation states per level
  const [animatingLevel, setAnimatingLevel] = useState<number | null>(null);
  const [animatedWord, setAnimatedWord] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(false);

  // Reset to initial state
  const handleReset = () => {
    setUnlockedLevel(1);
    setSelections([treePaths[0].words[0], null, null, null, null, null, null]);
    onPathChange([treePaths[0].words[0]]);
  };

  // Get the current partial path based on selections
  const currentPath = useMemo(() => {
    const path = [treePaths[0].words[0]]; // Always start with "European Union"
    for (let i = 1; i <= 6; i++) {
      if (selections[i]) {
        path.push(selections[i]!);
      } else {
        break;
      }
    }
    return path;
  }, [selections]);

  // Get options at each level based on current path
  const getOptionsAtLevel = (level: number): { word: string; probability: number }[] => {
    if (level === 0) return [{ word: "European Union", probability: 1 }];
    
    const pathPrefix = currentPath.slice(0, level);
    const matchingPaths = treePaths.filter(p => 
      pathPrefix.every((word, i) => p.words[i] === word)
    );
    
    const uniqueOptions = new Map<string, number>();
    matchingPaths.forEach(p => {
      const word = p.words[level];
      const prob = p.probabilities[level];
      if (!uniqueOptions.has(word) || uniqueOptions.get(word)! < prob) {
        uniqueOptions.set(word, prob);
      }
    });
    
    return Array.from(uniqueOptions.entries())
      .map(([word, probability]) => ({ word, probability }))
      .sort((a, b) => b.probability - a.probability);
  };

  // Get headline for current path (only when complete)
  const getCurrentHeadline = (): string | null => {
    if (currentPath.length < 7) return null;
    const match = treePaths.find(p => 
      p.words.every((word, i) => word === currentPath[i])
    );
    return match?.headline || null;
  };

  // Handle word selection - unlock next level
  const handleWordClick = (level: number, word: string) => {
    const newSelections = [...selections];
    // Clear all selections from this level onwards
    for (let i = level; i <= 6; i++) {
      newSelections[i] = null;
    }
    newSelections[level] = word;
    setSelections(newSelections);
    
    // Unlock next level
    if (level < 6) {
      setUnlockedLevel(level + 1);
    }
    
    // Notify parent
    const newPath = [treePaths[0].words[0]];
    for (let i = 1; i <= level; i++) {
      if (newSelections[i]) newPath.push(newSelections[i]!);
    }
    onPathChange(newPath);
  };

  // Play animation for a level
  const playAnimation = (level: number) => {
    if (animatingLevel !== null) return;
    setAnimatingLevel(level);
    
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
        const highest = options[0].word;
        setAnimatedWord(highest);
        setShowPulse(true);
        
        setTimeout(() => {
          setShowPulse(false);
          setAnimatedWord(null);
          setAnimatingLevel(null);
          handleWordClick(level, highest);
        }, 1500);
      }
    }, 180);
  };

  const nodeHeight = 36;
  const levelGap = 32;
  const containerHeight = 320;

  const getNodeY = (idx: number, count: number) => {
    const totalHeight = count * nodeHeight + (count - 1) * levelGap;
    const startOffset = (containerHeight - totalHeight) / 2;
    return startOffset + idx * (nodeHeight + levelGap) + nodeHeight / 2;
  };

  // Render a level column - only show if unlocked
  const renderLevel = (level: number) => {
    if (level > unlockedLevel) return null;
    
    const options = getOptionsAtLevel(level);
    if (options.length === 0) return null;

    const isSelectable = level === unlockedLevel && !selections[level];

    return (
      <div key={level} className="flex flex-col" style={{ height: containerHeight }}>
        {/* Monitor button - only for unlocked selectable levels */}
        {level > 0 && isSelectable && (
          <div className="flex justify-center mb-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => playAnimation(level)}
                    disabled={animatingLevel !== null}
                    className={cn(
                      "p-1 rounded-md transition-all duration-200",
                      animatingLevel === level
                        ? "bg-primary/20 text-primary animate-pulse"
                        : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Watch LLM select word</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        {/* Spacer if no button */}
        {(level === 0 || !isSelectable) && level > 0 && <div className="h-6 mb-1" />}
        
        {/* Word buttons */}
        <div className="flex flex-col justify-center gap-8 flex-1">
          {options.map((option) => {
            const isSelected = selections[level] === option.word;
            const isAnimated = animatingLevel === level && animatedWord === option.word;
            const isPulsing = showPulse && animatingLevel === level && animatedWord === option.word;
            
            return (
              <button
                key={option.word}
                onClick={() => isSelectable && handleWordClick(level, option.word)}
                disabled={!isSelectable && level > 0}
                className={cn(
                  "relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border-2 min-w-[80px] h-9",
                  level === 0 
                    ? "bg-primary text-primary-foreground border-primary cursor-default"
                    : isSelected 
                      ? "bg-green-200 border-green-400 text-green-900 shadow-md scale-105" 
                      : isSelectable
                        ? "bg-card border-border hover:border-primary/50 hover:bg-muted cursor-pointer"
                        : "bg-muted/50 border-muted text-muted-foreground/60 cursor-not-allowed",
                  isAnimated && !isPulsing && "ring-2 ring-primary ring-offset-1 bg-primary/10",
                  isPulsing && "ring-4 ring-green-400 ring-offset-1 bg-green-200 border-green-400 text-green-900 animate-pulse scale-110"
                )}
              >
                {option.word}
                {level > 0 && (
                  <span className={cn(
                    "absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded",
                    isSelected ? "bg-green-200 text-green-800" : "bg-muted text-muted-foreground"
                  )}>
                    {option.probability.toFixed(2)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };


  // Render connector lines - show many branches fanning out from selected node
  const renderConnector = (fromLevel: number, toLevel: number) => {
    // Only show connector if this transition is relevant
    if (toLevel > unlockedLevel) return null;
    if (fromLevel > 0 && !selections[fromLevel]) return null;
    
    const fromOptions = getOptionsAtLevel(fromLevel);
    const toOptions = getOptionsAtLevel(toLevel);
    
    if (fromOptions.length === 0 || toOptions.length === 0) return null;

    const selectedFromWord = selections[fromLevel] || fromOptions[0]?.word;
    const selectedFromIdx = fromOptions.findIndex(o => o.word === selectedFromWord);
    const fromY = getNodeY(selectedFromIdx >= 0 ? selectedFromIdx : 0, fromOptions.length);

    // Draw many varied curves from selected "from" node to ALL "to" options
    // Add extra ghost lines to show branching complexity
    const ghostLineCount = Math.min(8, toOptions.length * 3); // Many ghost branches

    return (
      <div key={`conn-${fromLevel}-${toLevel}`} className="flex items-center w-16" style={{ height: containerHeight }}>
        <svg className="w-full h-full" viewBox={`0 0 64 ${containerHeight}`} preserveAspectRatio="none">
          {/* Ghost lines to show complexity - fan out wildly */}
          {Array.from({ length: ghostLineCount }).map((_, ghostIdx) => {
            // Distribute ghost lines across vertical space with variance
            const targetY = (containerHeight / (ghostLineCount + 1)) * (ghostIdx + 1);
            const curveVariance = (ghostIdx % 3 - 1) * 15;
            const midX1 = 20 + curveVariance;
            const midX2 = 44 - curveVariance;
            
            return (
              <path
                key={`ghost-${ghostIdx}`}
                d={`M 0 ${fromY} C ${midX1} ${fromY + (ghostIdx % 2 ? 10 : -10)}, ${midX2} ${targetY}, 64 ${targetY}`}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={0.5}
                strokeOpacity={0.08}
              />
            );
          })}
          
          {/* Real option lines - varied curves */}
          {toOptions.map((toOpt, toIdx) => {
            const toY = getNodeY(toIdx, toOptions.length);
            const isSelected = selections[toLevel] === toOpt.word;
            
            // Varied curve control points for organic look
            const curveOffset = ((toIdx * 7) % 5 - 2) * 8;
            const vertOffset = ((toIdx * 3) % 3 - 1) * 6;
            
            return (
              <path
                key={`real-${toOpt.word}`}
                d={`M 0 ${fromY} C ${22 + curveOffset} ${fromY + vertOffset}, ${42 - curveOffset} ${toY - vertOffset}, 64 ${toY}`}
                fill="none"
                stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                strokeWidth={isSelected ? 2.5 : 1}
                strokeOpacity={isSelected ? 1 : 0.3}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const headline = getCurrentHeadline();

  return (
    <div className={cn("relative overflow-x-auto", className)}>
      <div className="min-w-[900px] p-4">
        {/* Reset button */}
        {unlockedLevel > 1 && (
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        )}
        {/* Tree container */}
        <div className="flex items-start gap-1">
          {/* Level 0: Root */}
          {renderLevel(0)}
          
          {/* Levels 1-6 with connectors */}
          {[1, 2, 3, 4, 5, 6].map(level => (
            <React.Fragment key={level}>
              {renderConnector(level - 1, level)}
              {renderLevel(level)}
            </React.Fragment>
          ))}

          {/* Final connector to headline - only when complete */}
          {headline && (
            <>
              <div className="flex items-center w-6" style={{ height: containerHeight }}>
                <svg className="w-full h-full" viewBox={`0 0 24 ${containerHeight}`} preserveAspectRatio="none">
                  {(() => {
                    const options = getOptionsAtLevel(6);
                    const idx = options.findIndex(o => o.word === selections[6]);
                    const y = getNodeY(idx >= 0 ? idx : 0, options.length);
                    return (
                      <path
                        d={`M 0 ${y} L 24 ${y}`}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                      />
                    );
                  })()}
                </svg>
              </div>

              {/* Headline completion */}
              <div className="flex flex-col justify-center max-w-[220px]" style={{ height: containerHeight }}>
                <div className="bg-muted/50 border border-border rounded-lg p-3 animate-fade-in">
                  <p className="text-[10px] text-muted-foreground mb-1">Headline ending:</p>
                  <p className="text-xs text-foreground leading-relaxed">
                    {headline}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
