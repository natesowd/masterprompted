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
import SectionFlag from "@/components/SectionFlag";
export default function SpecificityResponse() {
  const navigate = useNavigate();
  const [bias, setBias] = useState("");
  const [appliedBias, setAppliedBias] = useState("");
  const [context, setContext] = useState("");
  const [appliedContext, setAppliedContext] = useState("");
  const [style, setStyle] = useState("");
  const [appliedStyle, setAppliedStyle] = useState("");
  const [specificity, setSpecificity] = useState("");
  const [appliedSpecificity, setAppliedSpecificity] = useState("");
  
  const handleApplyChanges = () => {
    setAppliedBias(bias);
    setAppliedContext(context);
    setAppliedStyle(style);
    setAppliedSpecificity(specificity);
  };
  
  // Input prompt changes immediately
  const inputPrompt = bias === "With Bias" 
    ? "Summarize how the EU AI Act stifles AI research"
    : bias === "No Bias"
    ? "Summarize the main points in the AI Act without bias."
    : context === "With Background"
    ? "I'm researching recent regulations on artificial intelligence. Please give me a summary of the main points in the AI Act, focusing on its key rules and how it aims to regulate AI systems."
    : style === "Instructional"
    ? "TDLR; EU AI Act"
    : style === "Conversational"
    ? "Can you give me a summary of the main points in the AI Act?"
    : specificity === "Specific"
    ? "Summarize the main points of the EU AI Act, including its risk categories and rules for high-risk AI systems"
    : specificity === "General"
    ? "Tell me about the AI Act."
    : "Summarize the main points in the AI Act.";
  
  // Output content only changes after Apply Changes is clicked
  const showBiasedOutput = appliedBias === "With Bias";
  const showNoBiasOutput = appliedBias === "No Bias";
  const showWithBackgroundOutput = appliedContext === "With Background";
  const showInstructionalOutput = appliedStyle === "Instructional";
  const showConversationalOutput = appliedStyle === "Conversational";
  const showSpecificOutput = appliedSpecificity === "Specific";
  const showGeneralOutput = appliedSpecificity === "General";
  const showBaseOutput = !appliedBias && !appliedContext && !appliedStyle && !appliedSpecificity;
  
  // Check if there are unapplied changes
  const hasUnappliedChanges = bias !== appliedBias || context !== appliedContext || style !== appliedStyle || specificity !== appliedSpecificity;
  
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="flex gap-6 max-w-[1400px] mx-auto">
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
              style={style}
              specificity={specificity}
              onBiasChange={setBias}
              onContextChange={setContext}
              onStyleChange={setStyle}
              onSpecificityChange={setSpecificity}
              onSubmit={handleApplyChanges}
              hasUnappliedChanges={hasUnappliedChanges}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Article Content with scroll */}
            <div className="bg-white rounded-lg rounded-b-none p-8 max-h-[600px] overflow-y-auto flex-1">
              
              {showGeneralOutput ? (
                // General content
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    The EU AI Act is a comprehensive regulation for artificial intelligence adopted by the European Union in 2024. It's the first major legal framework in the world specifically created to govern AI systems.
                  </p>
                  <p className="text-gray-800 leading-relaxed text-lg">
                    The Act organizes AI systems into risk categories. Some AI uses are completely prohibited, such as social scoring by governments or systems that manipulate people's behavior in harmful ways. High-risk AI systems - like those used in hiring, credit scoring, law enforcement, or critical infrastructure - face strict requirements around transparency, data quality, human oversight, and safety. Lower-risk systems mainly need to be transparent about being AI (like chatbots disclosing they're not human). Most AI applications are considered minimal risk and aren't heavily regulated.
                  </p>
                  <p className="text-gray-800 leading-relaxed text-lg">
                    The legislation aims to balance protecting people's rights and safety with encouraging AI innovation. It applies to companies and organizations that offer AI systems in the EU, no matter where they're located.
                  </p>
                </div>
              ) : showSpecificOutput ? (
                // Specific content - detailed summary
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    Sure! Here's a summary of the EU AI Act main points, including its risk categories and rules for high-risk AI systems:
                  </p>
                  
                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Overview of the EU AI Act</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      The EU AI Act is a regulatory framework proposed by the European Union to ensure the safe and trustworthy development, deployment, and use of artificial intelligence within the EU.
                      It aims to protect fundamental rights, promote innovation, and create a harmonized set of rules across member states.
                      The Act classifies AI systems based on their risk level and imposes requirements accordingly.
                    </p>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Risk Categories of AI Systems</p>
                    
                    <div className="ml-4 space-y-3">
                      <div>
                        <p className="text-base font-semibold text-gray-900">Unacceptable Risk</p>
                        <ul className="space-y-1 text-gray-700 ml-4 mt-1">
                          <li className="text-base leading-relaxed">AI systems that pose a clear threat to safety, fundamental rights, or people's well-being.</li>
                          <li className="text-base leading-relaxed">Examples: Social scoring by governments, systems that manipulate behavior causing harm, or exploit vulnerabilities of children or disabled people.</li>
                          <li className="text-base leading-relaxed">These are banned outright.</li>
                        </ul>
                      </div>

                      <div>
                        <p className="text-base font-semibold text-gray-900">High Risk</p>
                        <ul className="space-y-1 text-gray-700 ml-4 mt-1">
                          <li className="text-base leading-relaxed">AI systems that have significant potential to impact people's lives or rights.</li>
                          <li className="text-base leading-relaxed">Examples include AI used in:</li>
                          <ul className="ml-4 space-y-1">
                            <li className="text-base leading-relaxed">• Critical infrastructure (e.g., transport safety)</li>
                            <li className="text-base leading-relaxed">• Education or vocational training (affecting access/opportunities)</li>
                            <li className="text-base leading-relaxed">• Employment (recruitment, performance evaluation)</li>
                            <li className="text-base leading-relaxed">• Law enforcement and border control</li>
                            <li className="text-base leading-relaxed">• Access to essential services (e.g., credit scoring)</li>
                            <li className="text-base leading-relaxed">• Biometric identification and management of critical public functions</li>
                          </ul>
                          <li className="text-base leading-relaxed">These systems are subject to strict obligations before they can be placed on the market or put into service.</li>
                        </ul>
                      </div>

                      <div>
                        <p className="text-base font-semibold text-gray-900">Limited Risk</p>
                        <ul className="space-y-1 text-gray-700 ml-4 mt-1">
                          <li className="text-base leading-relaxed">AI systems with specific transparency obligations.</li>
                          <li className="text-base leading-relaxed">Users must be informed they are interacting with an AI system (e.g., chatbots).</li>
                        </ul>
                      </div>

                      <div>
                        <p className="text-base font-semibold text-gray-900">Minimal or No Risk</p>
                        <ul className="space-y-1 text-gray-700 ml-4 mt-1">
                          <li className="text-base leading-relaxed">Most AI systems fall here.</li>
                          <li className="text-base leading-relaxed">No specific legal requirements under the Act.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Rules for High-Risk AI Systems</p>
                    <p className="text-gray-700 text-base leading-relaxed mb-2">High-risk AI systems must comply with the following key requirements:</p>
                    
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="text-base leading-relaxed"><strong>Risk Management System:</strong> Developers must continuously identify, assess, and mitigate risks throughout the AI system's lifecycle.</li>
                      <li className="text-base leading-relaxed"><strong>Data Governance:</strong> Training, validation, and testing data must be relevant, representative, free of errors, and complete to minimize bias.</li>
                      <li className="text-base leading-relaxed"><strong>Documentation and Record-Keeping:</strong> Maintain technical documentation and logs to ensure traceability and facilitate compliance checks.</li>
                      <li className="text-base leading-relaxed"><strong>Transparency:</strong> Users must receive clear information about the system's capabilities, limitations, and intended use.</li>
                      <li className="text-base leading-relaxed"><strong>Human Oversight:</strong> Systems must be designed to allow meaningful human control to prevent or minimize risks.</li>
                      <li className="text-base leading-relaxed"><strong>Robustness, Accuracy, and Cybersecurity:</strong> Systems must perform consistently and reliably and be resilient against attempts to manipulate or attack them.</li>
                      <li className="text-base leading-relaxed"><strong>Conformity Assessment:</strong> Before market deployment, high-risk AI systems must undergo conformity assessments to verify compliance with the Act's requirements.</li>
                    </ul>
                  </div>
                </div>
              ) : showConversationalOutput ? (
                // Conversational content
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    Sure! The AI Act is the EU's comprehensive law regulating artificial intelligence, adopted in 2024. It's the first major legislation of its kind globally.
                  </p>
                  <p className="text-gray-800 leading-relaxed text-lg">
                    The Act works on a risk-based system. AI systems are grouped by how risky they are. Some AI uses are completely banned - things like government social scoring or AI that manipulates vulnerable people. High-risk AI (used in areas like hiring, law enforcement, credit decisions, or critical infrastructure) has to meet strict rules: good data governance, transparency about how it works, human oversight, and proper risk management.
                  </p>
                  <p className="text-gray-800 leading-relaxed text-lg">
                    AI with lower risks mainly needs to be transparent - like chatbots telling you they're AI. Most AI systems are minimal risk and don't have many requirements.
                  </p>
                  <p className="text-gray-800 leading-relaxed text-lg">
                    The goal is to keep people safe and protect their rights while still letting AI innovation happen. It applies to anyone who wants to use AI systems in the EU market, whether they're based in Europe or not.
                  </p>
                </div>
              ) : showInstructionalOutput ? (
                // Instructional content - TL;DR format
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    The AI Act is the EU's legislative proposal to regulate artificial intelligence.
                  </p>
                  <p className="text-base font-semibold text-gray-900">Here's the TL;DR:</p>
                  <SectionFlag 
                    evaluationFactor="relevance"
                    explanation="The writing here is short and minimal in information. This could be due to the succinct form of writing and/or the lack of context/specificity, but in anycase the LLM has had to decide itself what was relevant for the output."
                  >
                    <div className="space-y-2">
                      <p className="text-gray-700 text-base leading-relaxed">
                        <strong>Risk Categories:</strong> AI systems are sorted by risk levels, from high to minimal.
                      </p>
                      <p className="text-gray-700 text-base leading-relaxed">
                        • <strong>Regulations for High-Risk:</strong> Strict rules apply to AI in critical areas like healthcare and policing.
                      </p>
                    </div>
                  </SectionFlag>
                  <p className="text-gray-700 text-base leading-relaxed">
                    • <strong>Transparency:</strong> AI must be identifiable, and users informed when they interact with AI.
                  </p>
                  <p className="text-gray-700 text-base leading-relaxed">
                    • <strong>Bans on Certain AI:</strong> No AI that manipulates human behavior or violates rights.
                  </p>
                  <p className="text-gray-700 text-base leading-relaxed">
                    • <strong>Data and Bias:</strong> High-risk AI must use quality data to prevent discrimination.
                  </p>
                  <p className="text-gray-700 text-base leading-relaxed">
                    • <strong>Fines for Violations:</strong> Heavy penalties for non-compliance, up to 6% of annual turnover.
                  </p>
                  <p className="text-gray-800 leading-relaxed text-base mt-4">
                    It's designed to foster innovation while protecting individuals' rights and safety in the AI era.
                  </p>
                </div>
              ) : showBiasedOutput ? (
                // Biased content about EU AI Act stifling research
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    The EU AI Act is the world's first comprehensive legal framework for artificial intelligence, but critics argue that it could stifle AI research and innovation in several ways:
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
                        <p className="text-base leading-relaxed">Researchers fear it "locks in" today's categories of risk, making it harder to explore new methods without legal uncertainty.</p>
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
                        <p className="text-base leading-relaxed">Definitions of "high-risk" or "general-purpose" AI are broad and not always clear.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed">Labs may avoid entire research areas to reduce the risk of future legal liabilities.</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Slower Experimentation</p>
                    <p className="text-gray-700 text-base leading-relaxed">Requirements like human oversight, robustness testing, and bias auditing—though important for safety—could slow down iterative experimentation in early-stage research.</p>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Brain Drain & Investment Flight</p>
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
              ) : showNoBiasOutput ? (
                // No Bias content
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-lg">
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
              ) : showWithBackgroundOutput ? (
                // With Background content
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    <TextFlag 
                      text="Certainly!" 
                      evaluationFactor="voice"
                      explanation="A prompt written in human-like language encourages a human-like response. This can lead to a more plausible sounding output than in reality."
                    /> Here&apos;s an updated summary of the EU AI Act, focusing on its key rules and how it aims to regulate AI systems:
                  </p>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-3">
                      <TextFlag 
                        text="🧠" 
                        evaluationFactor="voice"
                        explanation="The use of emojis here indicates that either the LLM used a default persona that is more informal, or it has decided it is appropriate due to the human-like interaction style. Either way, this can be controlled via prompts."
                      /> Overview of the EU AI Act
                    </p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      The EU Artificial Intelligence Act (AI Act) is the first comprehensive legal framework for AI regulation globally. Adopted in 2024, it aims to ensure that AI systems in the EU are safe, transparent, and respect fundamental rights. The Act employs a risk-based approach, imposing varying levels of obligations depending on the potential impact of AI systems (<a href="https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Digital Strategy</a>).
                    </p>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">⚖️ Risk-Based Classification of AI Systems</p>
                    <p className="text-gray-700 text-base leading-relaxed mb-3">The Act categorizes AI systems into four risk levels:</p>
                    <ul className="space-y-3 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Unacceptable Risk:</strong> AI systems that pose a clear threat to safety, fundamental rights, or people&apos;s well-being are prohibited. Examples include social scoring by governments and real-time remote biometric identification in public spaces.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div className="text-base leading-relaxed">
                          <p className="mb-2"><strong>High Risk:</strong> AI systems that have <TextFlag 
                            text="significant" 
                            evaluationFactor="bias"
                            explanation="Although the AI Act may be regarded as &quot;significant,&quot; an LLM cannot determine such judgments. The linguistic choices of an LLM output can dangerously shape a user's interpretation."
                          /> potential to impact people&apos;s lives or rights. These include AI used in:</p>
                          <ul className="ml-4 space-y-1">
                            <li>• Critical infrastructure (e.g., transport safety)</li>
                            <li>• Education or vocational training</li>
                            <li>• Employment (e.g., recruitment, performance evaluation)</li>
                            <li>• Law enforcement and border control</li>
                            <li>• Access to essential services (e.g., credit scoring)</li>
                            <li>• Biometric identification and management of critical public functions</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Limited Risk:</strong> AI systems with specific transparency obligations. Users must be informed they are interacting with an AI system (e.g., chatbots).</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Minimal or No Risk:</strong> Most AI systems fall into this category and are not subject to specific legal requirements under the Act.</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">🛡️ Rules for High-Risk AI Systems</p>
                    <p className="text-gray-700 text-base leading-relaxed mb-3">High-risk AI systems are subject to strict obligations before they can be placed on the market or put into service:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Risk Management System:</strong> Developers must continuously identify, assess, and mitigate risks throughout the AI system&apos;s lifecycle.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Data Governance:</strong> Training, validation, and testing data must be relevant, representative, free of errors, and complete to minimize bias.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Documentation and Record-Keeping:</strong> Maintain technical documentation and logs to ensure traceability and facilitate compliance checks.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Transparency:</strong> Users must receive clear information about the system&apos;s capabilities, limitations, and intended use.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Human Oversight:</strong> Systems must be designed to allow meaningful human control to prevent or minimize risks.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Robustness, Accuracy, and Cybersecurity:</strong> Systems must perform consistently and reliably and be resilient against attempts to manipulate or attack them.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Conformity Assessment:</strong> Before market deployment, high-risk AI systems must undergo conformity assessments to verify compliance with the Act&apos;s requirements.</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">📅 Implementation Timeline</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>1 August 2024:</strong> The AI Act entered into force.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>2 August 2026:</strong> Rules for high-risk AI systems (Annex III) become applicable.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>2 August 2027:</strong> Rules for high-risk AI systems (Annex I) become applicable.</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">⚖️ Enforcement and Penalties</p>
                    <p className="text-gray-700 text-base leading-relaxed mb-3">The AI Act establishes robust enforcement mechanisms:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Market Surveillance:</strong> National authorities can withdraw or prohibit non-compliant AI systems.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p className="text-base leading-relaxed"><strong>Post-Market Monitoring:</strong> Providers must establish systems to continually assess AI performance and compliance post-deployment.</p>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div className="text-base leading-relaxed">
                          <p className="mb-2"><strong>Fines:</strong> Non-compliance can result in significant fines:</p>
                          <ul className="ml-4 space-y-1">
                            <li>• Up to €35 million or 7% of global annual turnover for the most serious infringements</li>
                            <li>• Up to €15 million or 3% of global annual turnover for other violations</li>
                            <li>• Up to €7.5 million or 1.5% of global annual turnover for providing incorrect information to authorities</li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">🌐 Global Impact</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      The EU AI Act positions the EU as a global leader in AI regulation, promoting an ethical and human-centric approach. It aims to balance innovation with public safety and rights protection, setting a benchmark for international AI standards and potentially influencing global norms in AI governance.
                    </p>
                  </div>
                </div>
              ) : showBaseOutput ? (
                // Base output when all controls are "No Change"
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    <TextFlag 
                      text="Certainly!" 
                      evaluationFactor="voice"
                      explanation="A prompt written in human-like language encourages a human-like response. This can lead to a more plausible sounding output than in reality."
                    /> The AI Act is a <TextFlag 
                      text="significant" 
                      evaluationFactor="bias"
                      explanation="Although the AI Act may be regarded as &quot;significant,&quot; an LLM cannot determine such judgments. The linguistic choices of an LLM output can dangerously shape a user's interpretation."
                    /> piece of legislation aimed at regulating artificial intelligence within the European Union. Here&apos;s a summary of its main points:
                  </p>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Risk-Based Classification:</p>
                    <p className="text-gray-700 text-base leading-relaxed mb-2">AI systems are classified according to their risk level:</p>
                    <ul className="space-y-2 text-gray-700 ml-6 list-disc">
                      <li className="text-base leading-relaxed"><strong>Unacceptable Risk:</strong> <TextFlag 
                        text="Prohibited, e.g., social scoring and manipulative AI." 
                        evaluationFactor="plagiarism"
                        explanation="This sentence has been taken directly from the official summary of the AI Act and is listed without citation in this output."
                      /></li>
                      <li className="text-base leading-relaxed"><strong>High-Risk:</strong> Subject to strict regulation.</li>
                      <li className="text-base leading-relaxed"><strong>Limited Risk:</strong> Requires transparency to users, e.g., chatbots and deepfakes.</li>
                      <li className="text-base leading-relaxed"><strong>Minimal Risk:</strong> Mostly unregulated, e.g., AI-enabled video games and spam filters.</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Obligations for Providers:</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      The majority of obligations fall on providers (developers) of high-risk AI systems, including those outside the EU if their systems are used within the EU.
                    </p>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">User Responsibilities:</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Users (deployers) of high-risk AI systems have certain obligations, though less than providers.
                    </p>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">General Purpose AI (GPAI):</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Providers of GPAI models must provide technical documentation, instructions for use, comply with the Copyright Directive, and publish a summary of the training data used.
                    </p>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">Prohibited AI Systems:</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Certain types of AI systems are banned, including those that deploy subliminal techniques or exploit vulnerabilities related to age, disability, or socio-economic circumstances.
                    </p>
                  </div>

                  <p className="text-gray-700 text-base leading-relaxed">
                    The AI Act is part of a broader set of proposals to regulate digital services and aims to harmonize rules for AI development and usage while ensuring ethical safeguards and transparency. It&apos;s designed to become a global standard for AI regulation, similar to how GDPR has become for data protection.
                  </p>

                  <p className="text-gray-700 text-base leading-relaxed">
                    For a more detailed exploration, you can refer to the full text of the AI Act through the provided resources.
                  </p>
                </div>
              ) : (
                // Default content (No Background) - shown when context is selected but not applied
                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed text-lg">
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