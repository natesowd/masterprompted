import React, { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Monitor, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import TextFlag from "@/components/TextFlag";

/**
 * BranchDiagram - Visualizes word prediction paths as a horizontal tree diagram
 * Updated with 7-level deep tree structure based on EU AI headline data
 * (Previously WordTreeDiagram - renamed to match UI label "Branch")
 */

interface TreePath {
  words: string[];
  probabilities: number[];
  headline: string;
}

// Parse the provided data into tree paths
const treePaths: TreePath[] = [{
  words: ["European Union", "Unites", "On", "Historic", "AI", "Ethics", "Framework"],
  probabilities: [1, 0.34, 0.28, 0.41, 0.52, 0.67, 0.45],
  headline: "Charting Path for Responsible Technology Development"
}, {
  words: ["European Union", "Unites", "On", "Historic", "AI", "Ethics", "Charter"],
  probabilities: [1, 0.34, 0.28, 0.41, 0.52, 0.67, 0.33],
  headline: "Amid Growing Concerns Over Digital Rights"
}, {
  words: ["European Union", "Unites", "On", "Historic", "AI", "Governance", "Framework"],
  probabilities: [1, 0.34, 0.28, 0.41, 0.52, 0.19, 0.58],
  headline: "As Industry Leaders Push Back"
}, {
  words: ["European Union", "Unites", "On", "Historic", "AI", "Governance", "Charter"],
  probabilities: [1, 0.34, 0.28, 0.41, 0.52, 0.19, 0.42],
  headline: "Following Years of Contentious Negotiations"
}, {
  words: ["European Union", "Unites", "On", "Historic", "Technology", "Ethics", "Framework"],
  probabilities: [1, 0.34, 0.28, 0.41, 0.23, 0.61, 0.39],
  headline: "Signaling Shift in Global Regulatory Approach"
}, {
  words: ["European Union", "Unites", "On", "Historic", "Technology", "Ethics", "Charter"],
  probabilities: [1, 0.34, 0.28, 0.41, 0.23, 0.61, 0.29],
  headline: "Despite Pressure from Silicon Valley Giants"
}, {
  words: ["European Union", "Unites", "On", "Historic", "Technology", "Governance", "Framework"],
  probabilities: [1, 0.34, 0.28, 0.41, 0.23, 0.26, 0.52],
  headline: "In Response to Public Outcry"
}, {
  words: ["European Union", "Unites", "On", "Historic", "Technology", "Governance", "Charter"],
  probabilities: [1, 0.34, 0.28, 0.41, 0.23, 0.26, 0.48],
  headline: "Marking End to Decade of Debate"
}, {
  words: ["European Union", "Unites", "On", "Sweeping", "AI", "Ethics", "Framework"],
  probabilities: [1, 0.34, 0.28, 0.33, 0.56, 0.69, 0.38],
  headline: "Setting New Global Standards"
}, {
  words: ["European Union", "Unites", "On", "Sweeping", "AI", "Ethics", "Charter"],
  probabilities: [1, 0.34, 0.28, 0.33, 0.56, 0.69, 0.44],
  headline: "With Implications for Global Markets"
}, {
  words: ["European Union", "Unites", "On", "Sweeping", "AI", "Governance", "Framework"],
  probabilities: [1, 0.34, 0.28, 0.33, 0.56, 0.17, 0.63],
  headline: "That Could Reshape Digital Economy"
}, {
  words: ["European Union", "Unites", "On", "Sweeping", "AI", "Governance", "Charter"],
  probabilities: [1, 0.34, 0.28, 0.33, 0.56, 0.17, 0.37],
  headline: "Challenging American Tech Dominance"
}, {
  words: ["European Union", "Unites", "On", "Sweeping", "Technology", "Ethics", "Framework"],
  probabilities: [1, 0.34, 0.28, 0.33, 0.29, 0.58, 0.47],
  headline: "After Marathon Brussels Summit"
}, {
  words: ["European Union", "Unites", "On", "Sweeping", "Technology", "Ethics", "Charter"],
  probabilities: [1, 0.34, 0.28, 0.33, 0.29, 0.58, 0.53],
  headline: "Breaking Deadlock on Controversial Provisions"
}, {
  words: ["European Union", "Unites", "On", "Sweeping", "Technology", "Governance", "Framework"],
  probabilities: [1, 0.34, 0.28, 0.33, 0.29, 0.31, 0.41],
  headline: "Defying Skeptics Who Predicted Failure"
}, {
  words: ["European Union", "Unites", "On", "Sweeping", "Technology", "Governance", "Charter"],
  probabilities: [1, 0.34, 0.28, 0.33, 0.29, 0.31, 0.59],
  headline: "As China Watches Closely"
}, {
  words: ["European Union", "Unites", "Around", "Historic", "AI", "Ethics", "Framework"],
  probabilities: [1, 0.34, 0.38, 0.52, 0.48, 0.64, 0.51],
  headline: "Setting Standards for Responsible Innovation"
}, {
  words: ["European Union", "Unites", "Around", "Historic", "AI", "Ethics", "Charter"],
  probabilities: [1, 0.34, 0.38, 0.52, 0.48, 0.64, 0.36],
  headline: "In Move That Surprises Tech Analysts"
}, {
  words: ["European Union", "Unites", "Around", "Historic", "AI", "Governance", "Framework"],
  probabilities: [1, 0.34, 0.38, 0.52, 0.48, 0.24, 0.55],
  headline: "Bridging Divides Between Member States"
}, {
  words: ["European Union", "Unites", "Around", "Historic", "AI", "Governance", "Charter"],
  probabilities: [1, 0.34, 0.38, 0.52, 0.48, 0.24, 0.45],
  headline: "Overcoming French and German Objections"
}, {
  words: ["European Union", "Unites", "Around", "Historic", "Technology", "Ethics", "Framework"],
  probabilities: [1, 0.34, 0.38, 0.52, 0.31, 0.57, 0.44],
  headline: "Seeking to Rival US Influence"
}, {
  words: ["European Union", "Unites", "Around", "Historic", "Technology", "Ethics", "Charter"],
  probabilities: [1, 0.34, 0.38, 0.52, 0.31, 0.57, 0.43],
  headline: "With Eye Toward 2030 Goals"
}, {
  words: ["European Union", "Unites", "Around", "Historic", "Technology", "Governance", "Framework"],
  probabilities: [1, 0.34, 0.38, 0.52, 0.31, 0.29, 0.62],
  headline: "Putting Privacy First"
}, {
  words: ["European Union", "Unites", "Around", "Historic", "Technology", "Governance", "Charter"],
  probabilities: [1, 0.34, 0.38, 0.52, 0.31, 0.29, 0.38],
  headline: "As Scandals Mount Worldwide"
}, {
  words: ["European Union", "Unites", "Around", "Sweeping", "AI", "Ethics", "Framework"],
  probabilities: [1, 0.34, 0.38, 0.41, 0.54, 0.71, 0.35],
  headline: "Establishing Blueprint for Responsible Development"
}, {
  words: ["European Union", "Unites", "Around", "Sweeping", "AI", "Ethics", "Charter"],
  probabilities: [1, 0.34, 0.38, 0.41, 0.54, 0.71, 0.49],
  headline: "Pioneering International Tech Policy Standards"
}, {
  words: ["European Union", "Unites", "Around", "Sweeping", "AI", "Governance", "Framework"],
  probabilities: [1, 0.34, 0.38, 0.41, 0.54, 0.21, 0.68],
  headline: "With Billions in Funding Attached"
}, {
  words: ["European Union", "Unites", "Around", "Sweeping", "AI", "Governance", "Charter"],
  probabilities: [1, 0.34, 0.38, 0.41, 0.54, 0.21, 0.32],
  headline: "Reflecting New Parliamentary Coalition"
}, {
  words: ["European Union", "Unites", "Around", "Sweeping", "Technology", "Ethics", "Framework"],
  probabilities: [1, 0.34, 0.38, 0.41, 0.27, 0.66, 0.46],
  headline: "As Public Demand Reaches Fever Pitch"
}, {
  words: ["European Union", "Unites", "Around", "Sweeping", "Technology", "Ethics", "Charter"],
  probabilities: [1, 0.34, 0.38, 0.41, 0.27, 0.66, 0.54],
  headline: "Before Upcoming Elections"
}, {
  words: ["European Union", "Unites", "Around", "Sweeping", "Technology", "Governance", "Framework"],
  probabilities: [1, 0.34, 0.38, 0.41, 0.27, 0.23, 0.57],
  headline: "Drawing Praise from Civil Society"
}, {
  words: ["European Union", "Unites", "Around", "Sweeping", "Technology", "Governance", "Charter"],
  probabilities: [1, 0.34, 0.38, 0.41, 0.27, 0.23, 0.43],
  headline: "Though Critics Warn of Overreach"
}, {
  words: ["European Union", "Reaches", "On", "Historic", "AI", "Ethics", "Framework"],
  probabilities: [1, 0.42, 0.52, 0.36, 0.59, 0.72, 0.49],
  headline: "Paving the Way for Responsible Tech Innovation"
}, {
  words: ["European Union", "Reaches", "On", "Historic", "AI", "Ethics", "Charter"],
  probabilities: [1, 0.42, 0.52, 0.36, 0.59, 0.72, 0.28],
  headline: "After Intense All-Night Negotiations"
}, {
  words: ["European Union", "Reaches", "On", "Historic", "AI", "Governance", "Framework"],
  probabilities: [1, 0.42, 0.52, 0.36, 0.59, 0.16, 0.67],
  headline: "Balancing Innovation with Protection"
}, {
  words: ["European Union", "Reaches", "On", "Historic", "AI", "Governance", "Charter"],
  probabilities: [1, 0.42, 0.52, 0.36, 0.59, 0.16, 0.33],
  headline: "Threatening Tech Giants with Heavy Fines"
}, {
  words: ["European Union", "Reaches", "On", "Historic", "Technology", "Ethics", "Framework"],
  probabilities: [1, 0.42, 0.52, 0.36, 0.34, 0.53, 0.56],
  headline: "Addressing Algorithmic Bias Head-On"
}, {
  words: ["European Union", "Reaches", "On", "Historic", "Technology", "Ethics", "Charter"],
  probabilities: [1, 0.42, 0.52, 0.36, 0.34, 0.53, 0.44],
  headline: "In Wake of Cambridge Analytica Fallout"
}, {
  words: ["European Union", "Reaches", "On", "Historic", "Technology", "Governance", "Framework"],
  probabilities: [1, 0.42, 0.52, 0.36, 0.34, 0.38, 0.48],
  headline: "Requiring Transparency from Developers"
}, {
  words: ["European Union", "Reaches", "On", "Historic", "Technology", "Governance", "Charter"],
  probabilities: [1, 0.42, 0.52, 0.36, 0.34, 0.38, 0.52],
  headline: "With Enforcement Starting 2026"
}, {
  words: ["European Union", "Reaches", "On", "Sweeping", "AI", "Ethics", "Framework"],
  probabilities: [1, 0.42, 0.52, 0.44, 0.61, 0.68, 0.42],
  headline: "Mandating Human Oversight Requirements"
}, {
  words: ["European Union", "Reaches", "On", "Sweeping", "AI", "Ethics", "Charter"],
  probabilities: [1, 0.42, 0.52, 0.44, 0.61, 0.68, 0.58],
  headline: "Creating New Regulatory Body"
}, {
  words: ["European Union", "Reaches", "On", "Sweeping", "AI", "Governance", "Framework"],
  probabilities: [1, 0.42, 0.52, 0.44, 0.61, 0.22, 0.71],
  headline: "Banning Certain High-Risk Applications"
}, {
  words: ["European Union", "Reaches", "On", "Sweeping", "AI", "Governance", "Charter"],
  probabilities: [1, 0.42, 0.52, 0.44, 0.61, 0.22, 0.29],
  headline: "Ahead of G7 Summit"
}, {
  words: ["European Union", "Reaches", "On", "Sweeping", "Technology", "Ethics", "Framework"],
  probabilities: [1, 0.42, 0.52, 0.44, 0.26, 0.63, 0.51],
  headline: "Protecting Workers from Automation"
}, {
  words: ["European Union", "Reaches", "On", "Sweeping", "Technology", "Ethics", "Charter"],
  probabilities: [1, 0.42, 0.52, 0.44, 0.26, 0.63, 0.37],
  headline: "Winning Support from Labor Unions"
}, {
  words: ["European Union", "Reaches", "On", "Sweeping", "Technology", "Governance", "Framework"],
  probabilities: [1, 0.42, 0.52, 0.44, 0.26, 0.27, 0.59],
  headline: "Closing Loopholes Exploited by Firms"
}, {
  words: ["European Union", "Reaches", "On", "Sweeping", "Technology", "Governance", "Charter"],
  probabilities: [1, 0.42, 0.52, 0.44, 0.26, 0.27, 0.41],
  headline: "While Markets React Nervously"
}, {
  words: ["European Union", "Reaches", "Around", "Historic", "AI", "Ethics", "Framework"],
  probabilities: [1, 0.42, 0.23, 0.48, 0.46, 0.65, 0.54],
  headline: "Laying Groundwork for Safe Tech Development"
}, {
  words: ["European Union", "Reaches", "Around", "Historic", "AI", "Ethics", "Charter"],
  probabilities: [1, 0.42, 0.23, 0.48, 0.46, 0.65, 0.35],
  headline: "Uniting Divided Northern and Southern Blocs"
}, {
  words: ["European Union", "Reaches", "Around", "Historic", "AI", "Governance", "Framework"],
  probabilities: [1, 0.42, 0.23, 0.48, 0.46, 0.27, 0.61],
  headline: "Satisfying Both Progressives and Conservatives"
}, {
  words: ["European Union", "Reaches", "Around", "Historic", "AI", "Governance", "Charter"],
  probabilities: [1, 0.42, 0.23, 0.48, 0.46, 0.27, 0.39],
  headline: "Rejecting Industry Lobbying Efforts"
}, {
  words: ["European Union", "Reaches", "Around", "Historic", "Technology", "Ethics", "Framework"],
  probabilities: [1, 0.42, 0.23, 0.48, 0.39, 0.59, 0.47],
  headline: "Cementing Brussels as Regulatory Leader"
}, {
  words: ["European Union", "Reaches", "Around", "Historic", "Technology", "Ethics", "Charter"],
  probabilities: [1, 0.42, 0.23, 0.48, 0.39, 0.59, 0.41],
  headline: "Sending Shockwaves Through Silicon Valley"
}, {
  words: ["European Union", "Reaches", "Around", "Historic", "Technology", "Governance", "Framework"],
  probabilities: [1, 0.42, 0.23, 0.48, 0.39, 0.32, 0.64],
  headline: "Following Whistleblower Revelations"
}, {
  words: ["European Union", "Reaches", "Around", "Historic", "Technology", "Governance", "Charter"],
  probabilities: [1, 0.42, 0.23, 0.48, 0.39, 0.32, 0.36],
  headline: "Under New Commission Leadership"
}, {
  words: ["European Union", "Reaches", "Around", "Sweeping", "AI", "Ethics", "Framework"],
  probabilities: [1, 0.42, 0.23, 0.37, 0.57, 0.74, 0.39],
  headline: "Transforming Global Governance Landscape"
}, {
  words: ["European Union", "Reaches", "Around", "Sweeping", "AI", "Ethics", "Charter"],
  probabilities: [1, 0.42, 0.23, 0.37, 0.57, 0.74, 0.52],
  headline: "Securing Cross-Party Parliamentary Support"
}, {
  words: ["European Union", "Reaches", "Around", "Sweeping", "AI", "Governance", "Framework"],
  probabilities: [1, 0.42, 0.23, 0.37, 0.57, 0.18, 0.69],
  headline: "Establishing Unprecedented Accountability Measures"
}, {
  words: ["European Union", "Reaches", "Around", "Sweeping", "AI", "Governance", "Charter"],
  probabilities: [1, 0.42, 0.23, 0.37, 0.57, 0.18, 0.31],
  headline: "Sparking Debate Over Sovereignty"
}, {
  words: ["European Union", "Reaches", "Around", "Sweeping", "Technology", "Ethics", "Framework"],
  probabilities: [1, 0.42, 0.23, 0.37, 0.32, 0.62, 0.53],
  headline: "Empowering Citizens with New Rights"
}, {
  words: ["European Union", "Reaches", "Around", "Sweeping", "Technology", "Ethics", "Charter"],
  probabilities: [1, 0.42, 0.23, 0.37, 0.32, 0.62, 0.48],
  headline: "Promising Enforcement Within 18 Months"
}, {
  words: ["European Union", "Reaches", "Around", "Sweeping", "Technology", "Governance", "Framework"],
  probabilities: [1, 0.42, 0.23, 0.37, 0.32, 0.29, 0.66],
  headline: "Demanding Algorithmic Explainability"
}, {
  words: ["European Union", "Reaches", "Around", "Sweeping", "Technology", "Governance", "Charter"],
  probabilities: [1, 0.42, 0.23, 0.37, 0.32, 0.29, 0.34],
  headline: "Positioning Europe as Democratic Alternative"
}];
interface WordTreeDiagramProps {
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  className?: string;
}

// Level labels for context
const levelLabels = ["Root", "Verb", "Prep", "Adj", "Topic", "Aspect", "Type"];
export function BranchDiagram({
  selectedPath,
  onPathChange,
  className
}: WordTreeDiagramProps) {
  // Default complete path: "European Union Reaches On Historic AI Ethics Framework"
  const defaultSelections: (string | null)[] = ["European Union", "Reaches", "On", "Historic", "AI", "Ethics", "Framework"];

  // Intro animation states - DISABLED: Set to skip intro and start interactive immediately
  // To re-enable intro animation, change these initial values:
  // - isIntroAnimating: true, isIntroComplete: false, isInteractive: false
  // - unlockedLevel: 0, selections: ["European Union", null, null, null, null, null, null]
  const [isIntroAnimating, setIsIntroAnimating] = useState(false);
  const [introLevel, setIntroLevel] = useState(0);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isInteractive, setIsInteractive] = useState(true);

  // Track unlocked level (starts at 1 for immediate interactivity)
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  // Track selected words at each level - tree starts with only root selected
  const [selections, setSelections] = useState<(string | null)[]>([treePaths[0].words[0], null, null, null, null, null, null]);
  // Track if user has made their first selection (to show greyed hint state initially)
  const [hasUserSelected, setHasUserSelected] = useState(false);

  // Sync internal selections with incoming selectedPath prop
  useEffect(() => {
    if (selectedPath && selectedPath.length > 0) {
      // Try to find a matching path in treePaths
      const matchingPath = treePaths.find(tp => {
        // Check if selectedPath matches the start of this tree path
        for (let i = 0; i < Math.min(selectedPath.length, tp.words.length); i++) {
          // Handle "European Union" vs ["European", "Union"] mismatch
          if (i === 0 && (selectedPath[0] === "European" || selectedPath[0] === "European Union")) {
            continue; // Skip root comparison, always matches
          }
          // For tree paths, index maps differently due to "European Union" being one word
          const treeIdx = i;
          const selectedIdx = selectedPath[0] === "European" ? i + 1 : i;
          if (selectedIdx >= selectedPath.length) break;
          if (tp.words[treeIdx]?.toLowerCase() !== selectedPath[selectedIdx]?.toLowerCase()?.replace(/[,.]$/g, '')) {
            return false;
          }
        }
        return true;
      });

      if (matchingPath) {
        const newSelections: (string | null)[] = [null, null, null, null, null, null, null];
        // Calculate how many levels are selected
        const offset = selectedPath[0] === "European" ? 1 : 0;
        const pathLength = selectedPath[0] === "European" ? selectedPath.length - 1 : selectedPath.length;
        
        for (let i = 0; i < Math.min(pathLength, 7); i++) {
          newSelections[i] = matchingPath.words[i];
        }
        setSelections(newSelections);
        setUnlockedLevel(Math.min(pathLength, 7));
        if (pathLength > 1) setHasUserSelected(true);
      }
    }
  }, []);

  // Track history of selections - words that were selected before user went back and chose differently
  // Each entry: { level, word, pathPrefix, yPosition (exact position when selected) }
  const [selectionHistory, setSelectionHistory] = useState<Array<{
    level: number;
    word: string;
    pathPrefix: string[];
    yPosition: number;
  }>>([]);

  // Ghost tooltip hover state - tracks mouse position
  const [ghostTooltip, setGhostTooltip] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  // Animation states per level
  const [animatingLevel, setAnimatingLevel] = useState<number | null>(null);
  const [animatedWord, setAnimatedWord] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(false);
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);
  const [selectedProbability, setSelectedProbability] = useState<number | null>(null);

  // Ref for auto-scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const levelRefs = useRef<(HTMLDivElement | null)[]>([]);
  

  // Intro animation effect - plays once on mount
  useEffect(() => {
    if (!isIntroAnimating) return;
    const animateNextWord = (level: number) => {
      if (level > 6) {
        // Animation complete
        setIsIntroAnimating(false);
        setIsIntroComplete(true);
        return;
      }
      setIntroLevel(level);
      setUnlockedLevel(level);

      // Select the word for this level after a brief delay
      setTimeout(() => {
        const word = defaultSelections[level];
        if (word) {
          setSelections(prev => {
            const newSelections = [...prev];
            newSelections[level] = word;
            return newSelections;
          });
        }

        // Move to next level
        setTimeout(() => {
          animateNextWord(level + 1);
        }, 400);
      }, 300);
    };

    // Start animation after a brief delay
    const timer = setTimeout(() => {
      animateNextWord(1);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle "Start your own" click
  const handleStartOwn = () => {
    setIsInteractive(true);
    setUnlockedLevel(1);
    setSelections(["European Union", null, null, null, null, null, null]);
    setSelectionHistory([]);
    onPathChange(["European Union"]);
    // Scroll back to start
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  // Reset to initial starting state (only root selected)
  const handleReset = () => {
    setUnlockedLevel(1);
    setSelections([treePaths[0].words[0], null, null, null, null, null, null]);
    setSelectionHistory([]);
    setHasUserSelected(false);
    // Reset animation states
    setAnimatingLevel(null);
    setAnimatedWord(null);
    setShowPulse(false);
    setShowSelectionMessage(false);
    // Scroll back to start
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
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
  const getOptionsAtLevel = (level: number): {
    word: string;
    probability: number;
  }[] => {
    if (level === 0) return [{
      word: "European Union",
      probability: 1
    }];
    const pathPrefix = currentPath.slice(0, level);
    const matchingPaths = treePaths.filter(p => pathPrefix.every((word, i) => p.words[i] === word));
    const uniqueOptions = new Map<string, number>();
    matchingPaths.forEach(p => {
      const word = p.words[level];
      const prob = p.probabilities[level];
      if (!uniqueOptions.has(word) || uniqueOptions.get(word)! < prob) {
        uniqueOptions.set(word, prob);
      }
    });
    return Array.from(uniqueOptions.entries()).map(([word, probability]) => ({
      word,
      probability
    })).sort((a, b) => b.probability - a.probability);
  };

  // Get headline for current path (only when complete)
  const getCurrentHeadline = (): string | null => {
    if (currentPath.length < 7) return null;
    const match = treePaths.find(p => p.words.every((word, i) => word === currentPath[i]));
    return match?.headline || null;
  };

  // Build display headline from selected words
  const buildDisplayHeadline = (): string => {
    const words = currentPath.filter(Boolean);
    if (words.length === 0) return "";
    return words.join(" ");
  };

  // Handle word selection - unlock next level
  const handleWordClick = (level: number, word: string) => {
    // Mark that user has made their first selection
    if (!hasUserSelected) {
      setHasUserSelected(true);
    }
    const newSelections = [...selections];

    // Save current selections from this level onwards to history before clearing
    // Only if there are selections to save (user is going back)
    const historyToAdd: Array<{
      level: number;
      word: string;
      pathPrefix: string[];
      yPosition: number;
    }> = [];
    for (let i = level; i <= 6; i++) {
      if (newSelections[i]) {
        // Build the path prefix that led to this selection
        const pathPrefix = newSelections.slice(0, i).filter(Boolean) as string[];
        // Calculate the Y position this word was at when selected
        const yPosition = getSelectedYAtLevel(i);
        historyToAdd.push({
          level: i,
          word: newSelections[i]!,
          pathPrefix,
          yPosition
        });
      }
    }
    if (historyToAdd.length > 0) {
      setSelectionHistory(prev => [...prev, ...historyToAdd]);
    }

    // Clear all selections from this level onwards
    for (let i = level; i <= 6; i++) {
      newSelections[i] = null;
    }
    newSelections[level] = word;
    setSelections(newSelections);

    // Unlock next level
    const nextLevel = level + 1;
    if (level < 6) {
      setUnlockedLevel(nextLevel);
    }

    // Notify parent
    const newPath = [treePaths[0].words[0]];
    for (let i = 1; i <= level; i++) {
      if (newSelections[i]) newPath.push(newSelections[i]!);
    }
    onPathChange(newPath);
  };

  // Auto-scroll when unlocked level changes (and selections update)
  // Scrolls horizontally within the container to keep current progress visible
  useEffect(() => {
    if (unlockedLevel < 1) return;
    if (!containerRef.current) return;

    requestAnimationFrame(() => {
      const targetLevel = Math.min(unlockedLevel, 6);
      const levelEl = levelRefs.current[targetLevel];
      if (!levelEl) return;

      // Only scroll horizontally within the tree container, not the page
      const container = containerRef.current;
      if (!container) return;
      
      const levelRect = levelEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate scroll position to center the target level horizontally
      const levelCenterX = levelRect.left + levelRect.width / 2;
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const scrollOffset = levelCenterX - containerCenterX;
      
      container.scrollBy({
        left: scrollOffset,
        behavior: 'smooth'
      });
    });
  }, [unlockedLevel, selections]);

  // Play animation for a level
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
  const nodeHeight = 40;
  const levelGap = 65;
  const containerHeight = 480; // Reduced to fit better in viewport while showing all paths

  // Get Y position for a node, optionally centered around a reference Y
  const getNodeY = (idx: number, count: number, centerY?: number) => {
    const totalHeight = count * nodeHeight + (count - 1) * levelGap;
    if (centerY !== undefined) {
      // Center the group around centerY
      const startOffset = centerY - totalHeight / 2;
      return startOffset + idx * (nodeHeight + levelGap) + nodeHeight / 2;
    }
    // Default: center in container
    const startOffset = (containerHeight - totalHeight) / 2;
    return startOffset + idx * (nodeHeight + levelGap) + nodeHeight / 2;
  };

  // Get the Y position of the selected word at a given level
  const getSelectedYAtLevel = (level: number): number => {
    if (level === 0) return containerHeight / 2;
    const prevY = getSelectedYAtLevel(level - 1);
    const options = getOptionsAtLevelWithPrevPath(level);
    const selectedWord = selections[level];
    const idx = options.findIndex(o => o.word === selectedWord);
    if (idx >= 0) {
      return getNodeY(idx, options.length, prevY);
    }
    return prevY; // Fallback to previous position
  };

  // Get options based on the path up to this level
  const getOptionsAtLevelWithPrevPath = (level: number): {
    word: string;
    probability: number;
  }[] => {
    if (level === 0) return [{
      word: "European Union",
      probability: 1
    }];
    const pathPrefix: string[] = [treePaths[0].words[0]];
    for (let i = 1; i < level; i++) {
      if (selections[i]) pathPrefix.push(selections[i]!);else break;
    }
    const matchingPaths = treePaths.filter(p => pathPrefix.every((word, i) => p.words[i] === word));
    const uniqueOptions = new Map<string, number>();
    matchingPaths.forEach(p => {
      const word = p.words[level];
      const prob = p.probabilities[level];
      if (!uniqueOptions.has(word) || uniqueOptions.get(word)! < prob) {
        uniqueOptions.set(word, prob);
      }
    });
    return Array.from(uniqueOptions.entries()).map(([word, probability]) => ({
      word,
      probability
    })).sort((a, b) => b.probability - a.probability);
  };

  // Get history items at a specific level, filtering out overlaps
  const getFilteredHistoryAtLevel = (level: number, activeYPositions: number[]) => {
    const historyItems = selectionHistory.filter(h => h.level === level);

    // Sort by index in array (later = more recent) - reverse to process most recent first
    const sortedHistory = [...historyItems].reverse();
    const occupiedPositions: number[] = [...activeYPositions];
    const filteredHistory: typeof historyItems = [];
    for (const item of sortedHistory) {
      // Check if this position overlaps with any occupied position
      const overlaps = occupiedPositions.some(y => Math.abs(y - item.yPosition) < nodeHeight);
      if (!overlaps) {
        filteredHistory.push(item);
        occupiedPositions.push(item.yPosition);
      }
    }
    return filteredHistory;
  };

  // Render a level column
  const renderLevel = (level: number) => {
    // For future levels (beyond unlocked), don't render active options
    const options = level <= unlockedLevel ? getOptionsAtLevelWithPrevPath(level) : [];

    // Get center Y from previous level's selection
    const prevSelectedY = level > 0 ? getSelectedYAtLevel(level - 1) : containerHeight / 2;

    // Calculate active Y positions first
    const activeYPositions = options.map((_, idx) => getNodeY(idx, options.length, level > 0 ? prevSelectedY : undefined));

    // Get filtered history items (no overlaps with active or each other)
    const historyItems = getFilteredHistoryAtLevel(level, activeYPositions);

    // If no options and no history, skip
    if (options.length === 0 && historyItems.length === 0) return null;

    // Allow selection if: level is unlocked AND (no selection yet OR can change existing selection)
    const canSelect = level > 0 && level <= unlockedLevel;
    const isCurrentFrontier = level === unlockedLevel && !selections[level];
    
    // Ghost word alternatives for each level (first 2 shown as chips)
    const levelGhostWords: Record<number, string[]> = {
      1: ["Agrees", "Decides", "Moves", "Acts", "Votes"],
      2: ["For", "Toward", "With", "After", "Upon"],
      3: ["Major", "New", "Bold", "Landmark", "Key"],
      4: ["Digital", "Machine", "Data", "Automation", "Computing"],
      5: ["Standards", "Rules", "Policy", "Regulation", "Guidelines"],
      6: ["Bill", "Law", "Act", "Plan", "Accord"]
    };
    const ghosts = levelGhostWords[level] || [];
    const ghostsAbove = ghosts.slice(0, 1); // First ghost word above
    const ghostsBelow = ghosts.slice(1, 2); // Second ghost word below
    const moreCount = level > 0 ? 30 + (level * 7) : 0; // Remaining count
    
    // Fake probabilities for ghost words (lower than real options)
    const ghostProbabilities: Record<number, number[]> = {
      1: [0.08, 0.05],
      2: [0.06, 0.04],
      3: [0.09, 0.06],
      4: [0.07, 0.05],
      5: [0.08, 0.04],
      6: [0.06, 0.03]
    };
    const ghostProbs = ghostProbabilities[level] || [0.05, 0.03];
    
    // Calculate positions
    const realYPositions = options.map((_, idx) =>
      getNodeY(idx, options.length, level > 0 ? prevSelectedY : undefined)
    );
    const minRealY = Math.min(...realYPositions);
    const maxRealY = Math.max(...realYPositions);

    // Spacing (prevent overlap with probability badges above buttons)
    const ghostChipHeight = 28;
    const ghostGapToReal = 44; // ensure clear separation from top badge + button
    const ghostGapToDots = 18;
    const dotSizes = [6, 5];
    const dotSpacing = 22;
    const moreSpacing = 18;

    const topRealTop = minRealY - nodeHeight / 2;
    const bottomRealBottom = maxRealY + nodeHeight / 2;

    const ghostAboveTop = topRealTop - ghostGapToReal - ghostChipHeight;
    const ghostBelowTop = bottomRealBottom + ghostGapToReal;

    const dotAboveTops = [
      ghostAboveTop - ghostGapToDots - dotSizes[0],
      ghostAboveTop - ghostGapToDots - dotSizes[0] - dotSpacing - dotSizes[1]
    ];

    const dotBelowTops = [
      ghostBelowTop + ghostChipHeight + ghostGapToDots,
      ghostBelowTop + ghostChipHeight + ghostGapToDots + dotSizes[0] + dotSpacing
    ];

    const moreTop = dotBelowTops[1] + dotSizes[1] + moreSpacing;

    return <div key={level} ref={el => {
      levelRefs.current[level] = el;
    }} className="relative" style={{
      height: containerHeight,
      minWidth: level === 0 ? 140 : 110
    }}>
        <>
            {/* Ghost elements container - only visible for current frontier (where user needs to select) */}
            {level > 0 && isCurrentFrontier && (
              <div
                className="cursor-default"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: containerHeight,
                  pointerEvents: "none",
                }}
              >
                {/* Invisible hover target spanning ghost elements */}
                <div
                  onMouseEnter={(e) => setGhostTooltip({ visible: true, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setGhostTooltip({ visible: true, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setGhostTooltip({ visible: false, x: 0, y: 0 })}
                  style={{
                    position: "absolute",
                    top: dotAboveTops[1] - 8,
                    left: -10,
                    right: -10,
                    height: (moreTop - dotAboveTops[1]) + 60,
                    pointerEvents: "auto",
                  }}
                />

                {/* Ghost word chip above */}
                {ghostsAbove.map((ghost, idx) => (
                  <div
                    key={`ghost-above-${level}-${ghost}`}
                    style={{
                      position: "absolute",
                      top: ghostAboveTop,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div
                      className="relative px-3 py-1.5 rounded-md text-xs border border-dashed whitespace-nowrap transition-opacity duration-200"
                      style={{
                        opacity: ghostTooltip.visible ? 0.6 : 0.35,
                        borderColor: "hsl(var(--muted-foreground))",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {ghost}
                      <span 
                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap bg-muted text-muted-foreground"
                        style={{ opacity: ghostTooltip.visible ? 0.6 : 0.35 }}
                      >
                        {ghostProbs[idx]?.toFixed(2) || '0.05'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Trailing dots above ghost chip */}
                {dotAboveTops.map((top, idx) => (
                  <div
                    key={`dot-above-${level}-${idx}`}
                    style={{
                      position: "absolute",
                      top,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div
                      className="rounded-full bg-muted-foreground transition-opacity duration-200"
                      style={{
                        width: dotSizes[idx],
                        height: dotSizes[idx],
                        opacity: ghostTooltip.visible ? 0.5 : Math.max(0.08, 0.26 - idx * 0.1),
                      }}
                    />
                  </div>
                ))}

                {/* Ghost word chip below */}
                {ghostsBelow.map((ghost, idx) => (
                  <div
                    key={`ghost-below-${level}-${ghost}`}
                    style={{
                      position: "absolute",
                      top: ghostBelowTop,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div
                      className="relative px-3 py-1.5 rounded-md text-xs border border-dashed whitespace-nowrap transition-opacity duration-200"
                      style={{
                        opacity: ghostTooltip.visible ? 0.6 : 0.35,
                        borderColor: "hsl(var(--muted-foreground))",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {ghost}
                      <span 
                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap bg-muted text-muted-foreground"
                        style={{ opacity: ghostTooltip.visible ? 0.6 : 0.35 }}
                      >
                        {ghostProbs[idx + 1]?.toFixed(2) || '0.03'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Trailing dots below ghost chip */}
                {dotBelowTops.map((top, idx) => (
                  <div
                    key={`dot-below-${level}-${idx}`}
                    style={{
                      position: "absolute",
                      top,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div
                      className="rounded-full bg-muted-foreground transition-opacity duration-200"
                      style={{
                        width: dotSizes[idx],
                        height: dotSizes[idx],
                        opacity: ghostTooltip.visible ? 0.5 : Math.max(0.08, 0.26 - idx * 0.1),
                      }}
                    />
                  </div>
                ))}

                {/* "+N more" badge */}
                <div
                  style={{
                    position: "absolute",
                    top: moreTop,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="text-[10px] whitespace-nowrap transition-all duration-200"
                      style={{
                        color: ghostTooltip.visible ? "hsl(var(--muted-foreground) / 0.8)" : "hsl(var(--muted-foreground) / 0.5)",
                      }}
                    >
                      +{moreCount} more
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Current active word buttons */}
            {options.map((option, idx) => {
              const isSelected = selections[level] === option.word;
              const isAnimated = animatingLevel === level && animatedWord === option.word;
              const isPulsing = showPulse && animatingLevel === level && animatedWord === option.word;

              // Calculate Y position centered around previous selection
              const nodeY = getNodeY(idx, options.length, level > 0 ? prevSelectedY : undefined);
              return <div key={option.word} style={{
                position: 'absolute',
                top: nodeY - nodeHeight / 2,
                left: 0,
                right: 0
              }}>
                {/* LLM Selection Message - show above selected word */}
                {showSelectionMessage && isPulsing && <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                    Highest: {selectedProbability !== null ? (selectedProbability * 100).toFixed(0) : 0}%
                  </div>
                </div>}
                
                <button 
                  onClick={() => canSelect && handleWordClick(level, option.word)} 
                  disabled={!canSelect} 
                  data-word={option.word}
                  data-selected={isSelected ? "true" : "false"}
                  className={cn("relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 whitespace-nowrap", level === 0 ? "min-w-[140px]" : "min-w-[100px]", "h-11", level === 0 ? "bg-primary text-primary-foreground border-primary cursor-default" : option.word === "Charter" ? isSelected ? "bg-destructive/30 border-destructive text-destructive shadow-md scale-105 cursor-pointer" : canSelect ? "bg-destructive/10 border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/20 cursor-pointer" : "bg-muted/50 border-muted text-muted-foreground/60 cursor-not-allowed" : isSelected ? "bg-green-200 border-green-400 text-green-900 shadow-md scale-105 cursor-pointer" : canSelect ? "bg-card border-border hover:border-primary/50 hover:bg-muted cursor-pointer" : "bg-muted/50 border-muted text-muted-foreground/60 cursor-not-allowed", isAnimated && !isPulsing && "border-primary bg-primary/10", isPulsing && "bg-primary text-primary-foreground border-primary shadow-lg scale-110")}>
                  {option.word === "Charter" && !isPulsing ? <TextFlag text="Charter" evaluationFactor="factual_accuracy" explanation="The EU AI Act is officially called the 'AI Act' or 'Artificial Intelligence Act', not a 'Charter'. Using 'Charter' is factually inaccurate." severity="error" noUnderline={true} /> : option.word}
                  {level > 0 && <span className={cn("absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap", isPulsing ? "bg-primary text-primary-foreground" : isSelected ? "bg-green-200 text-green-800" : "bg-muted text-muted-foreground")}>
                    {option.probability.toFixed(2)}
                  </span>}
                </button>
              </div>;
            })}
          </>
      </div>;
  };

  // Ghost word alternatives to show LLMs choose from many words
  const ghostWords: Record<number, string[]> = {
    1: ["Agrees", "Decides", "Moves", "Acts", "Votes"],
    2: ["For", "Toward", "With", "After", "Upon"],
    3: ["Major", "New", "Bold", "Landmark", "Key"],
    4: ["Digital", "Machine", "Data", "Automation", "Computing"],
    5: ["Standards", "Rules", "Policy", "Regulation", "Guidelines"],
    6: ["Bill", "Law", "Act", "Plan", "Accord"]
  };

  // Render connector lines - show many branches fanning out from selected node
  const renderConnector = (fromLevel: number, toLevel: number) => {
    // Only show connector if this transition is relevant
    if (toLevel > unlockedLevel) return null;
    if (fromLevel > 0 && !selections[fromLevel]) return null;
    const toOptions = getOptionsAtLevelWithPrevPath(toLevel);
    if (toOptions.length === 0) return null;

    // Get the Y position of the selected word at fromLevel
    const fromY = getSelectedYAtLevel(fromLevel);

    // Generate ghost line positions (above and below real options)
    const ghostCount = 4; // Number of ghost lines on each side
    const ghostLinesAbove: number[] = [];
    const ghostLinesBelow: number[] = [];
    
    // Calculate the bounds of real options
    const realYPositions = toOptions.map((_, idx) => getNodeY(idx, toOptions.length, fromY));
    const minRealY = Math.min(...realYPositions);
    const maxRealY = Math.max(...realYPositions);
    
    // Add ghost lines above and below with varying distances
    for (let i = 1; i <= ghostCount; i++) {
      const offsetAbove = 25 + i * 18 + (i * 7 % 5) * 4;
      const offsetBelow = 25 + i * 18 + (i * 3 % 5) * 4;
      ghostLinesAbove.push(minRealY - offsetAbove);
      ghostLinesBelow.push(maxRealY + offsetBelow);
    }

    return <div key={`conn-${fromLevel}-${toLevel}`} className="flex items-center w-24" style={{
      height: containerHeight
    }}>
        <svg className="w-full h-full" viewBox={`0 0 96 ${containerHeight}`} preserveAspectRatio="none">
          
          {/* Ghost lines above - faded alternatives */}
          {ghostLinesAbove.map((toY, idx) => {
            const curveOffset = ((idx + 1) * 11 % 7 - 3) * 6;
            const vertOffset = ((idx + 1) * 5 % 4 - 2) * 4;
            const opacity = 0.12 - idx * 0.025;
            return <path 
              key={`ghost-above-${idx}`} 
              d={`M 0 ${fromY} C ${34 + curveOffset} ${fromY + vertOffset}, ${62 - curveOffset} ${toY - vertOffset}, 96 ${toY}`} 
              fill="none" 
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth={0.75} 
              strokeOpacity={Math.max(0.04, opacity)}
              strokeDasharray="3 4"
            />;
          })}
          
          {/* Ghost lines below - faded alternatives */}
          {ghostLinesBelow.map((toY, idx) => {
            const curveOffset = ((idx + 2) * 13 % 7 - 3) * 6;
            const vertOffset = ((idx + 2) * 7 % 4 - 2) * 4;
            const opacity = 0.12 - idx * 0.025;
            return <path 
              key={`ghost-below-${idx}`} 
              d={`M 0 ${fromY} C ${34 + curveOffset} ${fromY + vertOffset}, ${62 - curveOffset} ${toY - vertOffset}, 96 ${toY}`} 
              fill="none" 
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth={0.75} 
              strokeOpacity={Math.max(0.04, opacity)}
              strokeDasharray="3 4"
            />;
          })}
          
          {/* Real option lines - varied curves */}
          {toOptions.map((toOpt, toIdx) => {
          // Calculate toY centered around fromY
          const toY = getNodeY(toIdx, toOptions.length, fromY);
          const isSelected = selections[toLevel] === toOpt.word;

          // Varied curve control points for organic look
          const curveOffset = (toIdx * 7 % 5 - 2) * 8;
          const vertOffset = (toIdx * 3 % 3 - 1) * 6;
          return <path key={`real-${toOpt.word}`} d={`M 0 ${fromY} C ${34 + curveOffset} ${fromY + vertOffset}, ${62 - curveOffset} ${toY - vertOffset}, 96 ${toY}`} fill="none" stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} strokeWidth={isSelected ? 2.5 : 1} strokeOpacity={isSelected ? 1 : 0.3} />;
        })}
        </svg>
      </div>;
  };
  const displayHeadline = buildDisplayHeadline();
  const headline = getCurrentHeadline();
  return <div className={cn("relative", className)}>
      {/* Content wrapper - blurs when intro complete */}
      <div className={cn("transition-all duration-500", isIntroComplete && !isInteractive && "opacity-25 blur-sm pointer-events-none")}>
        {/* Current headline display - fixed above scrollable tree */}
        <div className="flex items-center justify-between bg-card rounded-lg px-4 py-3 mb-4">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-medium text-foreground">
              {(() => {
              // During intro animation, highlight the word being selected
              if (isIntroAnimating && introLevel > 0) {
                const words = (displayHeadline || "European Union").split(" ");
                return words.map((word, idx) => <span key={idx}>
                      {idx > 0 && " "}
                      <span className={cn(idx === introLevel ? "bg-primary text-primary-foreground px-1 rounded animate-pulse" : "")}>
                        {word}
                      </span>
                    </span>);
              }

              // Show full sentence with greyed-out selectable words when user hasn't selected yet
              if (!hasUserSelected && isInteractive) {
                // Show the default sentence with "European Union" normal and rest greyed
                const defaultWords = defaultSelections.filter(Boolean) as string[];
                // Find the headline for the default path
                const defaultHeadline = treePaths.find(p => defaultSelections.every((word, i) => word === p.words[i]))?.headline;
                return <>
                      {defaultWords.map((word, idx) => <span key={idx}>
                          {idx > 0 && " "}
                          <span className={cn(idx === 0 ? "" : "text-muted-foreground/50")}>
                            {word}
                          </span>
                        </span>)}
                      {defaultHeadline && <span className="text-muted-foreground/50 ml-1">{defaultHeadline}</span>}
                    </>;
              }

              // Normal display logic after user has made selections
              const words = (displayHeadline || "European Union").split(" ");
              if (!headline && !isIntroComplete) {
                const lastWord = words.pop();
                const prefix = words.join(" ");
                return <>
                      {prefix && <>{prefix} </>}
                      <span className="bg-green-200 text-green-900 px-1 rounded">{lastWord}</span>
                    </>;
              }
              return words.join(" ");
            })()}
              {headline && !isIntroAnimating && hasUserSelected && <span className={cn("px-1 rounded ml-1", isInteractive ? "bg-green-200 text-green-900" : "")}>{headline}</span>}
              {!headline && displayHeadline && !isIntroAnimating && hasUserSelected && <span className="text-muted-foreground/50">...</span>}
            </p>
          </div>
          {/* Reset button - only show when interactive */}
          {isInteractive && unlockedLevel > 1 && <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs gap-1.5 ml-4 flex-shrink-0">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>}
        </div>

        {/* Scrollable tree container */}
        <div ref={containerRef} className="overflow-x-auto scroll-smooth">
          <div className="min-w-[1600px] p-6 pr-[320px]">
          <div className="flex items-start gap-1">
            {/* Level 0: Root */}
            {renderLevel(0)}
            
            {/* Levels 1-6 with connectors and monitor button column */}
            {[1, 2, 3, 4, 5, 6].map(level => {
              const isCurrentFrontier = level === unlockedLevel && !selections[level];
              const options = level <= unlockedLevel ? getOptionsAtLevelWithPrevPath(level) : [];
              const prevSelectedY = level > 0 ? getSelectedYAtLevel(level - 1) : containerHeight / 2;
              
              // Calculate vertical center between the word options
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
                  
                  {/* Monitor button column - after the frontier level word selections */}
                  {isCurrentFrontier && (
                    <div 
                      className="relative flex items-center justify-center" 
                      style={{ height: containerHeight, width: 40 }}
                    >
                      <div 
                        className="absolute"
                        style={{ top: centerY - 14 }}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => playAnimation(level)} 
                                disabled={animatingLevel !== null} 
                                className={cn(
                                  "p-1.5 rounded-md transition-all duration-200",
                                  animatingLevel === level 
                                    ? "bg-primary/20 text-primary animate-pulse" 
                                    : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                                )}
                              >
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
                  )}
                </React.Fragment>
              );
            })}

            {/* Final connector to headline - only when complete */}
            {headline && <>
                <div className="flex items-center w-6" style={{
                height: containerHeight
              }}>
                  <svg className="w-full h-full" viewBox={`0 0 24 ${containerHeight}`} preserveAspectRatio="none">
                    {(() => {
                    const y = getSelectedYAtLevel(6);
                    return <path d={`M 0 ${y} L 24 ${y}`} fill="none" stroke="rgb(74 222 128)" strokeWidth={2.5} />;
                  })()}
                  </svg>
                </div>

                {/* Headline completion */}
                <div className="relative" style={{
                height: containerHeight,
                minWidth: 280
              }}>
                  {/* Connector line to headline */}
                  <svg className="absolute left-0 w-24" style={{
                    top: 0,
                    height: containerHeight
                  }} viewBox={`0 0 96 ${containerHeight}`} preserveAspectRatio="none">
                    <path 
                      d={`M 0 ${getSelectedYAtLevel(6)} C 34 ${getSelectedYAtLevel(6)}, 62 ${Math.max(20, getSelectedYAtLevel(6) - nodeHeight / 2) + nodeHeight / 2}, 96 ${Math.max(20, getSelectedYAtLevel(6) - nodeHeight / 2) + nodeHeight / 2}`}
                      fill="none"
                      stroke="rgb(74 222 128)"
                      strokeWidth={2.5}
                    />
                  </svg>
                  <div className="absolute animate-fade-in" style={{
                    top: Math.max(20, getSelectedYAtLevel(6) - nodeHeight / 2),
                    left: 96
                  }}>
                    <p className="text-sm font-medium text-green-900 leading-relaxed px-4 py-2 rounded-lg border-2 border-green-400 bg-green-200 whitespace-nowrap">
                      ...{headline}
                    </p>
                  </div>
                </div>
              </>}
          </div>
        </div>
        </div>
      </div>
      
      {/* Start your own - between headline and diagram */}
      {isIntroComplete && !isInteractive && <div className="absolute left-0 right-0 top-24 flex justify-center animate-fade-in z-10">
          <Button onClick={handleStartOwn} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Start Your Own Headline
          </Button>
        </div>}
      
      {/* Floating tooltip for ghost elements - follows mouse */}
      {ghostTooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none animate-fade-in"
          style={{
            left: ghostTooltip.x + 16,
            top: ghostTooltip.y + 16,
          }}
        >
          <div className="bg-card border border-border shadow-lg rounded-lg px-4 py-3 max-w-[280px]">
            <p className="text-sm text-foreground leading-relaxed">
              At each step, the LLM evaluates <strong>thousands of possible next tokens</strong> and assigns a probability to each one. Only the top candidates are shown here.
            </p>
          </div>
        </div>
      )}
    </div>;
}