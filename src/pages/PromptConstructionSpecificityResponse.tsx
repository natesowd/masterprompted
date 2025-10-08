import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EvaluationPanel from "@/components/EvaluationPanel";
import PromptControlsWithPrompt from "@/components/PromptControlsWithPrompt";
import TextFlag from "@/components/TextFlag";
export default function SpecificityResponse() {
  const navigate = useNavigate();
  const [bias, setBias] = useState("");
  const [appliedBias, setAppliedBias] = useState("");
  const [context, setContext] = useState("");
  const [appliedContext, setAppliedContext] = useState("");
  
  const handleApplyChanges = () => {
    setAppliedBias(bias);
    setAppliedContext(context);
  };
  
  // Input prompt changes immediately
  const inputPrompt = bias === "With Bias" 
    ? "Summarize how the EU AI Act stifles AI research"
    : context === "With Background"
    ? "Summarize the main points in the AI Act without bias."
    : "Summarize the main points in the AI Act.";
  
  // Output content only changes after Apply Changes is clicked
  const showBiasedOutput = appliedBias === "With Bias";
  const showWithBackgroundOutput = appliedContext === "With Background";
  const showBaseOutput = !appliedBias && !appliedContext;
  
  // Check if there are unapplied changes
  const hasUnappliedChanges = bias !== appliedBias || context !== appliedContext;
  
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="flex gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Sent Prompt and Controls */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Prompt Controls with Sent Prompt */}
            <PromptControlsWithPrompt 
              promptText={inputPrompt}
              showSpecificity={true} 
              showStyle={true} 
              showContext={true} 
              showBias={true}
              bias={bias}
              context={context}
              onBiasChange={setBias}
              onContextChange={setContext}
              onSubmit={handleApplyChanges}
              hasUnappliedChanges={hasUnappliedChanges}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Article Content with scroll */}
            <div className="bg-white rounded-lg rounded-b-none p-8 max-h-[600px] overflow-y-auto flex-1">
              
              {showBiasedOutput ? (
                // Biased content about EU AI Act stifling research
                <div className="space-y-4">
...
                  <p className="text-gray-800 leading-relaxed text-base mt-4">
                    👉 In short: while the EU AI Act is intended to ensure safety, transparency, and trust in AI, critics argue that its rigid structure, compliance burden, and uncertainty could discourage open research, slow down innovation, and push talent and investment out of Europe.
                  </p>
                </div>
              ) : showWithBackgroundOutput ? (
                // With Background content
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-base">
                    The AI Act is EU legislation regulating artificial intelligence systems, adopted in 2024.
                  </p>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Risk categorization:</p>
                    <p className="text-gray-700 text-base leading-relaxed mb-3">The Act divides AI systems into four categories based on assessed risk levels:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Unacceptable risk:</strong> Prohibited systems (social scoring by governments, exploitation of vulnerabilities)</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>High risk:</strong> Systems requiring compliance with specific obligations (AI in employment, law enforcement, credit scoring, critical infrastructure, education)</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Limited risk:</strong> Systems with transparency requirements (chatbots, deepfakes)</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Minimal risk:</strong> Systems with no specific requirements under the Act</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Requirements for high-risk systems:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Risk management processes</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Data governance standards for training data</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Technical documentation</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Transparency and information provision</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Human oversight capabilities</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Accuracy, robustness, and cybersecurity measures</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Conformity assessments before market placement</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Enforcement and scope:</p>
                    <p className="text-gray-700 text-base leading-relaxed">The Act establishes penalties for non-compliance and applies to providers and deployers of AI systems in the EU market regardless of their geographic location.</p>
                  </div>
                </div>
              ) : showBaseOutput ? (
                // Base output when all controls are "No Change"
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-base">
                    The AI Act is the EU&apos;s regulation for artificial intelligence, adopted in 2024. Here are the main points:
                  </p>

                  <p className="text-gray-700 text-base leading-relaxed">Risk-based approach: AI systems are categorized by risk level:</p>

                  <ul className="space-y-2 text-gray-700 ml-6 list-none">
                    <li className="text-base leading-relaxed">Unacceptable risk systems are banned (e.g., government social scoring, manipulative AI)</li>
                    <li className="text-base leading-relaxed">High-risk systems face strict requirements (e.g., AI in employment, law enforcement, credit scoring, critical infrastructure)</li>
                    <li className="text-base leading-relaxed">Limited risk systems need transparency (e.g., chatbots must disclose they&apos;re AI)</li>
                    <li className="text-base leading-relaxed">Minimal risk systems have few requirements</li>
                  </ul>

                  <p className="text-gray-700 text-base leading-relaxed mt-4">Requirements for high-risk AI:</p>

                  <ul className="space-y-2 text-gray-700 ml-6 list-none">
                    <li className="text-base leading-relaxed">Risk management throughout the system&apos;s lifecycle</li>
                    <li className="text-base leading-relaxed">High-quality training data to minimize bias</li>
                    <li className="text-base leading-relaxed">Technical documentation and record-keeping</li>
                    <li className="text-base leading-relaxed">Transparency about capabilities and limitations</li>
                    <li className="text-base leading-relaxed">Human oversight mechanisms</li>
                    <li className="text-base leading-relaxed">Robustness, accuracy, and cybersecurity</li>
                    <li className="text-base leading-relaxed">Conformity assessments before deployment</li>
                  </ul>

                  <p className="text-gray-700 text-base leading-relaxed mt-4">Scope: Applies to AI providers and deployers in the EU market, regardless of location.</p>

                  <p className="text-gray-700 text-base leading-relaxed mt-2">Goals: Protect fundamental rights and safety while promoting innovation and creating harmonized rules across EU member states.</p>
                </div>
              ) : (
                // Default content (No Background) - shown when context is selected but not applied
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-base">
                    <strong>Input:</strong> Summarize the main points in the AI Act.
                  </p>

                  <p className="text-gray-800 leading-relaxed text-base">
                    <strong>Output:</strong> The AI Act is the EU&apos;s regulation for artificial intelligence, adopted in 2024. Here are the main points:
                  </p>

                  <p className="text-gray-700 text-base leading-relaxed">Risk-based approach: AI systems are categorized by risk level:</p>

                  <ul className="space-y-2 text-gray-700 ml-6 list-none">
                    <li className="text-base leading-relaxed">Unacceptable risk systems are banned (e.g., government social scoring, manipulative AI)</li>
                    <li className="text-base leading-relaxed">High-risk systems face strict requirements (e.g., AI in employment, law enforcement, credit scoring, critical infrastructure)</li>
                    <li className="text-base leading-relaxed">Limited risk systems need transparency (e.g., chatbots must disclose they&apos;re AI)</li>
                    <li className="text-base leading-relaxed">Minimal risk systems have few requirements</li>
                  </ul>

                  <p className="text-gray-700 text-base leading-relaxed mt-4">Requirements for high-risk AI:</p>

                  <ul className="space-y-2 text-gray-700 ml-6 list-none">
                    <li className="text-base leading-relaxed">Risk management throughout the system&apos;s lifecycle</li>
                    <li className="text-base leading-relaxed">High-quality training data to minimize bias</li>
                    <li className="text-base leading-relaxed">Technical documentation and record-keeping</li>
                    <li className="text-base leading-relaxed">Transparency about capabilities and limitations</li>
                    <li className="text-base leading-relaxed">Human oversight mechanisms</li>
                    <li className="text-base leading-relaxed">Robustness, accuracy, and cybersecurity</li>
                    <li className="text-base leading-relaxed">Conformity assessments before deployment</li>
                  </ul>

                  <p className="text-gray-700 text-base leading-relaxed mt-4">Scope: Applies to AI providers and deployers in the EU market, regardless of location.</p>

                  <p className="text-gray-700 text-base leading-relaxed mt-2">Goals: Protect fundamental rights and safety while promoting innovation and creating harmonized rules across EU member states.</p>
                </div>
              )}
            </div>
            
            {/* Navigation Button - Fixed at bottom */}
            <div className="bg-white rounded-lg rounded-t-none p-8 pt-6">
              <Button 
                variant="secondary" 
                className="px-8 py-2 rounded-full"
                onClick={() => navigate("/module/prompt-construction/specificity/takeaways")}
              >
                Takeaways →
              </Button>
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