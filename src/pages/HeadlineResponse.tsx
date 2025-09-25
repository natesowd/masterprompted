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
                    <div className="absolute inset-0 z-10 pointer-events-none" style={{ transform: `translate(${selectedWord === "on" ? "-20px" : "-100px"}, -30px)` }}>
                      <div className="relative w-full h-full">
                        {wordAlternatives[selectedWord as keyof typeof wordAlternatives].map((alt, index) => {
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
                                onClick={() => setSelectedWord(null)}
                              >
                                <div className="text-xs font-medium mb-1 text-center text-green-800">
                                  {alt.probability.toFixed(2)}
                                </div>
                                <div className="text-sm font-semibold text-center">
                                  {alt.word}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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