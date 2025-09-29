import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import SentPrompt from "@/components/SentPrompt";
import { PopoverSeries } from "@/components/PopoverSeries";
import TextFlag from "@/components/TextFlag";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  const [useNewInteraction, setUseNewInteraction] = useState(false);

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
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        {/* Breadcrumb and Toggle Row */}
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb />
          
          {/* Interaction Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="interaction-mode" className="text-sm font-medium">
              Interaction Mode:
            </Label>
            <Switch id="interaction-mode" checked={useNewInteraction} onCheckedChange={setUseNewInteraction} />
            <span className="text-sm text-gray-600">
              {useNewInteraction ? "New Form" : "Classic Form"}
            </span>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column - Main content */}
            <div className="lg:col-span-8">
              {/* Original Prompt */}
              <div className="mb-8">
                <SentPrompt text="Write a headline for a long form journalistic article about ai ethics agreement reached across the eu" fileName="EU_AI_Act.pdf" />
              </div>

              {/* AI Response */}
              <div className="space-y-6">
                <p className="text-gray-700 text-lg">
                  Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:
                </p>
                
                 {/* Conditional rendering based on interaction mode */}
                {useNewInteraction ? (/* New Interaction Form */
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
                                    <button className="relative group cursor-pointer transition-colors duration-200 bg-green-200 hover:bg-green-300 px-1 rounded-lg inline-flex items-center gap-1">
                                      {word}
                                      <ChevronDown className="h-3 w-3" />
                                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                        {rawOptions.find(opt => opt.word === word)?.probability || rawOptions[0]?.probability || "0.67"}
                                      </span>
                                    </button>
                                  </DropdownMenuTrigger>
                                   <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-md z-[9999] min-w-[120px]">
                                    {options.map((option) => (
                                      <DropdownMenuItem 
                                        key={option.word}
                                        onClick={() => handleWordSelection(option.word, index)}
                                        className="cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                                      >
                                        <span>{option.word}</span>
                                        <span className="text-xs text-gray-500 ml-2">{option.probability}</span>
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
                                      <button className="relative group cursor-pointer transition-colors duration-200 bg-green-200 hover:bg-green-300 px-1 rounded-lg inline-flex items-center gap-1">
                                        {word}
                                        <ChevronDown className="h-3 w-3" />
                                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                          {rawOptions.find(opt => opt.word === word)?.probability || rawOptions[0]?.probability || "0.73"}
                                        </span>
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-md z-[9999] min-w-[120px]">
                                      {options.map((option) => (
                                        <DropdownMenuItem 
                                          key={option.word}
                                          onClick={() => handleWordSelection(option.word, index)}
                                          className="cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                                        >
                                          <span>{option.word}</span>
                                          <span className="text-xs text-gray-500 ml-2">{option.probability}</span>
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
                            Through a series of word selections, the LLM has generated an error in factual information.
                          </p>
                          <p className="text-sm leading-relaxed mb-4">
                            Hover over the word to read more about the falsehood.
                          </p>
                          <button 
                            onClick={() => setShowFactualInaccuracyTooltip(false)} 
                            className="bg-white text-emerald-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Charter Tooltip for New Form */}
                    {showCharterTooltip && (
                      <div className="fixed right-80 top-1/2 transform -translate-y-1/2 z-50">
                        <div className="bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg w-80">
                          <h3 className="text-sm font-semibold mb-2">Journalistic Evaluation Checklist</h3>
                          <p className="text-sm leading-relaxed mb-3">
                            For more information on the flagged content, expand the relevant term according to the icon.
                          </p>
                          <p className="text-sm leading-relaxed mb-4">
                            This checklist is designed to help you apply your journalistic expertise effectively to LLM outputs. With LLM-specific criteria, it guides you to keep your reporting reliable.
                          </p>
                          <button 
                            onClick={() => setShowCharterTooltip(false)} 
                            className="bg-white text-emerald-500 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}
                    
                  </div>) : (/* Classic Interaction Form */

              <div className="relative">
                  <h1 className="text-2xl text-gray-900 leading-loose font-normal md:text-4xl" style={{
                  wordSpacing: '0.2em',
                  lineHeight: '1.8'
                }}>
                    {currentSentence.map((word, index) => {
                    const isClickable = index === 2 && (word === "Unites" || word === "Reaches" || word === "Finalizes" || word === "finalizes");

                    // Special handling for Union/Unites position
                    if (index === 1 && word === "Union") {
                      return <span key={index}>
                            <span className="relative group cursor-pointer transition-colors duration-200 bg-green-200 hover:bg-green-300 px-1 rounded-lg" onClick={() => setSelectedWord(selectedWord === `word-${index}` ? null : `word-${index}`)} onMouseEnter={() => {
                          if (!tooltipShown) {
                            setShowTooltip(true);
                            setTooltipShown(true);
                          }
                        }} data-word-union>
                               {word}
                               <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                 0.73
                               </span>
                            </span>
                            {index < currentSentence.length - 1 && " "}
                          </span>;
                    }
                    if (isClickable) {
                      return <span key={index}>
                             <span className="relative group cursor-pointer transition-colors duration-200 bg-green-200 hover:bg-green-300 px-1 rounded-lg" onClick={() => setSelectedWord(selectedWord === `word-${index}` ? null : `word-${index}`)} onMouseEnter={() => {
                          if (!tooltipShown) {
                            setShowTooltip(true);
                            setTooltipShown(true);
                          }
                        }} data-word-unites={word === "Unites" ? true : undefined} data-word-reaches={word === "Reaches" ? true : undefined} data-word-finalizes={word === "Finalizes" ? true : undefined}>
                               {word}
                               <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                 {word === "Unites" ? "0.67" : word === "Reaches" ? "0.24" : "0.09"}
                               </span>
                             </span>
                             {index < currentSentence.length - 1 && " "}
                           </span>;
                    }

                    // Handle TextFlag for "Charter,"
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
                             
                             {/* Charter Tooltip */}
                             {showCharterTooltip && <div className="fixed right-80 top-1/2 transform -translate-y-1/2 z-50">
                                 <div className="bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg w-80">
                                   <h3 className="text-sm font-semibold mb-2">Journalistic Evaluation Checklist</h3>
                                   <p className="text-sm leading-relaxed mb-3">
                                     For more information on the flagged content, expand the relevant term according to the icon.
                                   </p>
                                   <p className="text-sm leading-relaxed mb-4">
                                     This checklist is designed to help you apply your journalistic expertise effectively to LLM outputs. With LLM-specific criteria, it guides you to keep your reporting reliable.
                                   </p>
                                   <button onClick={() => setShowCharterTooltip(false)} className="bg-white text-emerald-500 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                                     Continue
                                   </button>
                                 </div>
                               </div>}
                             
                             {/* Factual Inaccuracy Tooltip */}
                             {showFactualInaccuracyTooltip && <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 z-50">
                                 <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md w-80">
                                   <p className="text-sm leading-relaxed mb-2 font-medium">
                                     You found the factual inaccuracy!
                                   </p>
                                   <p className="text-sm leading-relaxed mb-4">
                                     Through a series of word selections, the LLM has generated an error in factual information.
                                   </p>
                                   <p className="text-sm leading-relaxed mb-4">
                                     Hover over the word to read more about the falsehood.
                                   </p>
                                   <button onClick={() => setShowFactualInaccuracyTooltip(false)} className="bg-white text-emerald-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                                     Close
                                   </button>
                                 </div>
                               </div>}
                           </span>;
                    }
                    return <span key={index}>
                          {word}
                          {index < currentSentence.length - 1 && " "}
                        </span>;
                  })}
                  </h1>
                  
                  {/* Word alternatives popup */}
                  {selectedWord && <div className="absolute inset-0 z-10 pointer-events-none" style={{
                  transform: `translate(${selectedWord === "word-1" ? "-200px" : selectedWord === "word-3" ? "50px" : "-100px"}, -60px)`
                }}>
                      <div className="relative w-full h-full">
                        {(() => {
                      const wordIndex = parseInt(selectedWord.split('-')[1]);
                      const nextWords = getNextWords(currentSentence.slice(0, wordIndex + 1));
                      return nextWords.map((option, index) => {
                        // Calculate circular positions around the center word
                        const radius = 120;
                        const innerRadius = 40; // Gap between center word and lines
                        const angle = index * 120 - 90; // 120 degrees apart, starting from top
                        let x = Math.cos(angle * Math.PI / 180) * radius;
                        let y = Math.sin(angle * Math.PI / 180) * radius;

                        // Move "Reaches" specifically to the right by 15px
                        if (option.word === "Reaches") {
                          x += 15;
                        }
                        const innerX = Math.cos(angle * Math.PI / 180) * innerRadius;
                        const innerY = Math.sin(angle * Math.PI / 180) * innerRadius;
                        return <div key={index}>
                                {/* Connecting line with gap from center word */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{
                            zIndex: 1
                          }}>
                                  <line x1={`calc(50% + ${innerX}px)`} y1={`calc(50% + ${innerY}px)`} x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} stroke="#10b981" strokeWidth="2" />
                                </svg>
                                
                                {/* Alternative word bubble */}
                                <div className="absolute bg-green-200 text-black px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-green-300 transition-colors duration-200 whitespace-nowrap pointer-events-auto" style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            zIndex: 2
                          }} onClick={() => {
                            const newSentence = ["European", "Union"];
                            if (wordIndex === 1) {
                              // For Union position, set specific sentences based on verb
                              if (option.word === "Unites") {
                                newSentence.push("Unites", "On", "Historic", "AI", "Ethics", "Framework,", "Charting", "Path", "For", "Responsible", "Technology", "Development");
                              } else if (option.word === "Reaches") {
                                newSentence.push("Reaches", "Consensus", "On", "Historic", "AI", "Ethics", "Framework,", "Paving", "The", "Way", "For", "Responsible", "Tech", "Innovation");
                              } else if (option.word === "Finalizes") {
                                newSentence.push("Finalizes", "Landmark", "AI", "Ethics", "Agreement,", "Setting", "Global", "Benchmark", "For", "Safe", "Technology", "Development");
                              }
                            } else {
                              // Handle other word selections
                              newSentence.push(...currentSentence.slice(2, wordIndex + 1));
                              newSentence.push(option.word);
                              if (option.completion) {
                                // Split completion into individual words and capitalize each
                                const completionWords = option.completion.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1));
                                newSentence.push(...completionWords);
                              }
                            }
                            setCurrentSentence(newSentence);
                            setSelectedWord(null);

                            // Check if "Unites Around" combination is selected
                            if (newSentence.includes("Unites") && newSentence.includes("Around") && !factualTooltipShown) {
                              setTimeout(() => {
                                setShowFactualInaccuracyTooltip(true);
                                setFactualTooltipShown(true);
                              }, 500);
                            }
                          }}>
                                   <div className="text-xs font-medium mb-1 text-center text-green-800">
                                     {index === 0 ? "0.67" : index === 1 ? "0.24" : "0.09"}
                                   </div>
                                  <div className="text-sm font-semibold text-center">
                                    {option.word}
                                  </div>
                                </div>
                              </div>;
                      });
                    })()}
                      </div>
                      
                      {/* Background overlay to close popup */}
                      <div className="fixed inset-0 -z-10 pointer-events-auto" onClick={() => setSelectedWord(null)} />
                    </div>}
                </div>)}
                
                {/* Takeaways Button */}
                <div className="mt-8">
                  <Button variant="outline" onClick={() => navigate("/module/next-word-prediction/takeaways")} className="rounded-full px-6 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors">
                    Takeaways
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right column - Evaluation panel */}
            <div className="lg:col-span-4" data-evaluation-panel>
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
      
      {/* PopoverSeries for word interaction tour */}
      <PopoverSeries steps={popoverSteps} />
    </div>;
}