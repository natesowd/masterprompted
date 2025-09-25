import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import SentPrompt from "@/components/SentPrompt";
import { PopoverSeries } from "@/components/PopoverSeries";
import { useState } from "react";

export default function HeadlineResponse() {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  const wordAlternatives = {
    "Unites": [
      { word: "Agrees", probability: 0.31 },
      { word: "Converges", probability: 0.56 },
      { word: "Aligns", probability: 0.03 }
    ],
    "on": [
      { word: "around", probability: 0.03 },
      { word: "regarding", probability: 0.56 },
      { word: "concerning", probability: 0.31 }
    ]
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
                    European Union{" "}
                    <span 
                      className="relative group cursor-pointer transition-colors duration-200 hover:bg-green-200 hover:px-1 hover:rounded"
                      onClick={() => setSelectedWord(selectedWord === "Unites" ? null : "Unites")}
                      onMouseEnter={(e) => {
                        const randomNum = (Math.random()).toFixed(2);
                        e.currentTarget.setAttribute('data-score', randomNum);
                      }}
                    >
                      Unites
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        {typeof window !== 'undefined' && Math.random().toFixed(2)}
                      </span>
                    </span>{" "}
                    <span 
                      className="relative group cursor-pointer transition-colors duration-200 hover:bg-green-200 hover:px-1 hover:rounded"
                      onClick={() => setSelectedWord(selectedWord === "on" ? null : "on")}
                      onMouseEnter={(e) => {
                        const randomNum = (Math.random()).toFixed(2);
                        e.currentTarget.setAttribute('data-score', randomNum);
                      }}
                    >
                      on
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        {typeof window !== 'undefined' && Math.random().toFixed(2)}
                      </span>
                    </span>{" "}
                    Historic AI Ethics Framework, Charting Path for Responsible Technology Development
                  </h1>
                  
                  {/* Word alternatives popup */}
                  {selectedWord && (
                    <div className="absolute top-full mt-4 left-0 z-10">
                      <div className="flex flex-col space-y-2">
                        {wordAlternatives[selectedWord as keyof typeof wordAlternatives].map((alt, index) => (
                          <div key={index} className="relative">
                            {/* Connecting line */}
                            <svg 
                              className="absolute -top-2 left-4 w-32 h-8" 
                              style={{ 
                                transform: `translateX(${index * 60}px) translateY(-${20 + index * 10}px)` 
                              }}
                            >
                              <path 
                                d={`M 0,20 Q 20,${10 - index * 5} 40,0`} 
                                stroke="#10b981" 
                                strokeWidth="2" 
                                fill="none"
                              />
                            </svg>
                            
                            {/* Alternative word bubble */}
                            <div 
                              className="bg-green-200 text-green-800 px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-green-300 transition-colors duration-200"
                              style={{ 
                                transform: `translateX(${index * 80}px) translateY(-${30 + index * 15}px)` 
                              }}
                              onClick={() => setSelectedWord(null)}
                            >
                              <div className="text-xs font-medium mb-1">
                                {alt.probability.toFixed(2)}
                              </div>
                              <div className="text-sm font-semibold">
                                {alt.word}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Background overlay to close popup */}
                      <div 
                        className="fixed inset-0 -z-10" 
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