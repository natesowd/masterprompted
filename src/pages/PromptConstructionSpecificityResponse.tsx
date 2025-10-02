import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EvaluationPanel from "@/components/EvaluationPanel";
import ChatPrompt from "@/components/ChatPrompt";
import PromptControls from "@/components/PromptControls";
import TextFlag from "@/components/TextFlag";
export default function SpecificityResponse() {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="flex gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Sent Prompt and Controls */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Sent Prompt */}
            <ChatPrompt text="Give me a summary of the main points in the AI Act." fileName="EU_AI_Act.pdf" />
            
            {/* Prompt Controls */}
            <PromptControls showSpecificity={true} showStyle={true} showContext={true} showBias={true} />
            
            {/* Modify Prompt Button */}
            
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Article Content */}
            <div className="bg-white rounded-lg p-8">
              
              
              <div className="mb-6">
                <p className="text-gray-800 leading-relaxed mb-4 text-base">
                  <TextFlag 
                    text="Certainly!" 
                    evaluationFactor="voice" 
                    explanation="A prompt written in human-like language encourages a human-like response. This can lead to a more plausible sounding output than in reality."
                  /> The AI Act is a <TextFlag
                    text="significant" 
                    evaluationFactor="bias" 
                    explanation="Although the AI Act may be regarded as &quot;significant,&quot; an LLM cannot determine such judgments. The linguistic choices of an LLM output can dangerously shape a user's interpretation."
                  /> piece of legislation aimed at regulating artificial intelligence within the European Union.
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-900 mb-4">Here&apos;s a summary of its main points:</p>
                
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <p className="text-base leading-relaxed">
                      <strong>Risk-Based Classification:</strong> AI systems are classified according to their risk level:
                    </p>
                  </li>
                  
                  <li className="flex items-start ml-6">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <p className="text-base leading-relaxed">
                      <strong>Unacceptable Risk:</strong> Prohibited, e.g., social scoring and manipulative AI.
                    </p>
                  </li>
                  
                  <li className="flex items-start ml-6">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <p className="text-base leading-relaxed">
                      <strong>High-Risk:</strong> Subject to strict regulation.
                    </p>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <p className="text-base leading-relaxed">...</p>
                  </li>
                </ul>
              </div>
              
              {/* Navigation */}
              <div className="mt-12 flex justify-start items-center">
                <Button 
                  variant="secondary" 
                  className="px-8 py-2 rounded-full"
                  onClick={() => navigate("/module/prompt-construction/specificity/takeaways")}
                >
                  Takeaways →
                </Button>
              </div>
              
            </div>
          </div>

          {/* Right Sidebar - Journalistic Evaluation */}
          <div className="w-80 flex-shrink-0">
            <EvaluationPanel />
          </div>
        </div>
        
        {/* Full Width Note */}
        <div className="mt-6 text-sm text-gray-500 max-w-7xl mx-auto">
          Note: To optimise prompts and generate outputs Llama 3.1 8B is used.
        </div>
      </main>
      
      <ModuleNavigation 
        previousRoute="/module/prompt-construction/summarize" 
        nextRoute="/module/prompt-construction/specificity/takeaways"
      />
    </div>;
}