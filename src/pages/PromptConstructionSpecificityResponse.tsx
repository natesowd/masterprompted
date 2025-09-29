import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import EvaluationPanel from "@/components/EvaluationPanel";
import SentPrompt from "@/components/SentPrompt";
export default function SpecificityResponse() {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(true);
  const [isSpecific, setIsSpecific] = useState(false);
  const handleReset = () => {
    setIsSpecific(false);
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="flex gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Prompt Controls */}
          <div className="w-64 flex-shrink-0">
            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  
                  <h3 className="font-semibold text-gray-900">Prompt Controls</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Prompt Specificity</h4>
                    
                    <div className="relative">
                      {/* Tooltip */}
                      {showTooltip && <div className="absolute top-8 -right-56 z-10">
                          <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-lg text-sm w-48" style={{
                        borderRadius: '8px',
                        padding: '12px 16px'
                      }}>
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-xs leading-relaxed">
                                First, select this option for the prompt to become more specific
                              </p>
                              <Button variant="secondary" size="sm" onClick={() => setShowTooltip(false)} className="h-5 px-2 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30">
                                Close
                              </Button>
                            </div>
                            {/* Arrow pointing left to "Specific" button */}
                            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2">
                              <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-emerald-600"></div>
                            </div>
                          </div>
                        </div>}
                      
                      {/* Binary Selector */}
                      <div className="flex bg-gray-100 rounded-full p-1">
                        <button onClick={() => setIsSpecific(false)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${!isSpecific ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                          General
                        </button>
                        <button onClick={() => setIsSpecific(true)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${isSpecific ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                          Specific
                        </button>
                      </div>
                    </div>
                    
                    <Button onClick={handleReset} variant="ghost" size="sm" className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50">
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Original Prompt Display */}
            <div className="mb-6">
              <SentPrompt text="Summarize the main points of the EU AI Act, including its risk categories and rules for high-risk AI systems" fileName="EU_AI_Act.pdf" />
            </div>

            {/* AI Response */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview of the EU AI Act:</h2>
              
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    The EU AI Act is a regulatory framework proposed by the European Union to ensure the safe and trustworthy development, deployment, and use of artificial intelligence within the EU.
                  </span>
                </li>
                
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    It aims to protect fundamental rights, promote innovation, and create a harmonized set of rules across member states.
                  </span>
                </li>
                
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    The Act classifies AI systems based on their risk level and imposes requirements accordingly.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Sidebar - Journalistic Evaluation */}
          <div className="w-80 flex-shrink-0">
            <EvaluationPanel />
          </div>
        </div>
      </main>
    </div>;
}