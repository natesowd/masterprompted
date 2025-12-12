import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw, Monitor } from "lucide-react";

/**
 * BranchTreeDiagram - Shows all possible sentence branches greyed out,
 * with word selection on the right. Selecting a word highlights the corresponding branch.
 */

interface TreePath {
  words: string[];
  probabilities: number[];
  headline: string;
}

// All 64 paths
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

interface BranchTreeDiagramProps {
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  className?: string;
}

export function BranchTreeDiagram({
  selectedPath,
  onPathChange,
  className
}: BranchTreeDiagramProps) {
  // Track selections at each level (0 = root always selected)
  const [selections, setSelections] = useState<(string | null)[]>([treePaths[0].words[0], null, null, null, null, null, null]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedWord, setAnimatedWord] = useState<string | null>(null);

  // Get options at each level based on current selections
  const getOptionsAtLevel = (level: number): { word: string; probability: number }[] => {
    if (level === 0) return [{ word: "European Union", probability: 1 }];
    
    const pathPrefix = selections.slice(0, level).filter(Boolean) as string[];
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

  // Get all matching paths for current selections
  const getMatchingPaths = useMemo(() => {
    const pathPrefix = selections.slice(0, currentLevel).filter(Boolean) as string[];
    if (pathPrefix.length === 0) return treePaths;
    
    return treePaths.filter(p => 
      pathPrefix.every((word, i) => p.words[i] === word)
    );
  }, [selections, currentLevel]);

  // Check if a path matches current selections
  const pathMatchesSelections = (path: TreePath): boolean => {
    for (let i = 0; i < selections.length; i++) {
      if (selections[i] && path.words[i] !== selections[i]) {
        return false;
      }
    }
    return true;
  };

  // Handle word selection
  const handleWordClick = (level: number, word: string) => {
    const newSelections = [...selections];
    
    // Clear selections from this level onwards
    for (let i = level; i <= 6; i++) {
      newSelections[i] = null;
    }
    newSelections[level] = word;
    setSelections(newSelections);
    setCurrentLevel(level + 1);
    
    // Notify parent
    const newPath = newSelections.filter(Boolean) as string[];
    onPathChange(newPath);
  };

  // Reset
  const handleReset = () => {
    setSelections([treePaths[0].words[0], null, null, null, null, null, null]);
    setCurrentLevel(1);
    onPathChange([treePaths[0].words[0]]);
  };

  // Play computer selection animation
  const playAnimation = () => {
    if (isAnimating || currentLevel > 6) return;
    setIsAnimating(true);

    const options = currentOptions;
    let cycleIndex = 0;
    const cycleCount = 8;

    const interval = setInterval(() => {
      setAnimatedWord(options[cycleIndex % options.length].word);
      cycleIndex++;

      if (cycleIndex >= cycleCount) {
        clearInterval(interval);
        // Select highest probability option
        const highestProb = options.reduce((a, b) => a.probability > b.probability ? a : b);
        setAnimatedWord(highestProb.word);
        
        setTimeout(() => {
          handleWordClick(currentLevel, highestProb.word);
          setAnimatedWord(null);
          setIsAnimating(false);
        }, 600);
      }
    }, 150);
  };

  // Get the currently selected full path for displaying words on tree
  const selectedFullPath = useMemo(() => {
    const pathPrefix = selections.filter(Boolean) as string[];
    if (pathPrefix.length === 7) {
      return treePaths.find(p => p.words.every((w, i) => w === pathPrefix[i]));
    }
    return treePaths.find(p => pathPrefix.every((word, i) => p.words[i] === word));
  }, [selections]);

  // Calculate Y position for selected path at each level
  const getSelectedPathY = (level: number): number => {
    if (!selectedFullPath) return 200;
    
    const baseY = 200;
    const spread = 180;
    
    const level1Group = selectedFullPath.words[1] === "Unites" ? 0 : 1;
    const level2Group = selectedFullPath.words[2] === "On" ? 0 : 1;
    const level3Group = selectedFullPath.words[3] === "Historic" ? 0 : 1;
    const level4Group = selectedFullPath.words[4] === "AI" ? 0 : 1;
    const level5Group = selectedFullPath.words[5] === "Ethics" ? 0 : 1;
    const level6Group = selectedFullPath.words[6] === "Framework" ? 0 : 1;
    
    const y1 = baseY + (level1Group - 0.5) * spread;
    const y2 = y1 + (level2Group - 0.5) * (spread / 2);
    const y3 = y2 + (level3Group - 0.5) * (spread / 4);
    const y4 = y3 + (level4Group - 0.5) * (spread / 8);
    const y5 = y4 + (level5Group - 0.5) * (spread / 16);
    const y6 = y5 + (level6Group - 0.5) * (spread / 32);
    
    const yPositions = [baseY, y1, y2, y3, y4, y5, y6];
    return yPositions[level] || baseY;
  };

  const levelXPositions = [20, 100, 180, 260, 340, 420, 500];

  // Build current headline
  const buildHeadline = (): string => {
    const selected = selections.filter(Boolean) as string[];
    if (selected.length < 7) {
      return selected.join(" ") + "...";
    }
    const match = treePaths.find(p => 
      p.words.every((word, i) => word === selected[i])
    );
    return match ? `${selected.join(" ")}, ${match.headline}` : selected.join(" ");
  };

  // Get current level options
  const currentOptions = currentLevel <= 6 ? getOptionsAtLevel(currentLevel) : [];

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
        {currentLevel > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs gap-1.5 ml-4 flex-shrink-0"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Main layout: branches on left, selection on right */}
      <div className="flex gap-6">
        {/* Branch visualization */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[600px] p-4">
            {/* SVG branch lines - proper tree structure */}
            <svg className="w-full h-[400px]" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
              {/* Draw all paths as branches from a proper tree */}
              {treePaths.map((path, pathIndex) => {
                const isMatching = pathMatchesSelections(path);
                
                // Calculate proper tree branching positions
                // Level 1: Split by "Unites" (32 paths) vs "Reaches" (32 paths)
                const level1Group = path.words[1] === "Unites" ? 0 : 1;
                // Level 2: Split by "On" vs "Around" within each group
                const level2Group = path.words[2] === "On" ? 0 : 1;
                // Level 3: Split by "Historic" vs "Sweeping"
                const level3Group = path.words[3] === "Historic" ? 0 : 1;
                // Level 4: Split by "AI" vs "Technology"
                const level4Group = path.words[4] === "AI" ? 0 : 1;
                // Level 5: Split by "Ethics" vs "Governance"
                const level5Group = path.words[5] === "Ethics" ? 0 : 1;
                // Level 6: Split by "Framework" vs "Charter"
                const level6Group = path.words[6] === "Framework" ? 0 : 1;
                
                // Calculate Y positions based on binary splits
                const baseY = 200;
                const spread = 180;
                
                // Progressive Y calculation
                const y1 = baseY + (level1Group - 0.5) * spread;
                const y2 = y1 + (level2Group - 0.5) * (spread / 2);
                const y3 = y2 + (level3Group - 0.5) * (spread / 4);
                const y4 = y3 + (level4Group - 0.5) * (spread / 8);
                const y5 = y4 + (level5Group - 0.5) * (spread / 16);
                const y6 = y5 + (level6Group - 0.5) * (spread / 32);
                
                const points = [
                  { x: 20, y: baseY },
                  { x: 100, y: y1 },
                  { x: 180, y: y2 },
                  { x: 260, y: y3 },
                  { x: 340, y: y4 },
                  { x: 420, y: y5 },
                  { x: 500, y: y6 },
                  { x: 570, y: y6 },
                ];
                
                // Create curved path for smoother look
                const pathD = `M ${points[0].x} ${points[0].y} ` +
                  points.slice(1).map((p, i) => {
                    const prev = points[i];
                    const cpX = (prev.x + p.x) / 2;
                    return `C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
                  }).join(" ");
                
                return (
                  <g key={pathIndex}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isMatching ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      strokeWidth={isMatching ? 2.5 : 0.5}
                      opacity={isMatching ? 1 : 0.15}
                      className="transition-all duration-300"
                    />
                    {/* End node */}
                    <circle
                      cx={570}
                      cy={y6}
                      r={isMatching ? 4 : 1.5}
                      fill={isMatching ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      opacity={isMatching ? 1 : 0.25}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
              
              {/* Words along the selected path */}
              {selectedFullPath && selections.map((word, level) => {
                if (!word || level > 6) return null;
                
                const x = levelXPositions[level];
                const y = getSelectedPathY(level);
                const isClickable = level > 0;
                
                const handleWordClickOnTree = () => {
                  if (!isClickable) return;
                  const newSelections = [...selections];
                  for (let i = level; i <= 6; i++) {
                    newSelections[i] = null;
                  }
                  setSelections(newSelections);
                  setCurrentLevel(level);
                  onPathChange(newSelections.filter(Boolean) as string[]);
                };
                
                const displayWord = word === "European Union" ? "EU" : word;
                const wordWidth = Math.max(50, displayWord.length * 7 + 12);
                
                return (
                  <g 
                    key={`word-${level}`}
                    onClick={handleWordClickOnTree}
                    className={cn(isClickable && "cursor-pointer")}
                    style={{ pointerEvents: isClickable ? 'all' : 'none' }}
                  >
                    <rect
                      x={x - wordWidth / 2}
                      y={y - 10}
                      width={wordWidth}
                      height={20}
                      rx={4}
                      fill="hsl(var(--primary))"
                      className={cn(
                        "drop-shadow-sm transition-all duration-200",
                        isClickable && "hover:fill-[hsl(var(--primary)/0.8)]"
                      )}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className="text-[9px] font-medium fill-primary-foreground pointer-events-none select-none"
                    >
                      {displayWord}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Word selection panel on the right */}
        <div className="w-64 border-l border-border pl-6">
          <div className="sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">
                {currentLevel <= 6 ? `Select Word ${currentLevel}:` : "Complete!"}
              </h3>
              {currentLevel <= 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playAnimation}
                  disabled={isAnimating}
                  className="h-7 gap-1.5 text-xs"
                  title="Watch computer select"
                >
                  <Monitor className={cn(
                    "h-3.5 w-3.5",
                    isAnimating ? "text-primary animate-pulse" : "text-muted-foreground"
                  )} />
                </Button>
              )}
            </div>
            
            {currentLevel <= 6 ? (
              <div className="space-y-2">
                {currentOptions.map(({ word, probability }) => {
                  const isAnimated = animatedWord === word;
                  return (
                    <button
                      key={word}
                      onClick={() => handleWordClick(currentLevel, word)}
                      disabled={isAnimating}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border transition-all",
                        "hover:border-primary hover:bg-primary/5",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        isAnimated && "ring-2 ring-primary ring-offset-2 animate-pulse bg-primary/10"
                      )}
                    >
                      <div className="font-medium text-foreground">{word}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Probability: {(probability * 100).toFixed(0)}%
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Headline complete! Click reset to try another path.
              </div>
            )}

            {/* Selected words summary */}
            {currentLevel > 1 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Selected:</h4>
                <div className="space-y-1">
                  {selections.slice(1, currentLevel).filter(Boolean).map((word, i) => (
                    <div key={i} className="text-sm text-foreground flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center">
                        {i + 1}
                      </span>
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
