import React, { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw, Monitor, ZoomIn, ZoomOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TextFlag from "@/components/TextFlag";

/**
 * FullBranchDiagram - Shows all branches with words flowing along the selected path.
 * Progressive word selection at bottom with probabilities for both options.
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

// All 64 paths data
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

// Word options at each level with probabilities
const levelOptions: {
  word: string;
  prob: number;
}[][] = [[{
  word: "European Union",
  prob: 1.0
}], [{
  word: "Unites",
  prob: 0.34
}, {
  word: "Reaches",
  prob: 0.42
}], [{
  word: "On",
  prob: 0.40
}, {
  word: "Around",
  prob: 0.30
}], [{
  word: "Historic",
  prob: 0.44
}, {
  word: "Sweeping",
  prob: 0.38
}], [{
  word: "AI",
  prob: 0.52
}, {
  word: "Technology",
  prob: 0.30
}], [{
  word: "Ethics",
  prob: 0.64
}, {
  word: "Governance",
  prob: 0.22
}], [{
  word: "Framework",
  prob: 0.50
}, {
  word: "Charter",
  prob: 0.40
}]];
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
  const [selections, setSelections] = useState<string[]>(["European Union"]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedWord, setAnimatedWord] = useState<string | null>(null);
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);
  const [selectedProbability, setSelectedProbability] = useState<number | null>(null);
  const [closeUpView, setCloseUpView] = useState(false);
  const hasAutoSelected = useRef(false);

  // Auto-select first word on mount to demonstrate the feature
  useEffect(() => {
    if (!hasAutoSelected.current && currentLevel === 1) {
      hasAutoSelected.current = true;
      // Small delay to let users see the initial state first
      const timer = setTimeout(() => {
        playAnimation();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Get matching paths for current selections
  const matchingPaths = useMemo(() => {
    return treePaths.filter(p => selections.every((word, i) => p.words[i] === word));
  }, [selections]);

  // Get the first matching complete path (for display)
  const selectedFullPath = useMemo(() => {
    if (selections.length === 7) {
      return treePaths.find(p => p.words.every((w, i) => w === selections[i]));
    }
    return matchingPaths[0];
  }, [selections, matchingPaths]);

  // Build headline element
  const buildHeadline = (): React.ReactNode => {
    const renderWords = (words: string[]) => (
      words.map((word, i) => {
        const flagConfig = TOKEN_FLAGS[word];
        const suffix = i < words.length - 1 ? " " : "";
        if (flagConfig) {
          return (
            <React.Fragment key={i}>
              <TextFlag text={word} {...flagConfig.props} className="no-underline" />
              {suffix}
            </React.Fragment>
          );
        }
        return <span key={i}>{word}{suffix}</span>;
      })
    );

    if (selections.length === 7 && selectedFullPath) {
      return (
        <>
          {renderWords(selections)}
          <span className="text-primary">, {selectedFullPath.headline}</span>
        </>
      );
    }
    return (
      <>
        {renderWords(selections)}
        <span className="text-muted-foreground/50">...</span>
      </>
    );
  };

  // Handle word selection - progressive reveal
  const handleWordSelect = (word: string) => {
    const newSelections = [...selections, word];
    setSelections(newSelections);
    setCurrentLevel(currentLevel + 1);
    onPathChange(newSelections);
  };

  // Reset to start
  const handleReset = () => {
    setSelections(["European Union"]);
    setCurrentLevel(1);
    onPathChange(["European Union"]);
  };

  // Play computer selection animation
  const playAnimation = () => {
    if (isAnimating || currentLevel > 6) return;
    setIsAnimating(true);
    setShowSelectionMessage(false);
    const options = levelOptions[currentLevel];
    let cycleIndex = 0;
    const cycleCount = 8;
    const interval = setInterval(() => {
      setAnimatedWord(options[cycleIndex % options.length].word);
      cycleIndex++;
      if (cycleIndex >= cycleCount) {
        clearInterval(interval);
        // Select highest probability option
        const highestProb = options.reduce((a, b) => a.prob > b.prob ? a : b);
        setAnimatedWord(highestProb.word);
        setSelectedProbability(highestProb.prob);
        setShowSelectionMessage(true);
        setTimeout(() => {
          handleWordSelect(highestProb.word);
          setAnimatedWord(null);
          setShowSelectionMessage(false);
          setSelectedProbability(null);
          setIsAnimating(false);
        }, 2500);
      }
    }, 150);
  };

  // Calculate Y position for a path based on its word choices
  const getPathY = (path: TreePath, level: number): number => {
    const height = 280;
    const centerY = height / 2;
    let y = centerY;
    let spread = height / 4;
    for (let l = 1; l <= Math.min(level, 6); l++) {
      const wordIndex = levelOptions[l].findIndex(o => o.word === path.words[l]);
      y += wordIndex === 0 ? -spread : spread;
      spread /= 2;
    }
    return y;
  };

  // Check if a path matches current selections up to current level
  const pathMatchesSelections = (path: TreePath): boolean => {
    return selections.every((word, i) => path.words[i] === word);
  };

  // Get X position for a level - different spacing for close-up view
  const getLevelX = (level: number): number => {
    if (closeUpView) {
      return 80 + level * 160; // More spacing in close-up
    }
    return 50 + level * 110;
  };

  // Scroll container ref for auto-scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when selections advance - always in close-up, after 3rd in normal
  useEffect(() => {
    if (scrollContainerRef.current) {
      if (closeUpView && selections.length > 1) {
        // In close-up, keep current word centered with 3 words visible
        const scrollX = Math.max(0, (selections.length - 2) * 160);
        scrollContainerRef.current.scrollTo({
          left: scrollX,
          behavior: 'smooth'
        });
      } else if (selections.length > 3) {
        const scrollX = Math.max(0, (selections.length - 2) * 110);
        scrollContainerRef.current.scrollTo({
          left: scrollX,
          behavior: 'smooth'
        });
      }
    }
  }, [selections.length, closeUpView]);

  // SVG dimensions based on view mode
  const svgWidth = closeUpView ? 1500 : 1050;
  const svgHeight = closeUpView ? 200 : 350;

  // Calculate which levels to show in close-up view (3 words visible)
  const getVisibleLevels = (): {
    start: number;
    end: number;
  } => {
    if (!closeUpView) return {
      start: 0,
      end: 7
    };
    const currentSelectionLevel = selections.length - 1;
    const start = Math.max(0, currentSelectionLevel - 1);
    const end = Math.min(7, start + 3);
    return {
      start,
      end
    };
  };
  const visibleLevels = getVisibleLevels();

  // Get X position adjusted for close-up viewport
  const getCloseUpX = (level: number): number => {
    if (closeUpView) {
      const offset = visibleLevels.start;
      return 120 + (level - offset) * 200;
    }
    return getLevelX(level);
  };
  return <div className={cn("relative", className)}>
    {/* Current headline display */}
    <div className="mb-4 p-4 bg-muted/30 rounded-lg flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Current Headline:</p>
        <p className="text-lg font-medium text-foreground">
          {buildHeadline()}
        </p>
      </div>
      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
        {/* Close-up view toggle */}
        <div className="flex items-center gap-2">
          <Switch id="closeup-view" checked={closeUpView} onCheckedChange={setCloseUpView} />
          <Label htmlFor="closeup-view" className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer">
            {closeUpView ? <ZoomIn className="h-3 w-3" /> : <ZoomOut className="h-3 w-3" />}
            Close-up
          </Label>
        </div>
        {currentLevel > 1 && <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs gap-1.5">
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>}
      </div>
    </div>

    {/* Branch visualization */}
    <div ref={scrollContainerRef} className="overflow-x-auto bg-card rounded-xl">
      <div className={cn("p-4", closeUpView ? "min-w-[700px]" : "min-w-[1050px]")}>
        <svg className={cn("w-full", closeUpView ? "h-[200px]" : "h-[350px]")} viewBox={closeUpView ? `0 0 700 200` : `0 0 ${svgWidth} 350`} preserveAspectRatio="xMidYMid meet">
          {closeUpView ? <>
            {/* Close-up view: Show all branches but zoomed in on 3 words */}
            {/* Draw all branch paths */}
            {treePaths.map((path, pathIndex) => {
              const isSelected = pathMatchesSelections(path);
              let d = `M ${getCloseUpX(0)} 100`;
              for (let level = 1; level <= 6; level++) {
                if (level < visibleLevels.start || level > visibleLevels.end + 1) continue;
                const x = getCloseUpX(level);
                const baseY = 100;
                let offset = 0;
                let spread = 60;
                for (let l = 1; l <= Math.min(level, 6); l++) {
                  const wordIndex = levelOptions[l].findIndex(o => o.word === path.words[l]);
                  offset += wordIndex === 0 ? -spread : spread;
                  spread /= 2;
                }
                const y = baseY + offset / 4;
                d += ` L ${x} ${y}`;
              }
              return <path key={pathIndex} d={d} fill="none" stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} strokeWidth={isSelected ? 1.5 : 0.75} strokeOpacity={isSelected ? 1 : 0.15} className="transition-all duration-300" />;
            })}

            {/* Words along the visible portion */}
            {selections.map((word, level) => {
              if (level < visibleLevels.start || level > visibleLevels.end) return null;
              const x = getCloseUpX(level);
              const y = 100;
              const probability = selectedFullPath?.probabilities[level] || levelOptions[level]?.[0]?.prob || 1;
              const isClickable = level > 0;
              const handleWordClick = () => {
                if (!isClickable) return;
                const newSelections = selections.slice(0, level);
                setSelections(newSelections);
                setCurrentLevel(level);
                onPathChange(newSelections);
              };
              const wordWidth = Math.max(100, word.length * 10 + 24);

              const flagConfig = TOKEN_FLAGS[word];
              const isFlagged = !!flagConfig;
              const isDestructive = isFlagged && flagConfig.props.severity === 'error';

              return <g key={`word-${level}`} onClick={handleWordClick} className={cn(isClickable && "cursor-pointer")} style={{
                pointerEvents: isClickable ? 'all' : 'none'
              }}>
                {/* Probability label above word */}
                {level > 0 && (
                  <text x={x} y={y - 24} textAnchor="middle" className="text-[10px] font-medium fill-muted-foreground pointer-events-none select-none">
                    {(probability * 100).toFixed(0)}%
                  </text>
                )}
                <rect x={x - wordWidth / 2} y={y - 18} width={wordWidth} height={36} rx={6} fill={isDestructive ? "hsl(var(--destructive))" : "hsl(var(--primary))"} className={cn("drop-shadow-md transition-all duration-200", isClickable && !isDestructive && "hover:fill-[hsl(var(--primary)/0.8)]", isClickable && isDestructive && "hover:fill-[hsl(var(--destructive)/0.8)]")} />
                <text x={x} y={y + 5} textAnchor="middle" className="text-sm font-medium fill-primary-foreground pointer-events-none select-none">
                  {word}
                </text>
              </g>;
            })}

            {/* Arrows indicating more content */}
            {visibleLevels.start > 0 && <text x={20} y={105} className="text-lg fill-muted-foreground">←</text>}
            {(visibleLevels.end < selections.length - 1 || currentLevel <= 6) && <text x={670} y={105} className="text-lg fill-muted-foreground">→</text>}

            {/* Completion text in close-up - positioned after the last word */}
            {selections.length === 7 && selectedFullPath && visibleLevels.end >= 6 && <text x={getCloseUpX(6) + 100} y={105} textAnchor="start" className="text-xs font-medium fill-primary pointer-events-none select-none">
              {selectedFullPath.headline}
            </text>}
          </> : <>
            {/* Normal view: Full tree with all branches (truncate at current choice so lines never pass behind buttons) */}
            {treePaths.map((path, pathIndex) => {
              const isSelected = pathMatchesSelections(path);
              const maxLevel = Math.min(6, currentLevel);
              let d = `M 50 150`;

              for (let level = 1; level <= maxLevel; level++) {
                const x = getLevelX(level);
                const y = getPathY(path, level);
                const stopBeforeButtons = currentLevel <= 6 && level === currentLevel;
                const adjustedX = stopBeforeButtons ? x - 70 : x;
                d += ` L ${adjustedX} ${y}`;
              }

              return (
                <path
                  key={pathIndex}
                  d={d}
                  fill="none"
                  stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  strokeWidth={isSelected ? 1.5 : 0.75}
                  strokeOpacity={isSelected ? 1 : 0.15}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Words along the selected path */}
            {selectedFullPath && selections.map((word, level) => {
              const x = getLevelX(level);
              const y = getPathY(selectedFullPath, level);
              const isClickable = level > 0;
              const probability = selectedFullPath.probabilities[level];
              const handleWordClick = () => {
                if (!isClickable) return;
                const newSelections = selections.slice(0, level);
                setSelections(newSelections);
                setCurrentLevel(level);
                onPathChange(newSelections);
              };
              const wordWidth = Math.max(80, word.length * 8 + 16);

              const flagConfig = TOKEN_FLAGS[word];
              const isFlagged = !!flagConfig;
              const isDestructive = isFlagged && flagConfig.props.severity === 'error';

              return <g key={`word-${level}`} onClick={handleWordClick} className={cn(isClickable && "cursor-pointer")} style={{
                pointerEvents: isClickable ? 'all' : 'none'
              }}>
                {/* Probability label above word */}
                {level > 0 && (
                  <text x={x} y={y - 24} textAnchor="middle" className="text-[10px] font-medium fill-muted-foreground pointer-events-none select-none">
                    {(probability * 100).toFixed(0)}%
                  </text>
                )}
                <rect x={x - wordWidth / 2} y={y - 12} width={wordWidth} height={24} rx={4} fill={isDestructive ? "hsl(var(--destructive))" : "hsl(var(--primary))"} className={cn("drop-shadow-sm transition-all duration-200", isClickable && !isDestructive && "hover:fill-[hsl(var(--primary)/0.8)]", isClickable && isDestructive && "hover:fill-[hsl(var(--destructive)/0.8)]")} />
                <text x={x} y={y + 4} textAnchor="middle" className="text-[10px] font-medium fill-primary-foreground pointer-events-none select-none">
                  {word}
                </text>
              </g>;
            })}

            {/* Connecting line to completion and completion text */}
            {selections.length === 7 && selectedFullPath && <g>
              {/* Connecting line from last word to completion */}
              <path
                d={`M ${getLevelX(6) + 40} ${getPathY(selectedFullPath, 6)} L ${getLevelX(6) + 60} ${getPathY(selectedFullPath, 6)}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                className="transition-all duration-300"
              />
              <rect
                x={getLevelX(6) + 65}
                y={getPathY(selectedFullPath, 6) - 14}
                width={Math.min(selectedFullPath.headline.length * 7, 280)}
                height={28}
                rx={6}
                fill="hsl(var(--primary))"
                className="drop-shadow-md"
              />
              <text x={getLevelX(6) + 73} y={getPathY(selectedFullPath, 6) + 5} textAnchor="start" className="text-[13px] font-semibold fill-primary-foreground pointer-events-none select-none">
                {selectedFullPath.headline}
              </text>
            </g>}

            {/* Word selection controls at branch intersections */}
            {currentLevel <= 6 && (() => {
              // Calculate intersection Y position based on parent word's position
              const parentYRaw = selectedFullPath ? getPathY(selectedFullPath, currentLevel - 1) : 150;

              // Spread at this depth (matches getPathY)
              let spread = 280 / 4;
              for (let l = 1; l < currentLevel; l++) {
                spread /= 2;
              }

              // Ensure the two option buttons never overlap
              const optionOffset = Math.max(spread, 70);

              // Clamp so controls stay inside the SVG
              const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
              const pad = 28;
              const parentY = clamp(parentYRaw, pad + optionOffset, svgHeight - pad - optionOffset);

              const topY = parentY - optionOffset;
              const bottomY = parentY + optionOffset;
              const intersectionX = getLevelX(currentLevel);

              return (
                <>
                  {/* Auto button at the parent position (with occluder so no lines show behind) */}
                  <g>
                    <rect
                      x={intersectionX - 52}
                      y={parentY - 38}
                      width={104}
                      height={30}
                      rx={8}
                      fill="hsl(var(--background))"
                    />
                    <foreignObject x={intersectionX - 45} y={parentY - 35} width={90} height={25}>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={playAnimation}
                          disabled={isAnimating}
                          className="h-5 gap-1 text-[9px] px-2"
                          title="Watch computer select"
                        >
                          <Monitor
                            className={cn(
                              "h-2.5 w-2.5",
                              isAnimating ? "text-primary animate-pulse" : "text-muted-foreground"
                            )}
                          />
                          Auto
                        </Button>
                      </div>
                    </foreignObject>
                  </g>

                  {/* LLM Selection Message (with occluder) */}
                  {showSelectionMessage && animatedWord && selectedProbability !== null && (
                    <g>
                      <rect
                        x={intersectionX - 66}
                        y={parentY + 18}
                        width={132}
                        height={34}
                        rx={10}
                        fill="hsl(var(--background))"
                      />
                      <foreignObject x={intersectionX - 60} y={parentY + 20} width={120} height={30}>
                        <div className="flex items-center justify-center gap-1 py-1 px-2 bg-primary/10 border border-primary/30 rounded-md animate-fade-in">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[9px] font-medium text-primary">
                            "{animatedWord}" ({(selectedProbability * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </foreignObject>
                    </g>
                  )}

                  {/* Word options at branch intersection points (occluded background) */}
                  {!showSelectionMessage &&
                    levelOptions[currentLevel].map((option, idx) => {
                      const isAnimated = animatedWord === option.word;
                      const flagConfig = TOKEN_FLAGS[option.word];
                      const isFlagged = !!flagConfig;
                      const isDestructive = isFlagged && flagConfig.props.severity === "error";
                      const optionY = idx === 0 ? topY : bottomY;

                      return (
                        <g key={option.word}>
                          <rect
                            x={intersectionX - 56}
                            y={optionY - 26}
                            width={112}
                            height={56}
                            rx={12}
                            fill="hsl(var(--background))"
                          />
                          <foreignObject x={intersectionX - 50} y={optionY - 20} width={100} height={44}>
                            <div className="flex justify-center">
                              <Button
                                variant="outline"
                                onClick={() => handleWordSelect(option.word)}
                                disabled={isAnimating}
                                className={cn(
                                  "h-10 min-w-[80px] flex flex-col gap-0 px-3 text-xs transition-all duration-200",
                                  isDestructive &&
                                    "border-destructive bg-destructive/10 hover:bg-destructive/20 text-destructive",
                                  isAnimated &&
                                    "ring-2 ring-primary ring-offset-1 animate-pulse bg-primary/10"
                                )}
                              >
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    isDestructive && "text-destructive"
                                  )}
                                >
                                  {isFlagged ? (
                                    <TextFlag
                                      text={option.word}
                                      {...flagConfig.props}
                                      className="no-underline decoration-0"
                                      noUnderline={true}
                                    />
                                  ) : (
                                    option.word
                                  )}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {(option.prob * 100).toFixed(0)}%
                                </span>
                              </Button>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                </>
              );
            })()}

            {/* Completion controls positioned near the completion text */}
            {currentLevel > 6 && selectedFullPath && (
              <foreignObject x={getLevelX(6) + 65} y={getPathY(selectedFullPath, 6) + 20} width={150} height={40}>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset} className="h-6 gap-1 text-[10px]">
                    <RotateCcw className="h-2.5 w-2.5" />
                    Start Over
                  </Button>
                </div>
              </foreignObject>
            )}
          </>}
        </svg>
      </div>
    </div>
  </div>;
}