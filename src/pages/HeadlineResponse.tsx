import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import SentPrompt from "@/components/SentPrompt";
import { PopoverSeries } from "@/components/PopoverSeries";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeadlineResponse() {
  const navigate = useNavigate();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [currentSentence, setCurrentSentence] = useState(["European", "Union", "Unites", "on", "Historic AI Ethics Framework, Charting Path for Responsible Technology Development"]);
  
  // Word progression data from the table
  const wordProgressions = {
    "European Union Unites": {
      "on": "Historic AI Ethics Framework, Charting Path for Responsible Technology Development",
      "Around": "Sweeping AI Ethics Charter, Pioneering International Tech Policy Standards", 
      "Behind": "Historic AI Ethics Framework, Setting Standards for Responsible Innovation"
    },
    "European Union Reaches": {
      "Consensus": "on Historic AI Ethics Framework, Paving the Way for Responsible Tech Innovation",
      "Agreement": "on Historic AI Ethics Framework, Laying Groundwork for Safe Tech Development",
      "Milestone": "in AI Ethics, Advancing a Unified Vision for Responsible Innovation"
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
      return [
        { word: "Unites", nextWords: ["on", "Around", "Behind"] },
        { word: "Reaches", nextWords: ["Consensus", "Agreement", "Milestone"] },
        { word: "Finalizes", nextWords: ["landmark", "sweeping", "pioneering"] }
      ];
    }
    
    const pathKey = currentPath.slice(0, 3).join(" ");
    const progressionData = wordProgressions[pathKey as keyof typeof wordProgressions];
    
    if (progressionData && currentPath.length === 3) {
      return Object.keys(progressionData).map(word => ({
        word,
        completion: progressionData[word as keyof typeof progressionData]
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
  const popoverSteps = [
    {
      id: "word-union",
      trigger: "[data-word-union]",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Interactive Word Selection</h3>
          <p className="text-sm leading-relaxed">
            Click on either of these words to select a different word. Try and find the word combination that leads to a factual inaccuracy.
          </p>
        </div>
      ),
    },
    {
      id: "word-unites",
      trigger: "[data-word-unites]",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Interactive Word Selection</h3>
          <p className="text-sm leading-relaxed">
            Click on either of these words to select a different word. Try and find the word combination that leads to a factual inaccuracy.
          </p>
        </div>
      ),
    },
  ];

  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Breadcrumb />
        <div className="max-w-7xl mx-auto">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column - Main content */}
            <div className="lg:col-span-8">
              {/* Original Prompt */}
              <div className="mb-8">
                <SentPrompt 
                  text="Write a headline for a long form journalistic article about ai ethics agreement reached across the eu" 
                  fileName="EU_AI_Act.pdf"
                />
              </div>

              {/* AI Response */}
              <div className="space-y-6">
                <p className="text-gray-700 text-lg">
                  Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:
                </p>
                
                <div className="relative">
                  <h1 className="text-2xl text-gray-900 leading-tight font-normal md:text-4xl">
                    {currentSentence.map((word, index) => {
                      const isClickable = (index === 2 && (word === "Unites" || word === "Reaches" || word === "Finalizes"));
                      
                      // Special handling for Union/Unites position
                      if (index === 1 && word === "Union") {
                        return (
                          <span key={index}>
                            <span 
                               className="relative group cursor-pointer transition-colors duration-200 hover:bg-green-200 hover:px-1 hover:rounded"
                               onClick={() => setSelectedWord(selectedWord === `word-${index}` ? null : `word-${index}`)}
                               data-word-union
                             >
                               {word}
                               <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                 0.73
                               </span>
                            </span>
                            {index < currentSentence.length - 1 && " "}
                          </span>
                        );
                      }
                      
                      if (isClickable) {
                        return (
                          <span key={index}>
                             <span 
                               className="relative group cursor-pointer transition-colors duration-200 hover:bg-green-200 hover:px-1 hover:rounded"
                               onClick={() => setSelectedWord(selectedWord === `word-${index}` ? null : `word-${index}`)}
                               data-word-unites={word === "Unites" ? true : undefined}
                             >
                               {word}
                               <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                 {word === "Unites" ? "0.67" : word === "Reaches" ? "0.24" : "0.09"}
                               </span>
                             </span>
                            {index < currentSentence.length - 1 && " "}
                          </span>
                        );
                      }
                      
                      return (
                        <span key={index}>
                          {word}
                          {index < currentSentence.length - 1 && " "}
                        </span>
                      );
                    })}
                  </h1>
                  
                  {/* Word alternatives popup */}
                  {selectedWord && (
                    <div className="absolute inset-0 z-10 pointer-events-none" style={{ transform: `translate(${selectedWord === "word-1" ? "-200px" : selectedWord === "word-3" ? "50px" : "-100px"}, -30px)` }}>
                      <div className="relative w-full h-full">
                        {(() => {
                          const wordIndex = parseInt(selectedWord.split('-')[1]);
                          const nextWords = getNextWords(currentSentence.slice(0, wordIndex + 1));
                          
                          return nextWords.map((option, index) => {
                            // Calculate circular positions around the center word
                            const radius = 120;
                            const innerRadius = 40; // Gap between center word and lines
                            const angle = (index * 120) - 90; // 120 degrees apart, starting from top
                            const x = Math.cos((angle * Math.PI) / 180) * radius;
                            const y = Math.sin((angle * Math.PI) / 180) * radius;
                            const innerX = Math.cos((angle * Math.PI) / 180) * innerRadius;
                            const innerY = Math.sin((angle * Math.PI) / 180) * innerRadius;
                            
                            return (
                              <div key={index}>
                                {/* Connecting line with gap from center word */}
                                <svg 
                                  className="absolute inset-0 w-full h-full pointer-events-none"
                                  style={{ zIndex: 1 }}
                                >
                                  <line 
                                    x1={`calc(50% + ${innerX}px)`} 
                                    y1={`calc(50% + ${innerY}px)`} 
                                    x2={`calc(50% + ${x}px)`} 
                                    y2={`calc(50% + ${y}px)`} 
                                    stroke="#10b981" 
                                    strokeWidth="2"
                                  />
                                </svg>
                                
                                {/* Alternative word bubble */}
                                <div 
                                  className="absolute bg-green-200 text-black px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-green-300 transition-colors duration-200 whitespace-nowrap pointer-events-auto"
                                  style={{ 
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                    zIndex: 2
                                  }}
                                   onClick={() => {
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
                                         const completionWords = option.completion.split(" ").map(word => 
                                           word.charAt(0).toUpperCase() + word.slice(1)
                                         );
                                         newSentence.push(...completionWords);
                                       }
                                     }
                                     setCurrentSentence(newSentence);
                                     setSelectedWord(null);
                                   }}
                                >
                                   <div className="text-xs font-medium mb-1 text-center text-green-800">
                                     {index === 0 ? "0.67" : index === 1 ? "0.24" : "0.09"}
                                   </div>
                                  <div className="text-sm font-semibold text-center">
                                    {option.word}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      
                      {/* Background overlay to close popup */}
                      <div 
                        className="fixed inset-0 -z-10 pointer-events-auto" 
                        onClick={() => setSelectedWord(null)}
                      />
                    </div>
                  )}
                </div>
                
                {/* Takeaways Button */}
                <div className="mt-8">
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/takeaways")}
                    className="rounded-full px-6 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
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
      
      {/* PopoverSeries for word interaction tour */}
      <PopoverSeries steps={popoverSteps} />
    </div>;
}