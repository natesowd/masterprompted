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
  
  const handleApplyChanges = () => {
    setAppliedBias(bias);
  };
  
  // Input prompt changes immediately
  const inputPrompt = bias === "With Bias" 
    ? "Summarize how the EU AI Act stifles AI research"
    : "Summarize the main points in the AI Act without bias.";
  
  // Output content only changes after Apply Changes is clicked
  const showBiasedOutput = appliedBias === "With Bias";
  
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
              onBiasChange={setBias}
              onSubmit={handleApplyChanges}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Article Content with scroll */}
            <div className="bg-white rounded-lg rounded-b-none p-8 max-h-[600px] overflow-y-auto flex-1">
              
              {showBiasedOutput ? (
                // Biased content about EU AI Act stifling research
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-base">
                    The EU AI Act is the world&apos;s first comprehensive legal framework for artificial intelligence, but critics argue that it could stifle AI research and innovation in several ways:
                  </p>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">High Compliance Costs</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Researchers and startups may face heavy administrative and technical burdens (e.g., documentation, conformity assessments, transparency obligations).</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">This favors large corporations with legal and compliance teams, while discouraging small labs and academic projects.</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Regulation Before Maturity</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">The Act imposes strict rules even though many AI techniques are still experimental.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Researchers fear it &quot;locks in&quot; today&apos;s categories of risk, making it harder to explore new methods without legal uncertainty.</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Chilling Effect on Open Source</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Open-source AI models may fall under obligations (such as transparency on training data and design choices) that individual researchers cannot realistically meet.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">This could push innovation away from Europe toward regions with lighter regulation.</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Ambiguity and Legal Uncertainty</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Definitions of &quot;high-risk&quot; or &quot;general-purpose&quot; AI are broad and not always clear.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Labs may avoid entire research areas to reduce the risk of future legal liabilities.</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Slower Experimentation</p>
                    <p className="text-gray-700 text-base leading-relaxed ml-4">Requirements like human oversight, robustness testing, and bias auditing—though important for safety—could slow down iterative experimentation in early-stage research.</p>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Brain Drain &amp; Investment Flight</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Researchers and startups may relocate to the U.S., U.K., or Asia, where the regulatory environment is more flexible.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Investors might shy away from European AI ventures because of the added legal risks.</p>
                      </li>
                    </ul>
                  </div>

                  <p className="text-gray-800 leading-relaxed text-base mt-4">
                    👉 In short: while the EU AI Act is intended to ensure safety, transparency, and trust in AI, critics argue that its rigid structure, compliance burden, and uncertainty could discourage open research, slow down innovation, and push talent and investment out of Europe.
                  </p>
                </div>
              ) : (
                // Default content
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