import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ChatPrompt from "@/components/ChatPrompt";
import LearningProgressBar from "@/components/LearningProgressBar";
import { MiniTask } from "@/components/MiniTask";
import TextFlag from "@/components/TextFlag";
import ModuleNavigation from "@/components/ModuleNavigation";
import GuidanceTooltip from "@/components/GuidanceTooltip";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Info, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export default function HeadlineResponse() {
  const navigate = useNavigate();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [currentSentence, setCurrentSentence] = useState(["European", "Union", "Unites", "On", "Historic", "AI", "Ethics", "Framework,", "Charting", "Path", "For", "Responsible", "Technology", "Development"]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipShown, setTooltipShown] = useState(false);
  const [showFactualInaccuracyTooltip, setShowFactualInaccuracyTooltip] = useState(false);
  const [factualTooltipShown, setFactualTooltipShown] = useState(false);
  const [showCharterTooltip, setShowCharterTooltip] = useState(false);
  const [charterTooltipShown, setCharterTooltipShown] = useState(false);
  const [showMiniTask, setShowMiniTask] = useState(true);
  const [secondProbTooltipOpen, setSecondProbTooltipOpen] = useState(false);
  const [thirdProbTooltipOpen, setThirdProbTooltipOpen] = useState(false);
  const [dropdownProbTooltips, setDropdownProbTooltips] = useState<{[key: string]: boolean}>({});

  const getWordOptions = (position: 'second' | 'third', currentIndex?: number) => {
    let options: { word: string; probability: string }[] = [];

    if (position === 'second') {
      options = [
        { word: "Unites", probability: "0.67" },
        { word: "Reaches", probability: "0.24" },
        { word: "Finalizes", probability: "0.09" }
      ];
    } else { // third position
      const secondWord = currentSentence[2];
      if (secondWord === "Unites") {
        options = [
          { word: "On", probability: "0.73" },
          { word: "Around", probability: "0.42" },
          { word: "Behind", probability: "0.12" }
        ];
      } else if (secondWord === "Reaches") {
        options = [
          { word: "Consensus", probability: "0.65" },
          { word: "Agreement", probability: "0.28" },
          { word: "Milestone", probability: "0.07" }
        ];
      } else if (secondWord.toLowerCase() === "finalizes") {
        options = [
          { word: "Landmark", probability: "0.58" },
          { word: "Sweeping", probability: "0.31" },
          { word: "Pioneering", probability: "0.11" }
        ];
      }
    }

    // Filter out only the currently selected word from its own dropdown
    if (currentIndex !== undefined) {
      const currentWord = currentSentence[currentIndex];
      return options.filter(option =>
        option.word.toLowerCase() !== currentWord.toLowerCase().replace(/[,.]/g, '')
      );
    }

    return options;
  };

  // Function to handle word selection and update sentence
  const handleWordSelection = (newWord: string, position: number) => {
    const newSentence = [...currentSentence];
    newSentence[position] = newWord;

    // Update the rest of the sentence based on the selection
    if (position === 2) { // Second column selection
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
        const thirdOptions = newWord === "Unites"
          ? [
            { word: "On", probability: "0.73" },
            { word: "Around", probability: "0.42" },
            { word: "Behind", probability: "0.12" },
          ]
          : getWordOptions('third', 3);
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
    } else if (position === 3) { // Third column selection
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
    if ((currentSentence[2] === "Unites" && newWord === "Behind") ||
      (newWord === "Unites" && currentSentence[3] === "Behind")) {
      setShowFactualInaccuracyTooltip(true);
    }
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (showMiniTask) {
        setShowMiniTask(false);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

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
      return Object.keys(progressionData).map((key) => ({
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
      <h3 className="font-semibold text-sm">Interactive Word Selection</h3>
      <p className="text-sm leading-relaxed">
        Click on the highlighted words to select a different option. Try and find the word combination that leads to a factual inaccuracy.
      </p>
    </div>
  }];
  return <div className="min-h-screen bg-background">
    {showMiniTask && (
      <MiniTask
        title="Mini Task: Find the factual inaccuracy"
        description="Click on the green highlighted words to try out different combinations – each combination will generate a different outcome."
        onStartTask={() => setShowMiniTask(false)}
      />
    )}
    <Header />

    {/* MiniTask - render at top for immediate visibility */}


    <main className="container mx-auto px-6 py-6 max-w-7xl">
      <div className="mb-6">
        <Breadcrumb />
      </div>

      <div className="w-full">
        {/* Two-column layout */}
        <div className="flex flex-col justify-between lg:flex-row gap-8 items-start">
          {/* Left column - Main content */}
          <div className="flex-1 min-w-0 max-w-4xl">
            {/* Original Prompt */}
            <div className="mb-8">
              <ChatPrompt text="Write a headline for a long form journalistic article about ai ethics agreement reached across the eu" fileName="EU_AI_Act.pdf" />
            </div>

            {/* AI Response */}
            <div className="space-y-6">
              <p className="text-gray-700 text-lg">
                Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:
              </p>

              {/* Interactive Word Selection Form */}
              <div className="space-y-6">
                <div className="relative">
                  <h1 className="text-2xl text-gray-900 leading-loose font-normal md:text-4xl" style={{
                    wordSpacing: '0.2em',
                    lineHeight: '1.8'
                  }}>
                    {currentSentence.map((word, index) => {
                      // Handle dropdown for second position (Unites/Reaches/Finalizes/finalizes)
                      if (index === 2 && (word === "Unites" || word === "Reaches" || word === "Finalizes" || word === "finalizes")) {
                        const options = getWordOptions('second', index);
                        const rawOptions = getWordOptions('second');
                        return (
                          <span key={index}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button data-word-union data-word={word.toLowerCase()} className="relative group cursor-pointer transition-colors duration-200 bg-green-200 hover:bg-green-300 px-1 rounded-lg inline-flex items-center gap-1">
                                  {word}
                                  <ChevronDown className="h-3 w-3" />
                                   <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap flex items-center gap-1" style={{ pointerEvents: 'auto' }}>
                                     {rawOptions.find(opt => opt.word === word)?.probability || rawOptions[0]?.probability || "0.67"}
                                     <TooltipProvider>
                                       <Tooltip open={secondProbTooltipOpen} onOpenChange={setSecondProbTooltipOpen}>
                                         <TooltipTrigger asChild>
                                           <Info 
                                             className="h-3 w-3 cursor-pointer" 
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               setSecondProbTooltipOpen(!secondProbTooltipOpen);
                                             }}
                                             onMouseEnter={() => setSecondProbTooltipOpen(true)}
                                             onMouseLeave={() => setSecondProbTooltipOpen(false)}
                                           />
                                         </TooltipTrigger>
                                         <TooltipContent side="top" align="center" sideOffset={6} className="max-w-sm overflow-visible whitespace-normal text-white text-left">
                                           <p className="text-sm leading-relaxed">These are example probabilities that could be assigned to a word that weights words to be selected by the LLM.</p>
                                         </TooltipContent>
                                       </Tooltip>
                                     </TooltipProvider>
                                   </span>
                                </button>
                              </DropdownMenuTrigger>
                               <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-md z-[9999] min-w-[120px]">
                                 {options.map((option) => (
                                   <DropdownMenuItem
                                     key={option.word}
                                     onClick={() => handleWordSelection(option.word, index)}
                                     className="cursor-pointer hover:bg-gray-100 flex justify-between items-center gap-2"
                                   >
                                     <span>{option.word}</span>
                                     <span className="flex items-center gap-1 text-xs text-gray-500">
                                       {option.probability}
                                       <TooltipProvider>
                                         <Tooltip open={dropdownProbTooltips[`second-${option.word}`]} onOpenChange={(open) => setDropdownProbTooltips(prev => ({...prev, [`second-${option.word}`]: open}))}>
                                           <TooltipTrigger asChild>
                                             <Info 
                                               className="h-3 w-3 cursor-pointer" 
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 setDropdownProbTooltips(prev => ({...prev, [`second-${option.word}`]: !prev[`second-${option.word}`]}));
                                               }}
                                               onMouseEnter={() => setDropdownProbTooltips(prev => ({...prev, [`second-${option.word}`]: true}))}
                                               onMouseLeave={() => setDropdownProbTooltips(prev => ({...prev, [`second-${option.word}`]: false}))}
                                             />
                                           </TooltipTrigger>
                                           <TooltipContent side="right" align="center" sideOffset={6} className="max-w-sm overflow-visible whitespace-normal text-white text-left">
                                             <p className="text-sm leading-relaxed">These are example probabilities that could be assigned to a word that weights words to be selected by the LLM.</p>
                                           </TooltipContent>
                                         </Tooltip>
                                       </TooltipProvider>
                                     </span>
                                   </DropdownMenuItem>
                                 ))}
                               </DropdownMenuContent>
                            </DropdownMenu>
                            {index < currentSentence.length - 1 && " "}
                          </span>
                        );
                      }

                      // Handle dropdown for third position (On/Around/Behind/landmark/etc.)
                      if (index === 3) {
                        const rawOptions = getWordOptions('third');
                        const options = getWordOptions('third', index);
                        const isValidThirdWord = rawOptions.some(opt => opt.word === word);

                        if (isValidThirdWord) {
                          return (
                            <span key={index}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button data-word={word.toLowerCase()} className="relative group cursor-pointer transition-colors duration-200 bg-green-200 hover:bg-green-300 px-1 rounded-lg inline-flex items-center gap-1">
                                    {word}
                                    <ChevronDown className="h-3 w-3" />
                                     <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap flex items-center gap-1" style={{ pointerEvents: 'auto' }}>
                                       {rawOptions.find(opt => opt.word === word)?.probability || rawOptions[0]?.probability || "0.73"}
                                       <TooltipProvider>
                                         <Tooltip open={thirdProbTooltipOpen} onOpenChange={setThirdProbTooltipOpen}>
                                           <TooltipTrigger asChild>
                                             <Info 
                                               className="h-3 w-3 cursor-pointer" 
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 setThirdProbTooltipOpen(!thirdProbTooltipOpen);
                                               }}
                                               onMouseEnter={() => setThirdProbTooltipOpen(true)}
                                               onMouseLeave={() => setThirdProbTooltipOpen(false)}
                                             />
                                           </TooltipTrigger>
                                           <TooltipContent side="top" align="center" sideOffset={6} className="max-w-sm overflow-visible whitespace-normal text-white text-left">
                                             <p className="text-sm leading-relaxed">These are example probabilities that could be assigned to a word that weights words to be selected by the LLM.</p>
                                           </TooltipContent>
                                         </Tooltip>
                                       </TooltipProvider>
                                     </span>
                                  </button>
                                </DropdownMenuTrigger>
                                 <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-md z-[9999] min-w-[120px]">
                                   {options.map((option) => (
                                     <DropdownMenuItem
                                       key={option.word}
                                       onClick={() => handleWordSelection(option.word, index)}
                                       className="cursor-pointer hover:bg-gray-100 flex justify-between items-center gap-2"
                                     >
                                       <span>{option.word}</span>
                                       <span className="flex items-center gap-1 text-xs text-gray-500">
                                         {option.probability}
                                         <TooltipProvider>
                                           <Tooltip open={dropdownProbTooltips[`third-${option.word}`]} onOpenChange={(open) => setDropdownProbTooltips(prev => ({...prev, [`third-${option.word}`]: open}))}>
                                             <TooltipTrigger asChild>
                                               <Info 
                                                 className="h-3 w-3 cursor-pointer" 
                                                 onClick={(e) => {
                                                   e.stopPropagation();
                                                   setDropdownProbTooltips(prev => ({...prev, [`third-${option.word}`]: !prev[`third-${option.word}`]}));
                                                 }}
                                                 onMouseEnter={() => setDropdownProbTooltips(prev => ({...prev, [`third-${option.word}`]: true}))}
                                                 onMouseLeave={() => setDropdownProbTooltips(prev => ({...prev, [`third-${option.word}`]: false}))}
                                               />
                                             </TooltipTrigger>
                                             <TooltipContent side="right" align="center" sideOffset={6} className="max-w-sm overflow-visible whitespace-normal text-white text-left">
                                               <p className="text-sm leading-relaxed">These are example probabilities that could be assigned to a word that weights words to be selected by the LLM.</p>
                                             </TooltipContent>
                                           </Tooltip>
                                         </TooltipProvider>
                                       </span>
                                     </DropdownMenuItem>
                                   ))}
                                 </DropdownMenuContent>
                              </DropdownMenu>
                              {index < currentSentence.length - 1 && " "}
                            </span>
                          );
                        }
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
                            <TextFlag text="Charter" evaluationFactor="factual-accuracy" explanation="The term 'charter' has been used here to describe the EU AI Act. A charter is a different type of document than an act and therefore are not interchangeable terms." />
                          </span>
                          ,{index < currentSentence.length - 1 && " "}
                        </span>;
                      }

                      return (
                        <span key={index}>
                          {word}
                          {index < currentSentence.length - 1 && " "}
                        </span>
                      );
                    })}
                  </h1>
                </div>

                {/* Factual Inaccuracy Tooltip for New Form */}
                {showFactualInaccuracyTooltip && (
                  <div className="absolute left-full top-0 ml-4 z-50">
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md w-80">
                      <p className="text-sm leading-relaxed mb-2 font-medium">
                        You found the factual inaccuracy!
                      </p>
                      <p className="text-sm leading-relaxed mb-4">
                        The EU has not "united behind" the AI Act. While there is broad support, the process involved negotiations, compromises, and some member states had reservations about certain provisions.
                      </p>
                      <button
                        onClick={() => setShowFactualInaccuracyTooltip(false)}
                        className="bg-white text-emerald-500 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                <GuidanceTooltip
                  text="Journalistic Evaluation Checklist: For more information on the flagged content, expand the relevant term according to the icon. This checklist is designed to help you apply your journalistic expertise effectively to LLM outputs. With LLM-specific criteria, it guides you to keep your reporting reliable."
                  isVisible={showCharterTooltip}
                  onClose={() => setShowCharterTooltip(false)}
                  className="fixed right-80 top-1/2 transform -translate-y-1/2 z-50"
                />

              </div>

              {/* Takeaways Button */}
              <div className="mt-8">
                <Button variant="secondary" onClick={() => navigate("/module/next-word-prediction/takeaways")} className="rounded-full px-6 py-3">
                  Takeaways
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right column - Evaluation panel */}
          <div className="w-full lg:w-auto lg:flex-shrink-0" data-evaluation-panel>
            <EvaluationPanel />
          </div>
        </div>
      </div>
    </main>

    {/* Single tooltip for probability explanation */}
    {showTooltip && <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-emerald-600 text-white rounded-xl shadow-lg max-w-xs pointer-events-auto relative" style={{
        padding: '16px 20px'
      }}>
        <p className="text-sm leading-relaxed mb-4">
          The numbers on top of each word represent the probability that the word would be selected.
        </p>
        <p className="text-sm leading-relaxed mb-4">
          Use them to understand what would be the most probable selection by the LLM
        </p>
        <button onClick={() => setShowTooltip(false)} className="absolute bottom-2 right-2 bg-white text-emerald-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
          Close
        </button>
      </div>
    </div>}

    <div className="mt-8">
      <LearningProgressBar 
        module="next-word-prediction"
        currentStep="main"
        baseRoute="/module/next-word-prediction"
      />
    </div>

    <ModuleNavigation
      previousRoute="/module/next-word-prediction/prompt"
      nextRoute="/module/next-word-prediction/takeaways"
    />
    <div className="mt-6 text-sm text-gray-500 max-w-7xl mx-auto">
      LLMs have been used in the following places:<br />
      The creation of prompt output examples in the Guided Exploration<br />
      LLMs used include: Mistral, Claude, Chat GPT & Llama 3.1 8B (open source)
    </div>
  </div>;
}