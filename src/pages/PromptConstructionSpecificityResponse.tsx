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
    : "Give me a summary of the main points in the AI Act.";
  
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
                <>
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
                  
                  <div className="space-y-6">
                    <p className="text-lg font-medium text-gray-900 mb-4">Here&apos;s a summary of its main points:</p>
                    
                    <div>
                      <p className="text-base font-semibold text-gray-900 mb-2">Risk-Based Classification:</p>
                      <p className="text-gray-700 text-base leading-relaxed mb-3">AI systems are classified according to their risk level:</p>
                      <ul className="space-y-2 text-gray-700 ml-4">
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <div className="text-base leading-relaxed">
                            <strong>Unacceptable Risk:</strong> <TextFlag 
                              text="Prohibited, e.g., social scoring and manipulative AI." 
                              evaluationFactor="plagiarism" 
                              explanation="This sentence has been taken directly from the official summary of the AI Act and is listed without citation in this output."
                            />
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <p className="text-base leading-relaxed"><strong>High-Risk:</strong> Subject to strict regulation.</p>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <p className="text-base leading-relaxed"><strong>Limited Risk:</strong> Requires transparency to users, e.g., chatbots and deepfakes.</p>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <p className="text-base leading-relaxed"><strong>Minimal Risk:</strong> Mostly unregulated, e.g., AI-enabled video games and spam filters.</p>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-base font-semibold text-gray-900 mb-2">Obligations for Providers:</p>
                      <p className="text-gray-700 text-base leading-relaxed">The majority of obligations fall on providers (developers) of high-risk AI systems, including those outside the EU if their systems are used within the EU.</p>
                    </div>

                    <div>
                      <p className="text-base font-semibold text-gray-900 mb-2">User Responsibilities:</p>
                      <p className="text-gray-700 text-base leading-relaxed">Users (deployers) of high-risk AI systems have certain obligations, though less than providers.</p>
                    </div>

                    <div>
                      <p className="text-base font-semibold text-gray-900 mb-2">General Purpose AI (GPAI):</p>
                      <p className="text-gray-700 text-base leading-relaxed">Providers of GPAI models must provide technical documentation, instructions for use, comply with the Copyright Directive, and publish a summary of the training data used.</p>
                    </div>

                    <div>
                      <p className="text-base font-semibold text-gray-900 mb-2">Prohibited AI Systems:</p>
                      <p className="text-gray-700 text-base leading-relaxed">Certain types of AI systems are banned, including those that deploy subliminal techniques or exploit vulnerabilities related to age, disability, or socio-economic circumstances <a href="https://artificialintelligenceact.eu/high-level-summary/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://artificialintelligenceact.eu/high-level-summary/</a>.</p>
                    </div>

                    <p className="text-gray-700 text-base leading-relaxed">
                      The AI Act is part of a broader set of proposals to regulate digital services and aims to harmonize rules for AI development and usage while ensuring ethical safeguards and transparency. It&apos;s designed to become a global standard for AI regulation, similar to how GDPR has become for data protection <a href="https://www.adalovelaceinstitute.org/wp-content/Input Datas/2022/04/Expert-explainer-The-EU-AI-Act-11-April-2022.pdf" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://www.adalovelaceinstitute.org/wp-content/Input Datas/2022/04/Expert-explainer-The-EU-AI-Act-11-April-2022.pdf</a>.
                    </p>

                    <p className="text-gray-700 text-base leading-relaxed">
                      For a more detailed exploration, you can refer to the full text of the AI Act through the provided resources <a href="https://artificialintelligenceact.eu/high-level-summary/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://artificialintelligenceact.eu/high-level-summary/</a>.
                    </p>

                    <div className="mt-4 space-y-1">
                      <p className="text-sm text-gray-600"><a href="https://artificialintelligenceact.eu/high-level-summary/" className="hover:underline" target="_blank" rel="noopener noreferrer">https://artificialintelligenceact.eu/high-level-summary/</a></p>
                      <p className="text-sm text-gray-600"><a href="https://www.adalovelaceinstitute.org/wp-content/Input Datas/2022/04/Expert-explainer-The-EU-AI-Act-11-April-2022.pdf" className="hover:underline" target="_blank" rel="noopener noreferrer">https://www.adalovelaceinstitute.org/wp-content/Input Datas/2022/04/Expert-explainer-The-EU-AI-Act-11-April-2022.pdf</a></p>
                    </div>
                  </div>
                </>
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