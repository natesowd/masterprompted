import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EvaluationPanel from "@/components/EvaluationPanel";
import PromptControls from "@/components/PromptControls";
import { Parameters } from "@/pages/PromptPlayground";
import TextFlag from "@/components/TextFlag";
import SectionFlag from "@/components/SectionFlag";
import ChatPrompt from "@/components/ChatPrompt";
import FeatureHighlight from "@/components/FeatureHighlight";
import { ArrowRight } from "lucide-react";

import { set } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SpecificityResponse() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [bias, setBias] = useState("");
  const [appliedBias, setAppliedBias] = useState("");
  const [context, setContext] = useState("");
  const [appliedContext, setAppliedContext] = useState("");
  const [style, setStyle] = useState("");
  const [appliedStyle, setAppliedStyle] = useState("");
  const [specificity, setSpecificity] = useState("");
  const [appliedSpecificity, setAppliedSpecificity] = useState("");
  const [biasUnlocked, setBiasUnlocked] = useState(false);
  const [showBiasHighlight, setShowBiasHighlight] = useState(false);
  const [showBiasPromptHighlight, setShowBiasPromptHighlight] = useState(false);
  const [showLessBiasPromptHighlight, setShowLessBiasPromptHighlight] = useState(false);
  const [moreBiasPromptShown, setMoreBiasPromptShown] = useState(false);
  const [lessBiasPromptShown, setLessBiasPromptShown] = useState(false);


  // Input prompt changes immediately
  const inputPrompt = bias === t("components.promptControls.bias.right") ?
  "Summarize how the EU AI Act stifles AI research." :
  bias === t("components.promptControls.bias.left") ?
  "Does the EU AI Act stifle AI research?" :
  context === t("components.promptControls.context.right") ?
  "I'm researching recent regulations on artificial intelligence. Please give me a summary of the main points in the AI Act, focusing on its key rules and how it aims to regulate AI systems." :
  context === t("components.promptControls.context.left") ?
  "Summarize the main points in the AI Act." :
  style === t("components.promptControls.conversationStyle.right") ?
  "TDLR; EU AI Act" :
  style === t("components.promptControls.conversationStyle.left") ?
  "Can you give me a summary of the main points in the AI Act?" :
  specificity === t("components.promptControls.specificity.right") ?
  "Summarize the main points of the EU AI Act, including its risk categories and rules for high-risk AI systems" :
  specificity === t("components.promptControls.specificity.left") ?
  "Tell me about the AI Act." :
  "Give me a summary of the main points in the AI Act.";

  // Output content only changes after Apply Changes is clicked
  const showBiasedOutput = appliedBias === t("components.promptControls.bias.right");
  const showNoBiasOutput = appliedBias === t("components.promptControls.bias.left");
  const showWithBackgroundOutput = appliedContext === t("components.promptControls.context.right");
  const showNoBackgroundOutput = appliedContext === t("components.promptControls.context.left");
  const showInstructionalOutput = appliedStyle === t("components.promptControls.conversationStyle.right");
  const showConversationalOutput = appliedStyle === t("components.promptControls.conversationStyle.left");
  const showSpecificOutput = appliedSpecificity === t("components.promptControls.specificity.right");
  const showGeneralOutput = appliedSpecificity === t("components.promptControls.specificity.left");
  const showBaseOutput = !appliedBias && !appliedContext && !appliedStyle && !appliedSpecificity;
  const [sentPrompt, setSentPrompt] = useState(inputPrompt);
  const biasTextFlagRef = useRef<HTMLDivElement>(null);

  const handleApplyChanges = () => {
    setAppliedBias(bias);
    setAppliedContext(context);
    setAppliedStyle(style);
    setAppliedSpecificity(specificity);
    setSentPrompt(inputPrompt);
  };

  // Scroll to TextFlag area when bias output is shown
  useEffect(() => {
    if ((showBiasedOutput || showNoBiasOutput) && biasTextFlagRef.current) {
      setTimeout(() => {
        biasTextFlagRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showBiasedOutput, showNoBiasOutput]);

  const handleParameterChange = (key: keyof Parameters, value: string) => {
    if (key === 'bias') setBias(value);
    if (key === 'context') setContext(value);
    if (key === 'style') setStyle(value);
    if (key === 'specificity') setSpecificity(value);
  };

  // Check if there are unapplied changes
  const hasUnappliedChanges = bias !== appliedBias || context !== appliedContext || style !== appliedStyle || specificity !== appliedSpecificity;

  return <div className="min-h-screen bg-white flex flex-col">
    <Header />

    <main className="flex-1 flex flex-col">
      <div className="flex-1 flex justify-center">
        <div className="flex flex-col">
          {/* Breadcrumb for 2xl - starts at controls, not bound by column */}
          <div className="hidden 2xl:block pt-6 pb-5">
            <Breadcrumb />
          </div>

          {/* Three column layout */}
          <div className="flex flex-1">
            {/* Left Sidebar - Prompt Controls with grey background extending full height */}
            <div className="w-80 flex-shrink-0 bg-surface-200 2xl:bg-transparent 2xl:pb-4 flex items-start justify-center">
              <div className="w-[264px] pt-6 pb-4 2xl:pt-0 2xl:pb-0 2xl:bg-card 2xl:border 2xl:border-border 2xl:rounded-lg 2xl:shadow-sm 2xl:overflow-hidden 2xl:w-72">
                <PromptControls
                  chatValue={inputPrompt}
                  showSpecificity={true}
                  showStyle={true}
                  showContext={true}
                  showBias={true}
                  enableSpecificity={!biasUnlocked}
                  enableStyle={!biasUnlocked}
                  enableContext={!biasUnlocked}
                  enableBias={biasUnlocked}
                  parameters={{
                    bias,
                    context,
                    style,
                    specificity
                  }}
                  onParameterChange={(key, value) => {
                    setSpecificity(key === 'specificity' ? value : "");
                    setStyle(key === 'style' ? value : "");
                    setContext(key === 'context' ? value : "");
                    setBias(key === 'bias' ? value : "");
                    if (key === 'bias' && value === t("components.promptControls.bias.right") && !moreBiasPromptShown) {
                      setShowBiasPromptHighlight(true);
                      setMoreBiasPromptShown(true);
                    }
                    if (key === 'bias' && value === t("components.promptControls.bias.left") && !lessBiasPromptShown) {
                      setShowLessBiasPromptHighlight(true);
                      setLessBiasPromptShown(true);
                    }
                  }}
                  onOptimize={handleApplyChanges}
                  readOnly={true}
                  hideChatSubmitButton={true}
                  disableOptimize={!hasUnappliedChanges}
                  disableSend={true}
                  files={[{ name: "EU_AI_Act.pdf" }]} />

              </div>
            </div>

            {/* Right content area */}
            <div className="flex-initial flex flex-col px-6 py-6 2xl:pt-0 items-start">
              <div className="w-full max-w-[1100px] 2xl:hidden">
                <Breadcrumb />
                <div className="mb-5"></div>
              </div>
              <div className="flex gap-6 max-w-[1100px] w-full">

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                  {/* Article Content with scroll */}
                  <div className="bg-white rounded-lg rounded-b-none p-8 flex-1 flex flex-col">
                    <ChatPrompt text={sentPrompt} fileName="EU_AI_Act.pdf" />
                    <div className="max-h-[500px] overflow-y-auto flex-1">
                      {showGeneralOutput ?
                      // General content
                      <div className="space-y-4">
                          <p className="text-gray-800 leading-relaxed text-base">
                            The EU AI Act is a comprehensive regulation for artificial intelligence <TextFlag
                            text="adopted by the European Union in 2024."
                            evaluationFactor="relevance"
                            explanation={t("components.textFlag.content.relevance2")} />
                            It's the first major legal framework in the world specifically created to govern AI systems.
                          </p>
                          <p className="text-gray-800 leading-relaxed text-base">
                            <TextFlag
                            text="The Act organizes AI systems into risk categories."
                            evaluationFactor="relevance"
                            explanation={t('components.textFlag.content.general_simplicity')} />
                            Some AI uses are completely prohibited, such as social scoring by governments or systems that manipulate people's behavior in harmful ways. High-risk AI systems - like those used in hiring, credit scoring, law enforcement, or critical infrastructure - face strict requirements around transparency, data quality, human oversight, and safety. Lower-risk systems mainly need to be transparent about being AI (like chatbots disclosing they're not human). Most AI applications are considered minimal risk and aren't heavily regulated.
                          </p>
                          <p className="text-gray-800 leading-relaxed text-base">
                            The legislation aims to balance protecting people's rights and safety with encouraging AI innovation. It applies to companies and organizations that offer AI systems in the EU, no matter where they're located.
                          </p>
                        </div> :
                      showSpecificOutput ?
                      // Specific content - detailed summary
                      <div className="space-y-4">
                            <p className="text-gray-800 leading-relaxed text-base">
                              <TextFlag
                            text="Sure!"
                            evaluationFactor="voice"
                            explanation={t("components.textFlag.content.voice1")} />
                              Here's a summary of the EU AI Act main points, including its risk categories and rules for high-risk AI systems:
                            </p>

                            <div>
                              <p className="text-base font-semibold text-gray-900 mb-2">Overview of the EU AI Act</p>
                              <p className="text-gray-700 text-base leading-relaxed">
                                The EU AI Act is a regulatory framework proposed by the European Union to ensure the safe and trustworthy development, deployment, and use of artificial intelligence within the EU.
                                It aims to protect fundamental rights, promote innovation, and create a harmonized set of rules across member states.
                                The Act classifies AI systems based on their risk level and imposes requirements accordingly.
                              </p>
                            </div>

                            <SectionFlag
                          evaluationFactor="relevance"
                          explanation={t('components.textFlag.content.relevance3')}>

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
                            </SectionFlag>

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
                          </div> :
                      showConversationalOutput ?
                      // Conversational content
                      <div className="space-y-4">
                              <p className="text-gray-800 leading-relaxed text-base">
                                <TextFlag
                            text="Sure!"
                            evaluationFactor="voice"
                            explanation={t("components.textFlag.content.voice1")} />
                                The AI Act is the EU's comprehensive law regulating artificial intelligence, <TextFlag
                            text="adopted in 2024."
                            evaluationFactor="relevance"
                            explanation={t("components.textFlag.content.relevance2")} />
                                It's the first major legislation of its kind globally.
                              </p>
                              <p className="text-gray-800 leading-relaxed text-base">
                                The Act works on a risk-based system. AI systems are grouped by how risky they are. Some AI uses are completely banned - things like government social scoring or AI that manipulates vulnerable people. High-risk AI (used in areas like hiring, law enforcement, credit decisions, or critical infrastructure) has to meet strict rules: good data governance, transparency about how it works, human oversight, and proper risk management.
                              </p>
                              <p className="text-gray-800 leading-relaxed text-base">
                                AI with lower risks mainly needs to be transparent - <TextFlag
                            text="like chatbots telling you they're AI."
                            evaluationFactor="voice"
                            explanation={t('components.textFlag.content.voice2')} />
                                Most AI systems are minimal risk and don't have many requirements.
                              </p>
                              <p className="text-gray-800 leading-relaxed text-base">
                                The goal is to keep people safe and protect their rights while still letting AI innovation happen. It applies to anyone who wants to use AI systems in the EU market, whether they're based in Europe or not.
                              </p>
                            </div> :
                      showInstructionalOutput ?
                      // Instructional content - TL;DR format
                      <div className="space-y-4">
                                <p className="text-gray-800 leading-relaxed text-base">
                                  The AI Act is the EU's legislative proposal to regulate artificial intelligence.
                                </p>
                                <p className="text-base font-semibold text-gray-900">Here's the TL;DR:</p>
                                <SectionFlag
                          evaluationFactor="relevance"
                          explanation={t("components.textFlag.content.relevance4")}>

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
                              </div> :
                      showBiasedOutput ?
                      // Biased content about EU AI Act stifling research
                      <div className="space-y-4">




                                  




                                  




                                  



                                  <p ref={biasTextFlagRef} className="text-gray-800 leading-relaxed text-base">
                                    <TextFlag
                            text="The EU AI Act, a proposed regulation aimed at regulating artificial intelligence (AI) in the European Union, has been criticized for potentially stifling AI research."
                            evaluationFactor="bias"
                            explanation="Output's voice mimics the certainty and the suggestiveness of a biased and commanding prompt, confirming the expressed belief. The unquestioning, certain tone could cause a false sense of output's trustworthiness. Some users called this confirmatory style of the output &quot;people pleasing&quot;." />
                                    {' '}Here&apos;s a summary of the concerns:
                                  </p>

                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-base font-semibold text-gray-900 mb-2"><TextFlag text="1. Overly broad definitions" evaluationFactor="bias" explanation="Output goes on to one-sidedly represent the topic in question. It reinforces confirmation bias by presenting information that are strictly in line with the biased prompt, i.e. with user's prior beliefs. Such outputs could be factually inaccurate as well." noUnderline /></p>
                                        <p className="text-gray-700 text-base leading-relaxed">
                                          The Act defines AI as any system that can &quot;perceive its environment and take actions&quot; or &quot;make decisions autonomously.&quot; This broad definition could capture many AI systems that are not necessarily &quot;autonomous&quot; or &quot;perceive their environment&quot; in the classical sense, potentially stifling innovation.
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-base font-semibold text-gray-900 mb-2">2. Restrictive liability provisions</p>
                                        <p className="text-gray-700 text-base leading-relaxed">
                                          <TextFlag
                                            text="The Act proposes to hold AI developers liable for damages caused by their AI systems"
                                            evaluationFactor="factual_accuracy"
                                            explanation="These liability provisions are not contained in the AI Act itself; they are addressed by complementary proposals like the Product Liability Directive and the AI Liability Directive. Models sometimes conflate related legislative texts."
                                          />, even if the developer had no control over the system&apos;s actions.{' '}
                                          <TextFlag
                                            text="This could create a chilling effect on AI research."
                                            evaluationFactor="voice"
                                            explanation="Notice how the output describes the effect as 'chilling'; emotive language like this can evoke strong emotional responses and lead readers to accept the biased viewpoint without critical analysis."
                                          />
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-base font-semibold text-gray-900 mb-2">3. Prohibition on certain AI applications</p>
                                        <p className="text-gray-700 text-base leading-relaxed">
                                          The Act proposes to prohibit the development and use of certain AI applications, such as AI-powered surveillance systems or AI-powered social scoring systems. While these prohibitions may be well-intentioned, they could stifle innovation in areas where AI has the potential to bring significant benefits.
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-base font-semibold text-gray-900 mb-2">4. Data protection and data sharing restrictions</p>
                                        <p className="text-gray-700 text-base leading-relaxed">
                                          The Act proposes to impose strict data protection and data sharing requirements on AI developers, which could make it difficult for researchers to access and share data necessary for AI research.
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-base font-semibold text-gray-900 mb-2">5. Lack of clear guidelines</p>
                                        <p className="text-gray-700 text-base leading-relaxed">
                                          The Act&apos;s proposed guidelines for AI development and deployment are still unclear, which could create uncertainty and confusion for researchers and developers.
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-base font-semibold text-gray-900 mb-2">6. Potential for regulatory overreach</p>
                                        <p className="text-gray-700 text-base leading-relaxed">
                                          The Act&apos;s proposed regulatory framework could be overly broad and could potentially capture many areas of AI research that are not necessarily &quot;high-risk&quot; or &quot;high-reward.&quot;
                                        </p>
                                      </div>
                                    </div>

                                  <p className="text-gray-700 text-base leading-relaxed">
                                    These concerns have been raised by various stakeholders, including researchers, developers, and industry associations. However, it&apos;s worth noting that the EU AI Act is still a proposed regulation, and the final version may address some of these concerns.
                                  </p>
                                </div> :
                      showNoBiasOutput ?
                      // Less Bias content
                      <div className="space-y-4">






                                    <p ref={biasTextFlagRef} className="text-gray-800 leading-relaxed text-base">
                                      <TextFlag
                            text="The EU AI Act, while comprehensive and stringent in its requirements for AI systems, does not necessarily stifle AI research."
                            evaluationFactor="voice"
                            explanation="Voice of an output generated from a questioning prompt is not so determined, answering the question not in a &quot;black-and-white&quot; manner, but taking counter-arguments into account. Such an output, written in an uncertain tone, might be taken with more consideration by the user."
                            />
                          {" "}The act aims to establish a legal framework for the development, deployment, and use of AI in the European Union, with a focus on promoting safety, transparency, and accountability.
                                    </p>

                                    <p className="text-gray-700 text-base leading-relaxed">
                                      However, some researchers and industry experts have raised concerns about the potential impact of the act on AI innovation and development. The strict requirements and potential limitations on certain types of AI systems could slow down research and development in those areas.
                                    </p>

                                    <p className="text-gray-700 text-base leading-relaxed">
                                      That being said, the EU AI Act also includes provisions for exemptions and adaptations, which could help mitigate some of the potential negative effects on AI research.{" "}
                                      <TextFlag
                            text="Additionally, the act is still in the process of being finalized"
                            evaluationFactor="factual_accuracy"
                            explanation="An output that is not biased is not necessarily factually correct. The AI Act has been finalised, however the generated output does not reflect this fact." />
                          , and there may be room for further adjustments and clarifications to address the concerns of the research community.
                                    </p>

                                    <p className="text-gray-700 text-base leading-relaxed">
                                      In summary,{" "}
                                      <TextFlag
                            text="while the EU AI Act may have some impact on AI research, it is not necessarily a complete stifling of innovation."
                            evaluationFactor="voice"
                            explanation="The bias is not reproduced in the output, with the conclusion further highlighting the neutrality of the answer. It is not strictly said that the EU AI Act stifles AI research, rather more space is left for questioning users existing beliefs." />
                          {" "}The act&apos;s ultimate effect will depend on how it is implemented and enforced, as well as the flexibility provided for researchers and developers working in the field of AI.
                                    </p>
                                  </div> :
                      showWithBackgroundOutput ?
                      // With Background content
                      <div className="space-y-4">
                                      <p className="text-gray-800 leading-relaxed text-base">
                                        <TextFlag
                            text="Certainly!"
                            evaluationFactor="voice"
                            explanation={t("components.textFlag.content.voice1")} />
                                        Here&apos;s an updated summary of the EU AI Act, focusing on its key rules and how it aims to regulate AI systems:
                                      </p>

                                      <div>
                                        <p className="text-base font-semibold text-gray-900 mb-3">
                                          <TextFlag
                              text="🧠"
                              evaluationFactor="voice"
                              explanation={t('components.textFlag.content.emoji_usage')} />
                                          Overview of the EU AI Act
                                        </p>
                                        <p className="text-gray-700 text-base leading-relaxed">
                                          The EU Artificial Intelligence Act (AI Act) is the first comprehensive legal framework for AI regulation globally. Adopted in 2024, it aims to ensure that AI systems in the EU are safe, transparent, and respect fundamental rights. The Act employs a risk-based approach, imposing varying levels of obligations depending on the potential impact of AI systems (
                                          <TextFlag
                              text="Digital Strategy"
                              evaluationFactor="relevance"
                              explanation={t('components.textFlag.content.digital_strategy_explanation')} />
                                          ).
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
                                    explanation={t("components.textFlag.content.bias1")} />
                                                potential to impact people&apos;s lives or rights. These include AI used in:</p>
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
                                        <p className="text-base font-semibold text-gray-900 mb-2">🛡️ <TextFlag
                              text="Rules for High-Risk AI Systems"
                              evaluationFactor="relevance"
                              explanation={t("components.textFlag.content.relevance1")} />
                                        </p>
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
                                    </div> :
                      showNoBackgroundOutput ?
                      // Less Background 
                      <div className="space-y-4">
                                        <p className="text-gray-800 leading-relaxed text-base">
                                          The AI Act is the EU&apos;s regulation for artificial intelligence,{" "}
                                          <TextFlag
                            text="adopted in 2024."
                            evaluationFactor="relevance"
                            explanation={t("components.textFlag.content.relevance2")} />

                                        </p>
                                        <p className="text-gray-800 leading-relaxed text-base">Here are the main points:</p>

                                        <p className="text-gray-700 text-base leading-relaxed">Risk-based approach: AI systems are categorized by risk level:</p>

                                        <ul className="space-y-2 text-gray-700 ml-6 list-disc">
                                          <li className="text-base leading-relaxed">Unacceptable risk systems are banned (e.g., government social scoring, manipulative AI)</li>
                                          <li className="text-base leading-relaxed">High-risk systems face strict requirements (e.g., AI in employment, law enforcement, credit scoring, critical infrastructure)</li>
                                          <li className="text-base leading-relaxed">Limited risk systems need transparency (e.g., chatbots must disclose they&apos;re AI)</li>
                                          <li className="text-base leading-relaxed">Minimal risk systems have few requirements</li>
                                        </ul>

                                        <p className="text-gray-700 text-base leading-relaxed mt-4"><TextFlag
                            text="Requirements for high-risk AI:"
                            evaluationFactor="relevance"
                            explanation={t("components.textFlag.content.relevance1")} />
                                        </p>

                                        <ul className="space-y-2 text-gray-700 ml-6 list-disc">
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
                                      </div> :

                      // Base output when all controls are "No Change"
                      <div className="space-y-4">
                                        <p className="text-gray-800 leading-relaxed text-base">​
                          <TextFlag
                            text="Certainly!"
                            evaluationFactor="voice"
                            explanation={t("components.textFlag.content.voice1")} />
                                          The AI Act is a <TextFlag
                            text="significant"
                            evaluationFactor="bias"
                            explanation={t("components.textFlag.content.bias1")} />
                                          {" "}piece of legislation aimed at regulating artificial intelligence within the European Union. Here&apos;s a summary of its main points:
                                        </p>

                                        <div>
                                          <p className="text-base font-semibold text-gray-900 mb-2">Risk-Based Classification:</p>
                                          <p className="text-gray-700 text-base leading-relaxed mb-2">AI systems are classified according to their risk level:</p>
                                          <ul className="space-y-2 text-gray-700 ml-6 list-disc">
                                            <li className="text-base leading-relaxed"><strong>Unacceptable Risk:</strong> <TextFlag
                                text="Prohibited, e.g., social scoring and manipulative AI."
                                evaluationFactor="plagiarism"
                                explanation={t("components.textFlag.content.plagiarism1")} />
                                            </li>
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
                      }
                    </div>
                  </div>

                  {/* Navigation Button - Fixed at bottom */}
                  <div className="bg-white rounded-lg rounded-t-none p-8 pt-6">
                   {!biasUnlocked ?
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                      onClick={() => {
                        // Reset all parameters when unlocking bias
                        setSpecificity("");
                        setStyle("");
                        setContext("");
                        setBias("");
                        setAppliedSpecificity("");
                        setAppliedStyle("");
                        setAppliedContext("");
                        setAppliedBias("");
                        setSentPrompt("Give me a summary of the main points in the AI Act.");
                        setBiasUnlocked(true);
                        setShowBiasHighlight(true);
                      }}>

                      Next Step
                      <ArrowRight className="-mr-2 !h-6 !w-6" />
                    </Button> :

                    <Button
                      variant="outline"
                      size="lg"
                      className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                      onClick={() => navigate("/module/prompt-construction/specificity/takeaways")}>

                      {t('components.breadcrumb.takeaways')}
                      <ArrowRight className="-mr-2 !h-6 !w-6" />
                    </Button>
                    }
                  </div>
                </div>

                {/* Right Sidebar - Journalistic Evaluation */}
                <div className="w-80 flex-shrink-0">
                  <EvaluationPanel />
                </div>
              </div>

              {/* LLM Disclaimer */}
              <div className="mt-6 text-sm text-muted-foreground max-w-[1100px] w-full">
                LLMs have been used in the following places:<br />
                The creation of prompt output examples in the Guided Exploration<br />
                LLMs used include: Mistral, Claude, Chat GPT & Llama 3.1 8B (open source)
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <FeatureHighlight
      target="#bias-parameter-control"
      open={showBiasHighlight}
      onClose={() => setShowBiasHighlight(false)}
      side="right"
      sideOffset={24}
      closeLabel="Compare Prompts">

      <strong>Confirmation Bias</strong>
      <p className="mt-2">Confirmation bias is the tendency to favour information that confirms our existing beliefs. A biased prompt – one that is worded to suggest a particular answer – can lead the model to generate a matching output. By appearing objective or authoritative, such outputs can reinforce our beliefs, strengthening confirmation bias.</p>
    </FeatureHighlight>

    <FeatureHighlight
      target="#prompt-controls-chatbox"
      open={showBiasPromptHighlight}
      onClose={() => setShowBiasPromptHighlight(false)}
      side="right"
      sideOffset={24}>

      This prompt is written in a biased and a commanding way – will it result in a biased output?
    </FeatureHighlight>

    <FeatureHighlight
      target="#prompt-controls-chatbox"
      open={showLessBiasPromptHighlight}
      onClose={() => setShowLessBiasPromptHighlight(false)}
      side="right"
      sideOffset={24}>

      The prompt is now written in a non-biased and a questioning way – how will it affect the output?
    </FeatureHighlight>

    <ModuleNavigation
      previousRoute="/module/prompt-construction/summarize"
      nextRoute="/module/prompt-construction/specificity/takeaways" />

  </div>;
}