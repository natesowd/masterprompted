import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import SentPrompt from "@/components/SentPrompt";
import { PopoverSeries } from "@/components/PopoverSeries";
import { useState } from "react";

export default function HeadlineResponse() {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [currentSentence, setCurrentSentence] = useState(["European", "Union", "unites", "on", "Historic AI Ethics Framework, Charting Path for Responsible Technology Development"]);
  
  // Word progression data from the table
  const wordProgressions = {
    "European Union unites": {
      "on": "Historic AI Ethics Framework, Charting Path for Responsible Technology Development",
      "around": "Sweeping AI Ethics Charter, Pioneering International Tech Policy Standards", 
      "behind": "Historic AI Ethics Framework, Setting Standards for Responsible Innovation"
    },
    "European Union Reaches": {
      "Consensus": "on Historic AI Ethics Framework, Paving the Way for Responsible Tech Innovation",
      "Agreement": "on Historic AI Ethics Framework, Laying Groundwork for Safe Tech Development",
      "Milestone": "in AI Ethics, Advancing a Unified Vision for Responsible Innovation"
    },
    "European Union finalizes": {
      "landmark": "AI Ethics Agreement, Setting Global Benchmark for Safe Technology Development",
      "sweeping": "AI Ethics Agreement, Establishing New Norms for Responsible Tech",
      "pioneering": "AI Ethics Framework, Guiding the Future of Safe Innovation"
    }
  };
  
  const getNextWords = (currentPath: string[]) => {
    // For Union position (index 1)
    if (currentPath.length === 2 && currentPath[0] === "European" && currentPath[1] === "Union") {
      return [
        { word: "unites", nextWords: ["on", "around", "behind"] },
        { word: "Reaches", nextWords: ["Consensus", "Agreement", "Milestone"] },
        { word: "finalizes", nextWords: ["landmark", "sweeping", "pioneering"] }
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
  // Define popover steps for the journalistic evaluation tour
  const popoverSteps = [
    {
      id: "evaluation-panel",
      trigger: "[data-evaluation-panel]",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Journalistic Evaluation</h3>
          <p className="text-sm leading-relaxed">
            This panel helps you evaluate AI-generated content across key journalistic criteria. 
            Each section examines different aspects of quality and reliability that journalists should consider.
          </p>
        </div>
      ),
    },
    {
      id: "factual-accuracy",
      trigger: "[data-criterion-id='factual-accuracy']",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Factual Accuracy</h3>
          <p className="text-sm leading-relaxed">
            Click here to learn about factual accuracy - one of the most critical aspects when evaluating AI outputs. 
            This covers how to identify hallucinations and ensure information reliability.
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
                      const isClickable = (index === 2 && (word === "unites" || word === "Reaches" || word === "finalizes"));
                      
                      // Special handling for Union/Unites position
                      if (index === 1 && word === "Union") {
                        return (
                          <span key={index}>
                            <span 
                              className="relative group cursor-pointer transition-colors duration-200 hover:bg-green-200 hover:px-1 hover:rounded"
                              onClick={() => setSelectedWord(selectedWord === `word-${index}` ? null : `word-${index}`)}
                              onMouseEnter={(e) => {
                                const randomNum = (Math.random()).toFixed(2);
                                e.currentTarget.setAttribute('data-score', randomNum);
                              }}
                            >
                              {word}
                              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                {typeof window !== 'undefined' && Math.random().toFixed(2)}
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
                              onMouseEnter={(e) => {
                                const randomNum = (Math.random()).toFixed(2);
                                e.currentTarget.setAttribute('data-score', randomNum);
                              }}
                            >
                              {word}
                              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                {typeof window !== 'undefined' && Math.random().toFixed(2)}
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
                    <div className="absolute inset-0 z-10 pointer-events-none" style={{ transform: `translate(${selectedWord === "word-3" ? "50px" : "-100px"}, -30px)` }}>
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
                                    const newSentence = [...currentSentence];
                                    
                                    if (wordIndex === 1) {
                                      // For Union position, replace the verb
                                      newSentence[2] = option.word;
                                      // Reset the sentence to default completion
                                      newSentence[3] = "on";
                                      newSentence[4] = "Historic AI Ethics Framework, Charting Path for Responsible Technology Development";
                                      newSentence.splice(5);
                                    } else {
                                      newSentence[wordIndex + 1] = option.word;
                                      if (option.completion) {
                                        newSentence[wordIndex + 2] = option.completion;
                                        // Remove any words beyond the completion
                                        newSentence.splice(wordIndex + 3);
                                      }
                                    }
                                    setCurrentSentence(newSentence);
                                    setSelectedWord(null);
                                  }}
                                >
                                  <div className="text-xs font-medium mb-1 text-center text-green-800">
                                    {Math.random().toFixed(2)}
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
              </div>
            </div>

            {/* Right column - Evaluation panel */}
            <div className="lg:col-span-4" data-evaluation-panel>
              <EvaluationPanel />
            </div>
          </div>
        </div>
      </main>
      
      {/* PopoverSeries for evaluation tour */}
      {/* <PopoverSeries steps={popoverSteps} /> */}
    </div>;
}