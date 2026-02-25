import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ChatPrompt from "@/components/ChatPrompt";
import { PopoverSeries } from "@/components/PopoverSeries";
import TextFlag from "@/components/TextFlag";
import ModuleNavigation from "@/components/ModuleNavigation";
import GuidanceTooltip from "@/components/GuidanceTooltip";
import { BranchDiagram } from "@/components/BranchDiagram";
import { TreeDiagram } from "@/components/TreeDiagram";
import { FullBranchDiagram } from "@/components/FullBranchDiagram";
import FeatureHighlight from "@/components/FeatureHighlight";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Info, InfoIcon, Monitor, GitBranch, Network, List } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/contexts/LanguageContext";
export default function HeadlineResponse() {
  const navigate = useNavigate();
  const {
    t
  } = useLanguage();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [currentSentence, setCurrentSentence] = useState(["European", "Union"]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipShown, setTooltipShown] = useState(false);
  const [showFactualInaccuracyTooltip, setShowFactualInaccuracyTooltip] = useState(false);
  const [factualTooltipShown, setFactualTooltipShown] = useState(false);
  const [showCharterTooltip, setShowCharterTooltip] = useState(false);
  const [charterTooltipShown, setCharterTooltipShown] = useState(false);
  const [showIntroPopover, setShowIntroPopover] = useState(true);
  const [secondProbTooltipOpen, setSecondProbTooltipOpen] = useState(false);
  const [thirdProbTooltipOpen, setThirdProbTooltipOpen] = useState(false);
  const [dropdownProbTooltips, setDropdownProbTooltips] = useState<{
    [key: string]: boolean;
  }>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedWord, setAnimatedWord] = useState<string | null>(null);
  const [showHighlightPulse, setShowHighlightPulse] = useState(false);
  const [isAnimatingThird, setIsAnimatingThird] = useState(false);
  const [animatedThirdWord, setAnimatedThirdWord] = useState<string | null>(null);
  const [showHighlightPulseThird, setShowHighlightPulseThird] = useState(false);
  const [viewMode, setViewMode] = useState<"dropdown" | "tree" | "branch" | "full">("tree");
  const [evaluationPanelOpen, setEvaluationPanelOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [highlightStep, setHighlightStep] = useState<0 | 1 | 2>(1);

  // Reset everything when component mounts (user navigates to page)
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);

    setSelectedWord(null);
    setCurrentSentence(["European", "Union"]);
    setShowTooltip(false);
    setTooltipShown(false);
    setShowFactualInaccuracyTooltip(false);
    setFactualTooltipShown(false);
    setShowCharterTooltip(false);
    setCharterTooltipShown(false);
    setShowIntroPopover(true);
    setSecondProbTooltipOpen(false);
    setThirdProbTooltipOpen(false);
    setDropdownProbTooltips({});
    setIsAnimating(false);
    setAnimatedWord(null);
    setShowHighlightPulse(false);
    setIsAnimatingThird(false);
    setAnimatedThirdWord(null);
    setShowHighlightPulseThird(false);
    setViewMode("tree");
    setHighlightStep(1);
    setEvaluationPanelOpen(false);
    setHasInteracted(false);
  }, []);

  // When entering animated diagram modes, reset evaluation gating
  useEffect(() => {
    if (viewMode === "tree" || viewMode === "branch") {
      setEvaluationPanelOpen(false);
      setHasInteracted(false);
    }
  }, [viewMode]);

  // Watch for "Charter" word specifically in the sentence to expand evaluation panel
  // Only trigger after user has interacted (not during intro animation)
  useEffect(() => {
    if (!hasInteracted) return;

    const hasCharter = currentSentence.some(word => {
      if (!word) return false;
      const cleanWord = word.toLowerCase().replace(/[,.]$/g, '');
      return cleanWord === "charter";
    });
    if (hasCharter) {
      setEvaluationPanelOpen(true);
    }
  }, [currentSentence, hasInteracted]);

  const toggleDropdownTooltip = (key: string, value: boolean) => {
    setDropdownProbTooltips(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Animation to show LLM selecting highest probability word
  const playSelectionAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const options = ["Finalizes", "Reaches", "Unites"];
    let currentIndex = 0;
    const cycleCount = 8; // Number of cycles before landing
    let cycles = 0;

    const interval = setInterval(() => {
      setAnimatedWord(options[currentIndex % options.length]);
      currentIndex++;
      cycles++;

      if (cycles >= cycleCount) {
        clearInterval(interval);
        // Land on "Unites" (highest probability 0.67)
        setAnimatedWord("Unites");
        setShowHighlightPulse(true);

        // Reset after animation completes
        setTimeout(() => {
          setShowHighlightPulse(false);
          setAnimatedWord(null);
          setIsAnimating(false);
        }, 2000);
      }
    }, 200);
  };

  // Animation for third word selection
  const playThirdWordAnimation = () => {
    if (isAnimatingThird) return;
    setIsAnimatingThird(true);

    // Get options based on current second word
    const secondWord = currentSentence[2];
    let options: string[] = [];
    if (secondWord === "Unites") {
      options = ["Behind", "Around", "On"];
    } else if (secondWord === "Reaches") {
      options = ["Milestone", "Agreement", "Consensus"];
    } else if (secondWord === "Finalizes") {
      options = ["Pioneering", "Sweeping", "Landmark"];
    }

    let currentIndex = 0;
    const cycleCount = 8;
    let cycles = 0;

    const interval = setInterval(() => {
      setAnimatedThirdWord(options[currentIndex % options.length]);
      currentIndex++;
      cycles++;

      if (cycles >= cycleCount) {
        clearInterval(interval);
        // Land on highest probability word
        setAnimatedThirdWord(options[options.length - 1]);
        setShowHighlightPulseThird(true);

        setTimeout(() => {
          setShowHighlightPulseThird(false);
          setAnimatedThirdWord(null);
          setIsAnimatingThird(false);
        }, 2000);
      }
    }, 200);
  };
  const getWordOptions = (position: 'second' | 'third', currentIndex?: number) => {
    let options: {
      word: string;
      probability: string;
    }[] = [];
    if (position === 'second') {
      options = [{
        word: "Unites",
        probability: "0.67"
      }, {
        word: "Reaches",
        probability: "0.24"
      }, {
        word: "Finalizes",
        probability: "0.09"
      }];
    } else {
      // third position
      const secondWord = currentSentence[2];
      if (secondWord === "Unites") {
        options = [{
          word: "On",
          probability: "0.73"
        }, {
          word: "Around",
          probability: "0.42"
        }, {
          word: "Behind",
          probability: "0.12"
        }];
      } else if (secondWord === "Reaches") {
        options = [{
          word: "Consensus",
          probability: "0.65"
        }, {
          word: "Agreement",
          probability: "0.28"
        }, {
          word: "Milestone",
          probability: "0.07"
        }];
      } else if (secondWord.toLowerCase() === "finalizes") {
        options = [{
          word: "Landmark",
          probability: "0.58"
        }, {
          word: "Sweeping",
          probability: "0.31"
        }, {
          word: "Pioneering",
          probability: "0.11"
        }];
      }
    }

    // Filter out only the currently selected word from its own dropdown
    if (currentIndex !== undefined) {
      const currentWord = currentSentence[currentIndex];
      return options.filter(option => option.word.toLowerCase() !== currentWord.toLowerCase().replace(/[,.]/g, ''));
    }
    return options;
  };

  // Function to handle word selection and update sentence
  const handleWordSelection = (newWord: string, position: number) => {
    const newSentence = [...currentSentence];
    newSentence[position] = newWord;

    // Update the rest of the sentence based on the selection
    if (position === 2) {
      // Second column selection
      // Handle specific sentence switches for Reaches and Finalizes
      if (newWord === "Reaches") {
        setCurrentSentence(["European", "Union", "Reaches", "Consensus", "on", "Historic", "AI", "Ethics", "Framework,", "Paving", "the", "Way", "for", "Responsible", "Tech", "Innovation"]);
        return;
      } else if (newWord === "Finalizes") {
        setCurrentSentence(["European", "Union", "Finalizes", "Landmark", "AI", "Ethics", "Agreement,", "Setting", "Global", "Benchmark", "For", "Safe", "Technology", "Development"]);
        return;
      } else {
        // Reset third position and beyond for Unites
        const baseWords = ["European", "Union", newWord];
        // IMPORTANT: compute third options based on the newly selected second word (not the old sentence)
        const thirdOptions = newWord === "Unites" ? [{
          word: "On",
          probability: "0.73"
        }, {
          word: "Around",
          probability: "0.42"
        }, {
          word: "Behind",
          probability: "0.12"
        }] : getWordOptions('third', 3);
        if (thirdOptions.length > 0) {
          baseWords.push(thirdOptions[0].word); // Default to first option
        }

        // Get the completion for this path
        const pathKey = baseWords.slice(0, 3).join(" ");
        const progressionData = wordProgressions[pathKey as keyof typeof wordProgressions];
        if (progressionData && thirdOptions.length > 0) {
          const thirdWord = thirdOptions[0].word;
          const completion = progressionData[thirdWord.toLowerCase() as keyof typeof progressionData] as string;
          if (completion) {
            const completionWords = completion.split(" ");
            setCurrentSentence([...baseWords, ...completionWords]);
          }
        }
      }
    } else if (position === 3) {
      // Third column selection
      const pathKey = currentSentence.slice(0, 3).join(" ");
      const progressionData = wordProgressions[pathKey as keyof typeof wordProgressions];
      if (progressionData) {
        const completion = progressionData[newWord.toLowerCase() as keyof typeof progressionData] as string;
        if (completion) {
          const completionWords = completion.split(" ");
          setCurrentSentence(["European", "Union", currentSentence[2], newWord, ...completionWords]);
        }
      }
    }

    // Show factual inaccuracy tooltip for specific combinations
    if (currentSentence[2] === "Unites" && newWord === "Behind" || newWord === "Unites" && currentSentence[3] === "Behind") {
      setShowFactualInaccuracyTooltip(true);
    }
  };

  // Word progression data from the table
  const wordProgressions = {
    "European Union Unites": {
      "on": "Historic AI Ethics Framework, Charting Path for Responsible Technology Development",
      "around": "Sweeping AI Ethics Charter, Pioneering International Tech Policy Standards",
      "behind": "Historic AI Ethics Framework, Setting Standards for Responsible Innovation"
    },
    "European Union Reaches": {
      "consensus": "on Historic AI Ethics Framework, Paving the Way for Responsible Tech Innovation",
      "agreement": "on Historic AI Ethics Framework, Laying Groundwork for Safe Tech Development",
      "milestone": "in AI Ethics, Advancing a Unified Vision for Responsible Innovation"
    },
    "European Union Finalizes": {
      "landmark": "AI Ethics Agreement, Setting Global Benchmark for Safe Technology Development",
      "sweeping": "AI Ethics Agreement, Establishing New Norms for Responsible Tech",
      "pioneering": "AI Ethics Framework, Guiding the Future of Safe Innovation"
    }
  };
  const getNextWords = (currentPath: string[]) => {
    // For Union position (index 1)
    if (currentPath.length === 2 && currentPath[0] === "European" && currentPath[1] === "Union") {
      return [{
        word: "Unites",
        nextWords: ["on", "Around", "Behind"]
      }, {
        word: "Reaches",
        nextWords: ["Consensus", "Agreement", "Milestone"]
      }, {
        word: "Finalizes",
        nextWords: ["landmark", "sweeping", "pioneering"]
      }];
    }
    const pathKey = currentPath.slice(0, 3).join(" ");
    const progressionData = wordProgressions[pathKey as keyof typeof wordProgressions];
    if (progressionData && currentPath.length === 3) {
      return Object.keys(progressionData).map(key => ({
        word: key.charAt(0).toUpperCase() + key.slice(1),
        completion: progressionData[key as keyof typeof progressionData]
      }));
    }

    // For second level (after selecting first word)
    if (currentPath.length === 4) {
      const secondLevelKey = currentPath.slice(0, 3).join(" ");
      const progressionData = wordProgressions[secondLevelKey as keyof typeof wordProgressions];
      if (progressionData) {
        const selectedThirdWord = currentPath[3];
        return [{
          word: selectedThirdWord,
          completion: progressionData[selectedThirdWord as keyof typeof progressionData]
        }];
      }
    }
    return [];
  };
  // Define popover steps for word interaction tour
  const popoverSteps = [{
    id: "word-union",
    trigger: "[data-word-union]",
    content: <div className="space-y-2">
      <h3 className="font-semibold text-sm">{t('nextWord.response.interactiveTitle')}</h3>
      <p className="text-sm leading-relaxed">
        {t('nextWord.response.interactiveDesc')}
      </p>
    </div>
  }];

  return <div className="min-h-screen bg-background overflow-x-hidden">
    <Header />


    <main className="container mx-auto px-6 py-3 max-w-7xl">
      <div className="mb-3">
        <Breadcrumb />
      </div>

      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto">
            {/* Original Prompt */}
            <div className="mb-8">
              <ChatPrompt text="Write a headline for a long form journalistic article about ai ethics agreement reached across the eu" fileName="EU_AI_Act.pdf" />
            </div>

            {/* AI Response */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-body-1">
                  Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:
                </p>

                {/* View Toggle Group */}
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => value && setViewMode(value as typeof viewMode)}
                  className="ml-4 shrink-0"
                >
                  {/* Hidden views - kept for future use:
                  <ToggleGroupItem value="dropdown" aria-label="Dropdown View" className="gap-1.5 text-xs">
                    <List className="h-3.5 w-3.5" />
                    Dropdown
                  </ToggleGroupItem>
                  */}
                  <ToggleGroupItem value="tree" aria-label="Branch View" className="gap-1.5 text-xs">
                    <GitBranch className="h-3.5 w-3.5" />
                    Branch
                  </ToggleGroupItem>
                  <ToggleGroupItem value="branch" aria-label="Tree View" className="gap-1.5 text-xs">
                    <GitBranch className="h-3.5 w-3.5 rotate-90" />
                    Tree
                  </ToggleGroupItem>
                  {/* Hidden views - kept for future use:
                  <ToggleGroupItem value="full" aria-label="Full Branch View" className="gap-1.5 text-xs">
                    <Network className="h-3.5 w-3.5" />
                    Branch
                  </ToggleGroupItem>
                  */}
                </ToggleGroup>
              </div>

              {viewMode === "tree" ? (
                <BranchDiagram
                  selectedPath={currentSentence}
                  onPathChange={(path) => {
                    // Update sentence with the path - this can trigger Charter detection
                    setCurrentSentence(path);
                    if (path.length > 1) setHasInteracted(true);
                  }}
                />
              ) : viewMode === "full" ? (
                <FullBranchDiagram
                  selectedPath={currentSentence}
                  onPathChange={(path) => {
                    setCurrentSentence(path);
                    if (path.length > 1) setHasInteracted(true);
                  }}
                />
              ) : viewMode === "branch" ? (
                <TreeDiagram
                  selectedPath={currentSentence}
                  onPathChange={(path) => {
                    setCurrentSentence(path);
                    if (path.length > 1) setHasInteracted(true);
                  }}
                />
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <h1 className="text-2xl text-foreground leading-loose font-normal md:text-4xl" style={{
                      wordSpacing: '0.2em',
                      lineHeight: '1.8'
                    }}>
                      {currentSentence.map((word, index) => {
                        // Skip index 3 as it's included in the wrapper at index 2
                        if (index === 3) return null;

                        // Handle dropdown for second position (Unites/Reaches/Finalizes/finalizes) and wrap with third
                        if (index === 2 && (word === "Unites" || word === "Reaches" || word === "Finalizes" || word === "finalizes")) {
                          const options = getWordOptions('second', index);
                          const rawOptions = getWordOptions('second');
                          const thirdWord = currentSentence[3];
                          const rawOptionsThird = getWordOptions('third');
                          const optionsThird = getWordOptions('third', 3);
                          const isValidThirdWord = rawOptionsThird.some(opt => opt.word === thirdWord);

                          const displayWord = animatedWord || word;
                          const isHighlighted = showHighlightPulse && animatedWord === "Unites";

                          const dropdown1 = <span key={2} className="inline-flex items-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button data-word-union data-word={word.toLowerCase()} className={`relative group cursor-pointer transition-all duration-200 px-1 rounded-lg inline-flex items-center gap-1 ${isHighlighted
                                  ? "bg-primary text-primary-foreground animate-pulse ring-4 ring-primary/50"
                                  : isAnimating && animatedWord
                                    ? "bg-yellow-200"
                                    : "bg-green-200 hover:bg-green-300"
                                  }`}>
                                  {displayWord}
                                  <ChevronDown className="h-3 w-3" />
                                  <span className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 rounded transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${isHighlighted
                                    ? "bg-primary text-primary-foreground scale-110"
                                    : "bg-green-200 text-green-800"
                                    }`} style={{
                                      pointerEvents: 'auto'
                                    }}>
                                    {!isHighlighted && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          playSelectionAnimation();
                                        }}
                                        disabled={isAnimating}
                                        className={`p-0.5 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-all disabled:opacity-50 ${isAnimating ? 'animate-spin' : ''
                                          }`}
                                        title="Watch LLM select word"
                                      >
                                        <Monitor className="h-3 w-3" />
                                      </button>
                                    )}
                                    {isHighlighted ? "0.67 ✓ Highest!" : (rawOptions.find(opt => opt.word === word)?.probability || rawOptions[0]?.probability || "0.67")}
                                    {!isHighlighted && (
                                      <TooltipProvider>
                                        <Tooltip open={secondProbTooltipOpen} onOpenChange={setSecondProbTooltipOpen}>
                                          <TooltipTrigger asChild>
                                            <Info className="h-3 w-3 cursor-pointer" onClick={e => {
                                              e.stopPropagation();
                                              setSecondProbTooltipOpen(!secondProbTooltipOpen);
                                            }} onMouseEnter={() => setSecondProbTooltipOpen(true)} onMouseLeave={() => setSecondProbTooltipOpen(false)} />
                                          </TooltipTrigger>
                                          <TooltipContent side="top" align="center" sideOffset={6} className="max-w-sm overflow-visible whitespace-normal text-white text-left">
                                            <p className="text-sm leading-relaxed">{t('nextWord.response.probTooltip')}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </span>
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-popover border border-border shadow-lg rounded-md z-[9999] min-w-[120px]">
                                {options.map(option => <DropdownMenuItem key={option.word} onClick={() => handleWordSelection(option.word, index)} className={`cursor-pointer flex justify-between items-center gap-2 ${option.word === "Unites" ? "bg-destructive/10 hover:bg-destructive/20" : "hover:bg-muted"}`}>
                                  <span className="inline-flex items-center gap-2">
                                    {option.word}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    {option.probability}
                                    <TooltipProvider>
                                      <Tooltip open={dropdownProbTooltips[`second-${option.word}`]} onOpenChange={open => toggleDropdownTooltip(`second-${option.word}`, open)}>
                                        <TooltipTrigger asChild>
                                          <Info className="h-3 w-3 cursor-pointer" onClick={e => {
                                            e.stopPropagation();
                                          }} onMouseEnter={() => toggleDropdownTooltip(`second-${option.word}`, true)} onMouseLeave={() => toggleDropdownTooltip(`second-${option.word}`, false)} />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="center" sideOffset={6} className="max-w-sm overflow-visible whitespace-normal text-white text-left">
                                          <p className="text-sm leading-relaxed">{t('nextWord.response.probTooltip')}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </span>
                                </DropdownMenuItem>)}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            {2 < currentSentence.length - 1 && " "}
                          </span>;

                          const displayThirdWord = animatedThirdWord || thirdWord;
                          const isThirdHighlighted = showHighlightPulseThird && animatedThirdWord;

                          const dropdown2 = isValidThirdWord ? <span key={3}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button data-word={thirdWord.toLowerCase()} className={`relative group cursor-pointer transition-all duration-200 px-1 rounded-lg inline-flex items-center gap-1 ${isThirdHighlighted
                                  ? "bg-primary text-primary-foreground animate-pulse ring-4 ring-primary/50"
                                  : isAnimatingThird && animatedThirdWord
                                    ? "bg-yellow-200"
                                    : "bg-green-200 hover:bg-green-300"
                                  }`}>
                                  {displayThirdWord}
                                  <ChevronDown className="h-3 w-3" />
                                  <span className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 rounded transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${isThirdHighlighted
                                    ? "bg-primary text-primary-foreground scale-110"
                                    : "bg-green-200 text-green-800"
                                    }`} style={{
                                      pointerEvents: 'auto'
                                    }}>
                                    {!isThirdHighlighted && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          playThirdWordAnimation();
                                        }}
                                        disabled={isAnimatingThird}
                                        className={`p-0.5 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-all disabled:opacity-50 ${isAnimatingThird ? 'animate-spin' : ''
                                          }`}
                                        title="Watch LLM select word"
                                      >
                                        <Monitor className="h-3 w-3" />
                                      </button>
                                    )}
                                    {isThirdHighlighted ? `${rawOptionsThird.find(opt => opt.word === animatedThirdWord)?.probability || "0.73"} ✓ Highest!` : (rawOptionsThird.find(opt => opt.word === thirdWord)?.probability || rawOptionsThird[0]?.probability || "0.73")}
                                    {!isThirdHighlighted && (
                                      <TooltipProvider>
                                        <Tooltip open={thirdProbTooltipOpen} onOpenChange={setThirdProbTooltipOpen}>
                                          <TooltipTrigger asChild>
                                            <Info className="h-3 w-3 cursor-pointer" onClick={e => {
                                              e.stopPropagation();
                                              setThirdProbTooltipOpen(!thirdProbTooltipOpen);
                                            }} onMouseEnter={() => setThirdProbTooltipOpen(true)} onMouseLeave={() => setThirdProbTooltipOpen(false)} />
                                          </TooltipTrigger>
                                          <TooltipContent side="top" align="center" sideOffset={6} className="max-w-sm overflow-visible whitespace-normal text-white text-left">
                                            <p className="text-sm leading-relaxed">{t('nextWord.response.probTooltip')}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </span>
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-popover border border-border shadow-lg rounded-md z-[9999] min-w-[120px]">
                                {optionsThird.map(option => <DropdownMenuItem key={option.word} onClick={() => handleWordSelection(option.word, 3)} className={`cursor-pointer flex justify-between items-center gap-2 ${option.word === "Around" ? "bg-destructive/10 hover:bg-destructive/20" : "hover:bg-muted"}`}>
                                  <span className="inline-flex items-center gap-2">
                                    {option.word}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    {option.probability}
                                    <TooltipProvider>
                                      <Tooltip open={dropdownProbTooltips[`third-${option.word}`]} onOpenChange={open => toggleDropdownTooltip(`third-${option.word}`, open)}>
                                        <TooltipTrigger asChild>
                                          <Info className="h-3 w-3 cursor-pointer" onClick={e => {
                                            e.stopPropagation();
                                          }} onMouseEnter={() => toggleDropdownTooltip(`third-${option.word}`, true)} onMouseLeave={() => toggleDropdownTooltip(`third-${option.word}`, false)} />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="center" sideOffset={6} className="max-w-sm overflow-visible whitespace-normal text-white text-left">
                                          <p className="text-sm leading-relaxed">{t('nextWord.response.probTooltip')}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </span>
                                </DropdownMenuItem>)}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            {3 < currentSentence.length - 1 && " "}
                          </span> : null;

                          return <React.Fragment key="dropdown-group">
                            <div data-mini-task-target className="h-[66px] w-[220px] absolute inline-block pointer-events-none" />
                            {dropdown1}
                            {dropdown2}
                          </React.Fragment>
                        }

                        // Handle TextFlag for "Charter," in new form too
                        if (word === "Charter,") {
                          return <span key={index} className="relative">
                            <span onMouseLeave={() => {
                              if (!charterTooltipShown) {
                                setShowCharterTooltip(true);
                                setCharterTooltipShown(true);
                              }
                            }}>
                              <TextFlag text="Charter" evaluationFactor='factual_accuracy' explanation={t('components.textFlag.content.factual1')} />
                            </span>
                            ,{index < currentSentence.length - 1 && " "}
                          </span>;
                        }
                        return <span key={index}>
                          {word}
                          {index < currentSentence.length - 1 && " "}
                        </span>;
                      })}
                    </h1>
                  </div>

                  {/* Factual Inaccuracy Tooltip for New Form */}
                  {showFactualInaccuracyTooltip && <div className="absolute left-full top-0 ml-4 z-50">
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md w-80">
                      <p className="text-sm leading-relaxed mb-2 font-medium">
                        You found the factual inaccuracy!
                      </p>
                      <p className="text-sm leading-relaxed mb-4">
                        The EU has not "united behind" the AI Act. While there is broad support, the process involved negotiations, compromises, and some member states had reservations about certain provisions.
                      </p>
                      <button onClick={() => setShowFactualInaccuracyTooltip(false)} className="bg-white text-emerald-500 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                        Continue
                      </button>
                    </div>
                  </div>}

                  <GuidanceTooltip text="Journalistic Evaluation Checklist: For more information on the flagged content, expand the relevant term according to the icon. This checklist is designed to help you apply your journalistic expertise effectively to LLM outputs. With LLM-specific criteria, it guides you to keep your reporting reliable." isVisible={showCharterTooltip} onClose={() => setShowCharterTooltip(false)} className="fixed right-80 top-1/2 transform -translate-y-1/2 z-50" />

                </div>
              )}

              {/* Takeaways Button - only show after user interaction */}
              {hasInteracted && (
                <div className="mt-8">
                  <Button variant="outline" size="lg" onClick={() => navigate("/module/next-word-prediction/takeaways")} className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10">
                    {t('components.breadcrumb.takeaways')}
                    <ArrowRight className="-mr-2 !h-6 !w-6" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Evaluation panel - in flow, content shifts to accommodate */}
        <div className="flex-shrink-0" data-evaluation-panel>
          <EvaluationPanel initialIsOpen={evaluationPanelOpen} canClose={true} />
        </div>
      </div>
    </main>

    {/* Single tooltip for probability explanation */}
    {showTooltip && <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-brand-tertiary-500 text-white rounded-xl shadow-lg max-w-xs pointer-events-auto relative" style={{
        padding: '16px 20px'
      }}>
        <p className="text-sm leading-relaxed mb-4">
          The numbers on top of each word represent the probability that the word would be selected.
        </p>
        <p className="text-sm leading-relaxed mb-4">
          Use them to understand what would be the most probable selection by the LLM
        </p>
        <button onClick={() => setShowTooltip(false)} className="absolute bottom-2 right-2 bg-card text-brand-tertiary-500 px-3 py-1 rounded text-sm font-medium hover:bg-muted transition-colors">
          Close
        </button>
      </div>
    </div>}

      {/* Feature Highlight - Step 1: Word selections */}
      <FeatureHighlight
        target='[data-feature="word-options"]'
        open={highlightStep === 1 && viewMode === "tree"}
        onClose={() => setHighlightStep(2)}
        side="right"
        sideOffset={32}
        closeLabel="Next"
      >
        Select from these words to see how an LLM might construct a headline — one word at a time. Each choice leads to a new set of options, just like a language model predicting the next token.
      </FeatureHighlight>

      {/* Feature Highlight - Step 2: Probability */}
      <FeatureHighlight
        target='[data-feature="probability"]'
        open={highlightStep === 2 && viewMode === "tree"}
        onClose={() => setHighlightStep(0)}
        side="top"
        sideOffset={32}
        closeLabel="Got it"
      >
        This number is the <strong>probability</strong> — it shows how likely the LLM thinks this word should come next, based on all the text it was trained on. A higher probability means the model considers it a more natural continuation. Use these numbers to pick what the computer would most likely choose!
      </FeatureHighlight>

    <ModuleNavigation previousRoute="/module/next-word-prediction/prompt" nextRoute={hasInteracted ? "/module/next-word-prediction/takeaways" : undefined} />
    <div className="mt-6 text-sm text-muted-foreground max-w-7xl mx-auto">
      LLMs have been used in the following places:<br />
      The creation of prompt output examples in the Guided Exploration<br />
      LLMs used include: Mistral, Claude, Chat GPT & Llama 3.1 8B (open source)
    </div>
  </div>;
}
