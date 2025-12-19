import React, { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Monitor, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import TextFlag from "@/components/TextFlag";

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
  
  // Track history of selections - words that were selected before user went back and chose differently
  // Each entry: { level, word, pathPrefix, yPosition (exact position when selected) }
  const [selectionHistory, setSelectionHistory] = useState<Array<{ level: number; word: string; pathPrefix: string[]; yPosition: number }>>([]);

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
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Reset to initial starting state (only root selected)
  const handleReset = () => {
    setUnlockedLevel(1);
    setSelections([treePaths[0].words[0], null, null, null, null, null, null]);
    setSelectionHistory([]);
    setHasUserSelected(false);
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
    const historyToAdd: Array<{ level: number; word: string; pathPrefix: string[]; yPosition: number }> = [];
    for (let i = level; i <= 6; i++) {
      if (newSelections[i]) {
        // Build the path prefix that led to this selection
        const pathPrefix = newSelections.slice(0, i).filter(Boolean) as string[];
        // Calculate the Y position this word was at when selected
        const yPosition = getSelectedYAtLevel(i);
        historyToAdd.push({ level: i, word: newSelections[i]!, pathPrefix, yPosition });
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
  
  // Auto-scroll when unlocked level changes - only after 3rd word selection, show 2 levels at a time
  useEffect(() => {
    if (unlockedLevel > 2 && containerRef.current) {
      // Wait for the new level to render
      requestAnimationFrame(() => {
        // Scroll to show the previous level and current level (2 levels visible)
        const prevLevelEl = levelRefs.current[unlockedLevel - 1];
        if (prevLevelEl && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const levelRect = prevLevelEl.getBoundingClientRect();
          const scrollLeft = containerRef.current.scrollLeft + levelRect.left - containerRect.left - 50;
          containerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      });
    }
  }, [unlockedLevel]);

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

  const nodeHeight = 44;
  const levelGap = 85;
  const containerHeight = 600;

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
  const getOptionsAtLevelWithPrevPath = (level: number): { word: string; probability: number }[] => {
    if (level === 0) return [{ word: "European Union", probability: 1 }];
    
    const pathPrefix: string[] = [treePaths[0].words[0]];
    for (let i = 1; i < level; i++) {
      if (selections[i]) pathPrefix.push(selections[i]!);
      else break;
    }
    
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

    return (
      <div 
        key={level} 
        ref={(el) => { levelRefs.current[level] = el; }}
        className="relative" 
        style={{ height: containerHeight, minWidth: level === 0 ? 140 : 110 }}
      >
        {/* Current active word buttons */}
        {options.map((option, idx) => {
          const isSelected = selections[level] === option.word;
          const isAnimated = animatingLevel === level && animatedWord === option.word;
          const isPulsing = showPulse && animatingLevel === level && animatedWord === option.word;
          
          // Calculate Y position centered around previous selection
          const nodeY = getNodeY(idx, options.length, level > 0 ? prevSelectedY : undefined);
          
          return (
            <div
              key={option.word}
              style={{
                position: 'absolute',
                top: nodeY - nodeHeight / 2,
                left: 0,
                right: 0,
              }}
            >
              {/* Monitor button - above first option at frontier */}
              {level > 0 && isCurrentFrontier && idx === 0 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
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
              
              {/* LLM Selection Message - show above selected word */}
              {showSelectionMessage && isPulsing && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                    Highest: {selectedProbability !== null ? (selectedProbability * 100).toFixed(0) : 0}%
                  </div>
                </div>
              )}
              
              <button
                onClick={() => canSelect && handleWordClick(level, option.word)}
                disabled={!canSelect}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 whitespace-nowrap",
                  level === 0 ? "min-w-[140px]" : "min-w-[100px]",
                  "h-11",
                  level === 0 
                    ? "bg-primary text-primary-foreground border-primary cursor-default"
                    : option.word === "Charter"
                      ? isSelected
                        ? "bg-destructive/30 border-destructive text-destructive shadow-md scale-105 cursor-pointer"
                        : canSelect
                          ? "bg-destructive/10 border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/20 cursor-pointer"
                          : "bg-muted/50 border-muted text-muted-foreground/60 cursor-not-allowed"
                      : isSelected 
                        ? "bg-green-200 border-green-400 text-green-900 shadow-md scale-105 cursor-pointer" 
                        : canSelect
                          ? "bg-card border-border hover:border-primary/50 hover:bg-muted cursor-pointer"
                          : "bg-muted/50 border-muted text-muted-foreground/60 cursor-not-allowed",
                  isAnimated && !isPulsing && "ring-2 ring-primary ring-offset-1 bg-primary/10",
                  isPulsing && "ring-4 ring-primary ring-offset-2 bg-primary text-primary-foreground border-primary shadow-lg scale-110"
                )}
              >
                {option.word === "Charter" && !isPulsing ? (
                  <TextFlag
                    text="Charter"
                    evaluationFactor="factual_accuracy"
                    explanation="The EU AI Act is officially called the 'AI Act' or 'Artificial Intelligence Act', not a 'Charter'. Using 'Charter' is factually inaccurate."
                    severity="error"
                    noUnderline={true}
                  />
                ) : option.word}
                {level > 0 && (
                  <span className={cn(
                    "absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap",
                    isPulsing
                      ? "bg-primary text-primary-foreground"
                      : isSelected 
                        ? "bg-green-200 text-green-800" 
                        : "bg-muted text-muted-foreground"
                  )}>
                    {option.probability.toFixed(2)}
                  </span>
                )}
              </button>
            </div>
          );
        })}

      </div>
    );
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
    
    // Draw clean lines from selected "from" node to "to" options

    return (
      <div key={`conn-${fromLevel}-${toLevel}`} className="flex items-center w-24" style={{ height: containerHeight }}>
        <svg className="w-full h-full" viewBox={`0 0 96 ${containerHeight}`} preserveAspectRatio="none">
          
          {/* Real option lines - varied curves */}
          {toOptions.map((toOpt, toIdx) => {
            // Calculate toY centered around fromY
            const toY = getNodeY(toIdx, toOptions.length, fromY);
            const isSelected = selections[toLevel] === toOpt.word;
            
            // Varied curve control points for organic look
            const curveOffset = ((toIdx * 7) % 5 - 2) * 8;
            const vertOffset = ((toIdx * 3) % 3 - 1) * 6;
            
            return (
              <path
                key={`real-${toOpt.word}`}
                d={`M 0 ${fromY} C ${34 + curveOffset} ${fromY + vertOffset}, ${62 - curveOffset} ${toY - vertOffset}, 96 ${toY}`}
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

  const displayHeadline = buildDisplayHeadline();
  const headline = getCurrentHeadline();

  return (
    <div className={cn("relative", className)}>
      {/* Content wrapper - blurs when intro complete */}
      <div className={cn(
        "transition-all duration-500",
        isIntroComplete && !isInteractive && "opacity-25 blur-sm pointer-events-none"
      )}>
        {/* Current headline display - fixed above scrollable tree */}
        <div className="mb-4 p-4 bg-muted/30 rounded-lg flex items-center justify-between">
          <div className="min-w-0 flex-1">
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
                if (!headline && !isIntroComplete) {
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
              {headline && !isIntroAnimating && hasUserSelected && <span className={cn("px-1 rounded ml-1", isInteractive ? "bg-green-200 text-green-900" : "")}>{headline}</span>}
              {!headline && displayHeadline && !isIntroAnimating && hasUserSelected && <span className="text-muted-foreground/50">...</span>}
            </p>
          </div>
          {/* Reset button - only show when interactive */}
          {isInteractive && unlockedLevel > 1 && (
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
        
        {/* Scrollable tree container */}
        <div 
          ref={containerRef} 
          className="overflow-x-auto scroll-smooth"
        >
          <div className="min-w-[1600px] p-6 pr-[320px]">
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
                      const y = getSelectedYAtLevel(6);
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
                <div className="relative" style={{ height: containerHeight, minWidth: 280 }}>
                  <div 
                    className="absolute bg-muted/30 rounded-lg p-4 animate-fade-in w-[260px]"
                    style={{ 
                      top: Math.max(20, getSelectedYAtLevel(6) - nodeHeight / 2),
                      left: 16 
                    }}
                  >
                    <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">Completion:</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      ...{headline}
                    </p>
                  </div>
                </div>
              </>
            )}
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
    </div>
  );
}
