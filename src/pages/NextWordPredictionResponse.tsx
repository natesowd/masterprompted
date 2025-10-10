import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ChatPrompt from "@/components/ChatPrompt";
import { MiniTask } from "@/components/MiniTask";
import TextFlag from "@/components/TextFlag";
import ModuleNavigation from "@/components/ModuleNavigation";
import GuidanceTooltip from "@/components/GuidanceTooltip";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
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
      
      {/* MiniTask - render at top for immediate visibility */}
      {showMiniTask && (
        <MiniTask
          title="Mini Task: Find the factual inaccuracy"
          description="Click on the green highlighted words to try out different combinations – each combination will generate a different outcome."
          onStartTask={() => setShowMiniTask(false)}
        />
      )}
      
      <main className="container mx-auto px-6 py-6 max-w-7xl">
        <div className="mb-6">
          <Breadcrumb />
        </div>
        
        <div className="w-full">
          {/* Two-column layout */}
          <div className="flex gap-8">
            {/* Left column - Main content */}
            <div className="flex-1">
...
            </div>

            {/* Right column - Evaluation panel */}
            <div className="flex-shrink-0" data-evaluation-panel>
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
      
      <ModuleNavigation
        previousRoute="/module/next-word-prediction/prompt" 
        nextRoute="/module/next-word-prediction/takeaways"
      />
    </div>;
}