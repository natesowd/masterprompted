import React, { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw, Monitor, ZoomIn, ZoomOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TextFlag from "@/components/TextFlag";

/**
 * BranchTreeDiagram - Shows all possible sentence branches greyed out,
 * with word selection on the right. Selecting a word highlights the corresponding branch.
 */

interface TreePath {
  words: string[];
  probabilities: number[];
  headline: string;
}

// Flag configuration for words in the tree
interface TokenFlagConfig {
  props: {
    evaluationFactor: "factual_accuracy" | "relevance" | "voice" | "bias" | "plagiarism";
    explanation: string;
    severity?: "error" | "warning" | "info";
    noUnderline?: boolean;
    href?: string;
  };
}

const TOKEN_FLAGS: Record<string, TokenFlagConfig> = {
  "Charter": {
    props: {
      evaluationFactor: "factual_accuracy",
      explanation: "The EU AI Act is officially called the 'AI Act' or 'Artificial Intelligence Act', not a 'Charter'. Using 'Charter' is factually inaccurate.",
      severity: "error",
      noUnderline: true
    }
  }
};

// All 64 paths
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
  // Default complete path: "European Union Reaches On Historic AI Ethics Framework"
  const defaultSelections: (string | null)[] = ["European Union", "Reaches", "On", "Historic", "AI", "Ethics", "Framework"];
  
  // Intro animation states - DISABLED: Set to skip intro and start interactive immediately
  // To re-enable intro animation, change these initial values:
  // - isIntroAnimating: true, isIntroComplete: false, isInteractive: false
  // - currentLevel: 1
  const [isIntroAnimating, setIsIntroAnimating] = useState(false);
  const [introLevel, setIntroLevel] = useState(0);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isInteractive, setIsInteractive] = useState(true);
  
  // Track selections at each level - tree starts with only root selected
  const [selections, setSelections] = useState<(string | null)[]>([treePaths[0].words[0], null, null, null, null, null, null]);
  const [currentLevel, setCurrentLevel] = useState(1);
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
        const pathLength = selectedPath[0] === "European" ? selectedPath.length - 1 : selectedPath.length;
        
        for (let i = 0; i < Math.min(pathLength, 7); i++) {
          newSelections[i] = matchingPath.words[i];
        }
        setSelections(newSelections);
        setCurrentLevel(Math.min(pathLength, 7));
        if (pathLength > 1) setHasUserSelected(true);
      }
    }
  }, []);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedWord, setAnimatedWord] = useState<string | null>(null);
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);
  const [selectedProbability, setSelectedProbability] = useState<number | null>(null);
  const [closeUpView, setCloseUpView] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Intro animation effect - plays once on mount
  useEffect(() => {
    if (!isIntroAnimating) return;
    
    const animateNextWord = (level: number) => {
      if (level > 6) {
        // Animation complete
        setIsIntroAnimating(false);
        setIsIntroComplete(true);
        setCurrentLevel(7);
        return;
      }
      
      setIntroLevel(level);
      setCurrentLevel(level);
      
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

  // Auto-scroll horizontally only when currentLevel increases (user advances)
  const prevLevelRef = React.useRef(currentLevel);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only auto-scroll when advancing forward
    if (currentLevel <= prevLevelRef.current) {
      prevLevelRef.current = currentLevel;
      return;
    }
    prevLevelRef.current = currentLevel;

    requestAnimationFrame(() => {
      const stepX = closeUpView ? 200 : 120;
      const isCompleteNow = selections.filter(Boolean).length >= 7;

      // Progressively scroll right as the user advances through levels; once complete, reveal the end.
      const targetLeft = isCompleteNow
        ? Math.max(0, container.scrollWidth - container.clientWidth)
        : Math.max(0, (currentLevel - 2) * stepX);

      container.scrollTo({ left: targetLeft, behavior: "smooth" });
    });
  }, [currentLevel, closeUpView, selections]);

  // Get options at each level based on current selections
  const getOptionsAtLevel = (level: number): {
    word: string;
    probability: number;
  }[] => {
    if (level === 0) return [{
      word: "European Union",
      probability: 1
    }];
    const pathPrefix = selections.slice(0, level).filter(Boolean) as string[];
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

  // Get all matching paths for current selections
  const getMatchingPaths = useMemo(() => {
    const pathPrefix = selections.slice(0, currentLevel).filter(Boolean) as string[];
    if (pathPrefix.length === 0) return treePaths;
    return treePaths.filter(p => pathPrefix.every((word, i) => p.words[i] === word));
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
    if (!isInteractive) return;
    
    // Mark that user has made their first selection
    if (!hasUserSelected) {
      setHasUserSelected(true);
    }
    
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

  // Handle "Start your own" click
  const handleStartOwn = () => {
    setIsInteractive(true);
    setCurrentLevel(1);
    setSelections(["European Union", null, null, null, null, null, null]);
    onPathChange(["European Union"]);
    // Scroll back to start
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Reset to initial starting state (only root selected)
  const handleReset = () => {
    setSelections([treePaths[0].words[0], null, null, null, null, null, null]);
    setCurrentLevel(1);
    setHasUserSelected(false);
    // Reset animation states
    setIsAnimating(false);
    setAnimatedWord(null);
    setShowSelectionMessage(false);
    setSelectedProbability(null);
    onPathChange([treePaths[0].words[0]]);
  };

  // Play computer selection animation
  const playAnimation = () => {
    if (isAnimating || currentLevel > 6) return;
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
        // Select highest probability option
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
    if (!selectedFullPath) return svgHeight / 2;
    const baseY = svgHeight / 2;
    const spread = baseSpread;
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

  // X positions vary based on view mode - close-up spreads words further apart
  // X positions - shifted right to ensure "European Union" is fully visible
  const firstWordWidth = Math.max(70, "European Union".length * 10 + 16); // ~156px
  const leftPadding = firstWordWidth / 2 + 10; // half the word width + margin
  const levelXPositions = closeUpView
    ? [leftPadding, leftPadding + 200, leftPadding + 400, leftPadding + 600, leftPadding + 800, leftPadding + 1000, leftPadding + 1200]
    : [leftPadding, leftPadding + 120, leftPadding + 240, leftPadding + 360, leftPadding + 480, leftPadding + 600, leftPadding + 720];
  const baseSpread = 220; // Keep constant for consistent branch shape
  const svgHeight = 580; // Increased to ensure all branching paths are visible

  const isComplete = selections.filter(Boolean).length >= 7;

  // Get current level options
  const currentOptions = currentLevel <= 6 ? getOptionsAtLevel(currentLevel) : [];
  // Get complete headline match
  const completeHeadline = currentLevel === 7 
    ? treePaths.find(p => p.words.every((word, i) => word === selections[i]))?.headline 
    : null;

  // Dimensions for the last word box (used for positioning the completion callout)
  const lastWord = selections[6] || "";
  const lastWordWidth = Math.max(70, lastWord.length * 10 + 16);

  // Completion box sizing - dynamically based on text length (single line, hugging)
  const completionBoxPaddingX = 16;
  const completionBoxHeight = 32;
  const completionLineGap = 8; // gap between last word edge and line start
  const lineLength = 30; // length of the connecting line
  const charWidth = 7; // approximate width per character at 12px font
  const completionTextWidth = completeHeadline ? completeHeadline.length * charWidth : 0;
  const completionBoxWidth = completionTextWidth + completionBoxPaddingX * 2;

  const baseSvgWidth = closeUpView ? (leftPadding + 1200 + 100) : (leftPadding + 720 + 100);
  const svgWidth = baseSvgWidth + (isComplete && completeHeadline ? lastWordWidth / 2 + completionLineGap + lineLength + completionBoxWidth + 20 : 0);

  // Build current headline
  const buildHeadline = (): string => {
    const selected = selections.filter(Boolean) as string[];
    if (selected.length < 7) {
      return selected.join(" ") + "...";
    }
    const match = treePaths.find(p => p.words.every((word, i) => word === selected[i]));
    return match ? `${selected.join(" ")}, ${match.headline}` : selected.join(" ");
  };

  // Build display headline from selections
  const displayHeadline = selections.filter(Boolean).join(" ");

  return <div className={cn("relative", className)}>
    {/* Content wrapper - blurs when intro complete */}
    <div className={cn(
      "space-y-6 transition-all duration-500",
      isIntroComplete && !isInteractive && "opacity-25 blur-sm pointer-events-none"
    )}>
      {/* Current headline header - sticky */}
      <div className="flex items-center justify-between bg-card rounded-lg px-4 py-3 border border-border/50">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            {isIntroAnimating ? "System generating headline:" : hasUserSelected ? "Current Headline:" : "Select words from the tree below to build your headline:"}
          </p>
          <p className="text-xl font-medium text-foreground">
            {(() => {
              // During intro animation, highlight the word being selected
              if (isIntroAnimating && introLevel > 0) {
                const words = (displayHeadline || "European Union").split(" ");
                return words.map((word, idx) => (
                  <span key={idx}>
                    {idx > 0 && " "}
                    <span className={cn(
                      idx === introLevel ? "bg-primary text-primary-foreground px-1 rounded animate-pulse" : ""
                    )}>
                      {word}
                    </span>
                  </span>
                ));
              }
              
              // Show full sentence with greyed-out selectable words when user hasn't selected yet
              if (!hasUserSelected && isInteractive) {
                // Show the default sentence with "European Union" normal and rest greyed
                const defaultWords = defaultSelections.filter(Boolean) as string[];
                // Find the headline for the default path
                const defaultHeadline = treePaths.find(p => 
                  defaultSelections.every((word, i) => word === p.words[i])
                )?.headline;
                return (
                  <>
                    {defaultWords.map((word, idx) => (
                      <span key={idx}>
                        {idx > 0 && " "}
                        <span className={cn(
                          idx === 0 ? "" : "text-muted-foreground/50"
                        )}>
                          {word}
                        </span>
                      </span>
                    ))}
                    {defaultHeadline && (
                      <span className="text-muted-foreground/50 ml-1">{defaultHeadline}</span>
                    )}
                  </>
                );
              }
              
              // Normal display logic after user has made selections
              const words = (displayHeadline || "European Union").split(" ");
              if (!completeHeadline && !isIntroComplete) {
                const lastWord = words.pop();
                const prefix = words.join(" ");
                return (
                  <>
                    {prefix && <>{prefix} </>}
                    <span className="bg-green-200 text-green-900 px-1 rounded">{lastWord}</span>
                  </>
                );
              }
              return words.join(" ");
            })()}
            {completeHeadline && !isIntroAnimating && hasUserSelected && <span className={cn("px-1 rounded ml-1", isInteractive ? "bg-green-200 text-green-900" : "")}>{completeHeadline}</span>}
            {!completeHeadline && displayHeadline && !isIntroAnimating && hasUserSelected && <span className="text-muted-foreground/50">...</span>}
          </p>
        </div>
        {/* Reset button - only show when interactive */}
        {isInteractive && currentLevel > 1 && (
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

      {/* Main layout: tree above, selection panel below */}
      <div className="flex flex-col gap-4">
        {/* Branch visualization - card style */}
        <div className="bg-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto" ref={scrollContainerRef}>
          <div className={cn("p-6", closeUpView ? "min-w-[1600px]" : "min-w-[600px]")}>
            <svg
              className="h-[520px]"
              width={closeUpView ? 1400 : svgWidth}
              height={520}
              viewBox={closeUpView ? `0 0 1400 ${svgHeight}` : `0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMinYMid meet"
            >
              {/* Draw all paths as branches from a proper tree */}
              {treePaths.map((path, pathIndex) => {
                const isMatching = pathMatchesSelections(path);

                // Calculate proper tree branching positions
                const level1Group = path.words[1] === "Unites" ? 0 : 1;
                const level2Group = path.words[2] === "On" ? 0 : 1;
                const level3Group = path.words[3] === "Historic" ? 0 : 1;
                const level4Group = path.words[4] === "AI" ? 0 : 1;
                const level5Group = path.words[5] === "Ethics" ? 0 : 1;
                const level6Group = path.words[6] === "Framework" ? 0 : 1;

                // Calculate Y positions - use constant spread for consistent shape
                const baseY = svgHeight / 2;
                const spread = baseSpread;

                // Progressive Y calculation
                const y1 = baseY + (level1Group - 0.5) * spread;
                const y2 = y1 + (level2Group - 0.5) * (spread / 2);
                const y3 = y2 + (level3Group - 0.5) * (spread / 4);
                const y4 = y3 + (level4Group - 0.5) * (spread / 8);
                const y5 = y4 + (level5Group - 0.5) * (spread / 16);
                const y6 = y5 + (level6Group - 0.5) * (spread / 32);
                const points = [{
                  x: levelXPositions[0],
                  y: baseY
                }, {
                  x: levelXPositions[1],
                  y: y1
                }, {
                  x: levelXPositions[2],
                  y: y2
                }, {
                  x: levelXPositions[3],
                  y: y3
                }, {
                  x: levelXPositions[4],
                  y: y4
                }, {
                  x: levelXPositions[5],
                  y: y5
                }, {
                  x: levelXPositions[6],
                  y: y6
                }];

                // Create curved path for smoother look (stop at last word, no extension)
                const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p, i) => {
                  const prev = points[i];
                  const cpX = (prev.x + p.x) / 2;
                  return `C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
                }).join(" ");
                return <g key={pathIndex}>
                  <path d={pathD} fill="none" stroke={isMatching ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} strokeWidth={isMatching ? 2.5 : 0.5} opacity={isMatching ? 1 : 0.15} className="transition-all duration-300" />
                  {/* End node */}
                  <circle cx={levelXPositions[6]} cy={y6} r={isMatching ? 4 : 1.5} fill={isMatching ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} opacity={isMatching ? 1 : 0.25} className="transition-all duration-300" />
                </g>;
              })}

              {/* Words along the selected path */}
              {selectedFullPath && selections.map((word, level) => {
                if (!word || level > 6) return null;
                const x = levelXPositions[level];
                // Recalculate Y - use constant spread
                const baseY = svgHeight / 2;
                const spread = baseSpread;
                const level1Group = selectedFullPath.words[1] === "Unites" ? 0 : 1;
                const level2Group = selectedFullPath.words[2] === "On" ? 0 : 1;
                const level3Group = selectedFullPath.words[3] === "Historic" ? 0 : 1;
                const level4Group = selectedFullPath.words[4] === "AI" ? 0 : 1;
                const level5Group = selectedFullPath.words[5] === "Ethics" ? 0 : 1;
                const y1 = baseY + (level1Group - 0.5) * spread;
                const y2 = y1 + (level2Group - 0.5) * (spread / 2);
                const y3 = y2 + (level3Group - 0.5) * (spread / 4);
                const y4 = y3 + (level4Group - 0.5) * (spread / 8);
                const y5 = y4 + (level5Group - 0.5) * (spread / 16);
                const yPositions = [baseY, y1, y2, y3, y4, y5, y5];
                const y = yPositions[level] || baseY;
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
                const displayWord = word;
                const wordWidth = Math.max(70, displayWord.length * 10 + 16);
                const rectHeight = 28;
                const probability = selectedFullPath.probabilities[level];


                const flagConfig = TOKEN_FLAGS[word];
                const isFlagged = !!flagConfig;
                // Currently defaulting all flags to destructive red for the tree view, 
                // but could be expanded to use flagConfig.props.severity
                const isDestructive = isFlagged && flagConfig.props.severity === 'error';

                return <g key={`word-${level}`} onClick={handleWordClickOnTree} className={cn(isClickable && "cursor-pointer")} style={{
                  pointerEvents: isClickable ? 'all' : 'none'
                }}>
                  {/* Probability label above word */}
                  {level > 0 && (
                    <text x={x} y={y - rectHeight / 2 - 6} textAnchor="middle" className="text-[10px] font-medium fill-muted-foreground pointer-events-none select-none">
                      {(probability * 100).toFixed(0)}%
                    </text>
                  )}
                  <rect x={x - wordWidth / 2} y={y - rectHeight / 2} width={wordWidth} height={rectHeight} rx={5} fill={isDestructive ? "hsl(var(--destructive))" : level === 0 ? "hsl(var(--primary))" : "hsl(142 76% 36%)"} className={cn("drop-shadow-sm transition-all duration-200", isClickable && !isDestructive && "hover:fill-[hsl(142_76%_30%)]", isClickable && isDestructive && "hover:fill-[hsl(var(--destructive)/0.8)]")} />
                  <text x={x} y={y + 5} textAnchor="middle" className="text-[12px] font-semibold fill-primary-foreground pointer-events-none select-none">
                    {displayWord}
                  </text>
                </g>;
              })}

              {/* Current selection options shown on the diagram - positioned over branch nodes */}
              {currentLevel <= 6 && currentLevel > 0 && isInteractive && (() => {
                const options = currentOptions;
                if (options.length === 0) return null;
                
                const x = levelXPositions[currentLevel];
                const baseY = svgHeight / 2;
                const spread = baseSpread;
                
                // Calculate Y position for each option based on actual branch positions
                const getOptionY = (word: string): number => {
                  // Build a hypothetical selection with this word
                  const hypotheticalSelections = [...selections];
                  hypotheticalSelections[currentLevel] = word;
                  
                  // Calculate Y using the same logic as the tree paths
                  let y = baseY;
                  
                  // Level 1 branching
                  if (currentLevel >= 1) {
                    const word1 = currentLevel === 1 ? word : selections[1];
                    const group1 = word1 === "Unites" ? 0 : 1;
                    y = baseY + (group1 - 0.5) * spread;
                  }
                  
                  // Level 2 branching
                  if (currentLevel >= 2) {
                    const word2 = currentLevel === 2 ? word : selections[2];
                    const group2 = word2 === "On" ? 0 : 1;
                    y = y + (group2 - 0.5) * (spread / 2);
                  }
                  
                  // Level 3 branching
                  if (currentLevel >= 3) {
                    const word3 = currentLevel === 3 ? word : selections[3];
                    const group3 = word3 === "Historic" ? 0 : 1;
                    y = y + (group3 - 0.5) * (spread / 4);
                  }
                  
                  // Level 4 branching
                  if (currentLevel >= 4) {
                    const word4 = currentLevel === 4 ? word : selections[4];
                    const group4 = word4 === "AI" ? 0 : 1;
                    y = y + (group4 - 0.5) * (spread / 8);
                  }
                  
                  // Level 5 branching
                  if (currentLevel >= 5) {
                    const word5 = currentLevel === 5 ? word : selections[5];
                    const group5 = word5 === "Ethics" ? 0 : 1;
                    y = y + (group5 - 0.5) * (spread / 16);
                  }
                  
                  // Level 6 branching
                  if (currentLevel >= 6) {
                    const word6 = currentLevel === 6 ? word : selections[6];
                    const group6 = word6 === "Framework" ? 0 : 1;
                    y = y + (group6 - 0.5) * (spread / 32);
                  }
                  
                  return y;
                };
                
                return options.map((opt, idx) => {
                  const optY = getOptionY(opt.word);
                  const optWordWidth = Math.max(70, opt.word.length * 10 + 16);
                  const rectHeight = 28;
                  const isAnimated = animatedWord === opt.word;
                  const flagConfig = TOKEN_FLAGS[opt.word];
                  const isFlagged = !!flagConfig;
                  const isDestructive = isFlagged && flagConfig.props.severity === 'error';
                  
                  return (
                    <g 
                      key={`option-${idx}`} 
                      onClick={() => handleWordClick(currentLevel, opt.word)}
                      className="cursor-pointer"
                      style={{ pointerEvents: 'all' }}
                    >
                      {/* Probability label above word */}
                      <text 
                        x={x} 
                        y={optY - rectHeight / 2 - 6} 
                        textAnchor="middle" 
                        className="text-[10px] font-medium fill-muted-foreground pointer-events-none select-none"
                      >
                        {(opt.probability * 100).toFixed(0)}%
                      </text>
                      <rect 
                        x={x - optWordWidth / 2} 
                        y={optY - rectHeight / 2} 
                        width={optWordWidth} 
                        height={rectHeight} 
                        rx={5} 
                        fill={isDestructive ? "hsl(var(--destructive))" : isAnimated ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                        stroke={isDestructive ? "hsl(var(--destructive))" : "hsl(var(--border))"}
                        strokeWidth={1}
                        className={cn(
                          "transition-all duration-200",
                          !isDestructive && "hover:fill-[hsl(var(--primary))]",
                          isDestructive && "hover:fill-[hsl(var(--destructive)/0.8)]",
                          isAnimated && "animate-pulse"
                        )} 
                      />
                      <text 
                        x={x} 
                        y={optY + 5} 
                        textAnchor="middle" 
                        className={cn(
                          "text-[12px] font-semibold pointer-events-none select-none",
                          isAnimated ? "fill-primary-foreground" : "fill-foreground"
                        )}
                      >
                        {opt.word}
                      </text>
                    </g>
                  );
                });
              })()}

              {/* Auto-select button between word options */}
              {currentLevel <= 6 && isInteractive && (() => {
                const x = levelXPositions[currentLevel] || 0;
                const baseY = svgHeight / 2;
                const spread = svgHeight * 0.3;
                
                // Calculate center Y between the two options
                let centerY = baseY;
                
                // Calculate based on current selections path
                if (currentLevel >= 1 && selections[1]) {
                  const group1 = selections[1] === "Unites" ? 0 : 1;
                  centerY = baseY + (group1 - 0.5) * spread;
                }
                if (currentLevel >= 2 && selections[2]) {
                  const group2 = selections[2] === "On" ? 0 : 1;
                  centerY = centerY + (group2 - 0.5) * (spread / 2);
                }
                if (currentLevel >= 3 && selections[3]) {
                  const group3 = selections[3] === "Historic" ? 0 : 1;
                  centerY = centerY + (group3 - 0.5) * (spread / 4);
                }
                if (currentLevel >= 4 && selections[4]) {
                  const group4 = selections[4] === "AI" ? 0 : 1;
                  centerY = centerY + (group4 - 0.5) * (spread / 8);
                }
                if (currentLevel >= 5 && selections[5]) {
                  const group5 = selections[5] === "Ethics" ? 0 : 1;
                  centerY = centerY + (group5 - 0.5) * (spread / 16);
                }
                
                const buttonSize = 32;
                
                return (
                  <foreignObject
                    x={x - buttonSize / 2}
                    y={centerY - buttonSize / 2}
                    width={buttonSize}
                    height={buttonSize}
                    style={{ overflow: 'visible' }}
                  >
                    <button
                      onClick={() => !isAnimating && playAnimation()}
                      disabled={isAnimating}
                      className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center",
                        "bg-muted",
                        "hover:bg-accent transition-all duration-200",
                        "cursor-pointer",
                        isAnimating && "opacity-50 pointer-events-none"
                      )}
                      title="Watch LLM select highest probability"
                    >
                      <Monitor className={cn("h-4 w-4 text-muted-foreground", isAnimating && "text-primary animate-pulse")} />
                    </button>
                  </foreignObject>
                );
              })()}

              {isComplete && completeHeadline && selectedFullPath && (() => {
                const endX = levelXPositions[6];
                const endY = getSelectedPathY(6);
                // Start line after the last word box edge
                const lineStartX = endX + lastWordWidth / 2 + completionLineGap;
                const lineEndX = lineStartX + lineLength;
                const boxX = lineEndX;
                const boxY = endY - completionBoxHeight / 2;

                return (
                  <g aria-label="Completion">
                    <line
                      x1={lineStartX}
                      y1={endY}
                      x2={lineEndX}
                      y2={endY}
                      stroke="hsl(var(--border))"
                      strokeWidth={1}
                      opacity={0.9}
                    />
                    <rect
                      x={boxX}
                      y={boxY}
                      width={completionBoxWidth}
                      height={completionBoxHeight}
                      rx={6}
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--border))"
                    />
                    <text
                      x={boxX + completionBoxPaddingX}
                      y={endY + 4}
                      textAnchor="start"
                      dominantBaseline="middle"
                      className="text-[12px] font-medium"
                      fill="hsl(var(--foreground))"
                    >
                      {completeHeadline}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>

      {/* Word selection panel - below tree */}
      <div className={cn(
        "w-full transition-all duration-500",
        isIntroComplete && !isInteractive && "opacity-40 pointer-events-none"
      )}>
        <div className="bg-card rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-center gap-4">

            {/* LLM Selection Message */}
            {showSelectionMessage && animatedWord && selectedProbability !== null && <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">
                LLM selected "{animatedWord}" — {(selectedProbability * 100).toFixed(0)}%
              </span>
            </div>}

            {currentLevel <= 6 ? <div className="flex items-center gap-3">
            </div> : <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium px-4 py-2 rounded-lg border-2 border-green-400 bg-green-200 text-green-900 whitespace-nowrap">
                  {selectedFullPath ? `European Union ${selectedFullPath.words.slice(1).join(" ")} ${selectedFullPath.headline}` : "Complete!"}
                </p>
              </div>
              {isInteractive && (
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try another path
                </Button>
              )}
            </div>}

            {/* Selected words trail */}
            {isInteractive && currentLevel > 1 && currentLevel <= 6 && <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-medium text-muted-foreground">Selected:</span>
              <div className="flex flex-wrap gap-1.5">
                {selections.slice(0, currentLevel).filter(Boolean).map((word, i) => {
                  const flagConfig = TOKEN_FLAGS[word];
                  const isFlagged = !!flagConfig;
                  const isDestructive = isFlagged && flagConfig.props.severity === 'error';

                  if (isFlagged) {
                    return <TextFlag
                      key={i}
                      text={word === "European Union" ? "EU" : word}
                      {...flagConfig.props}
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium no-underline decoration-0 border-0",
                        isDestructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      )}
                      noUnderline={true}
                    />;
                  }

                  return <span key={i} className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", isDestructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                    {word === "European Union" ? "EU" : word}
                  </span>;
                })}
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
    </div>
    
    {/* Start your own - between headline and diagram */}
    {isIntroComplete && !isInteractive && (
      <div className="absolute left-0 right-0 top-24 flex justify-center animate-fade-in z-10">
        <Button 
          onClick={handleStartOwn}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Start Your Own Headline
        </Button>
      </div>
    )}
  </div>;
}