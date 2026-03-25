import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ModuleNavigation from "@/components/ModuleNavigation";
import ChatPrompt from "@/components/ChatPrompt";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ArrowRight, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PROMPT_TEXT = "Draft a lede paragraph for a news article about the EU AI Act.";

const TEMPERATURE_STEPS = [0.0, 0.2, 0.5, 0.8, 1.0];

const TEMPERATURE_OUTPUTS: Record<number, string> = {
  0.0: "The European Union's Artificial Intelligence Act, which entered into force on August 1, 2024, establishes a comprehensive legal framework for the development, deployment, and use of AI systems across the bloc's 27 member states. The regulation adopts a risk-based approach, categorizing AI applications into four tiers — unacceptable, high-risk, limited, and minimal — and imposes obligations ranging from outright bans on social scoring and real-time biometric surveillance to transparency and documentation requirements for systems used in hiring, credit scoring, and law enforcement.",
  0.2: "The European Union's Artificial Intelligence Act, which entered into force on August 1, 2024, establishes a comprehensive regulatory framework for AI systems across the bloc. The law takes a risk-based approach, sorting AI applications into categories from minimal to unacceptable risk, and sets binding requirements on transparency, human oversight, and data governance for providers and deployers of high-risk systems in sectors including healthcare, education, and law enforcement.",
  0.5: "The European Union has drawn a line in the sand on artificial intelligence. Its AI Act — the first comprehensive AI law by a major economic power — lays out binding rules for how AI systems can be built and used across the bloc, with requirements that scale according to the risk a system poses. From banning manipulative AI outright to demanding rigorous audits of algorithms used in hiring and policing, the regulation signals Brussels' intent to shape the global governance of a technology that is moving faster than most lawmakers can follow.",
  0.8: "In the halls of Brussels, lawmakers have done something no other major government has managed: they've passed a sweeping law that tries to tame artificial intelligence before it outpaces the people it's supposed to serve. The EU AI Act, a years-in-the-making regulatory framework, doesn't just nibble around the edges — it bans certain uses of AI entirely, demands that companies open the black box on high-risk systems, and threatens fines large enough to make even the biggest tech companies pause. Whether it will actually work is another question entirely.",
  1.0: "Call it Brussels' biggest bet since the single market: a 144-page wager that Europe can regulate its way to AI safety without strangling innovation in its crib. The EU AI Act — born from a three-year legislative brawl between privacy hawks, industry lobbyists, and MEPs who couldn't always agree on what artificial intelligence actually is — now stands as the world's most ambitious attempt to write rules for a technology that rewrites itself. It bans social scoring, puts guardrails on facial recognition, and tells companies deploying high-risk AI to prove their systems are safe, fair, and transparent — or face fines that would make a pharma executive wince.",
};

export default function SystemParametersTemperature() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stepIndex, setStepIndex] = useState(1); // default 0.2
  const temperature = TEMPERATURE_STEPS[stepIndex];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col w-full">
            {/* Breadcrumb */}
            <div className="pt-6 pb-3 px-6 flex justify-center">
              <div className="max-w-[860px]">
                <Breadcrumb />
              </div>
            </div>

            {/* Three column layout: Left panel + Center content + Evaluation */}
            <div className="flex flex-1 items-start px-6 relative justify-center">
              {/* Left panel - Temperature controls */}
              <div className="w-[280px] lg:w-[320px] flex-shrink-0 pr-6 lg:pr-10">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-heading font-bold text-foreground">Temperature</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      Temperature controls the randomness of an LLM's output. A low temperature (close to 0) makes the model more deterministic, always picking the most likely next word. A high temperature (close to 1) increases randomness, producing more creative but less predictable text.
                    </TooltipContent>
                  </Tooltip>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  LLM's temperature is a parameter that influences the language model's output, determining whether the output is more random or more stable and repetitive.
                </p>

                <p className="text-sm font-medium text-foreground mb-4">
                  Use the slider to change the temperature
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-heading font-semibold text-foreground">Set Temperature</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Drag the slider to see how different temperature values affect the AI's output. Lower values produce more predictable text; higher values produce more varied, creative text.
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="relative">
                    {/* Custom temperature slider */}
                    <div className="relative h-12 flex items-center">
                      {/* Track background */}
                      <div className="absolute inset-x-0 h-5 rounded bg-surface-600" />
                      {/* Filled range */}
                      <div
                        className="absolute left-0 h-5 rounded-l bg-brand-tertiary-500"
                        style={{ width: `${(stepIndex / (TEMPERATURE_STEPS.length - 1)) * 100}%` }}
                      />
                      {/* Thumb bar with blank padding clearing the track */}
                      <div
                        className="absolute h-8 -translate-x-1/2 cursor-pointer flex items-center"
                        style={{ left: `${(stepIndex / (TEMPERATURE_STEPS.length - 1)) * 100}%` }}
                      >
                        <div className="h-full w-[5px] bg-background" />
                        <div className="h-full w-1.5 rounded-sm bg-brand-tertiary-500" />
                        <div className="h-full w-[5px] bg-background" />
                      </div>
                      {/* Invisible native slider for interaction */}
                      <input
                        type="range"
                        min={0}
                        max={TEMPERATURE_STEPS.length - 1}
                        step={1}
                        value={stepIndex}
                        onChange={(e) => setStepIndex(Number(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {/* Inline temperature value */}
                    <div
                      className="text-sm font-heading font-semibold text-foreground mt-1 absolute -translate-x-1/2"
                      style={{ left: `${(stepIndex / (TEMPERATURE_STEPS.length - 1)) * 100}%` }}
                    >
                      {temperature.toFixed(1)}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm font-heading font-semibold text-foreground pt-6">
                    <span>More Stable</span>
                    <span>More Random</span>
                  </div>
                </div>
              </div>

              {/* Middle column - Prompt + Output text */}
              <div className="flex-1 min-w-0">
                {/* Prompt bubble */}
                <ChatPrompt
                  text={PROMPT_TEXT}
                  fileName="EU_AI_Act.pdf"
                />

                <div className="min-h-[400px] pt-4">
                  {TEMPERATURE_OUTPUTS[temperature].split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-xl leading-relaxed text-muted-foreground/60 mb-8">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="mt-8 mb-12 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/module/system-parameters")}
                    className="h-12 w-12 border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                  >
                    <ArrowLeft className="!h-6 !w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/module/system-parameters/roles")}
                    className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                  >
                    Continue
                    <ArrowRight className="-mr-2 !h-6 !w-6" />
                  </Button>
                </div>
              </div>

              {/* Right column - Evaluation panel */}
              <div className="flex-shrink-0 ml-6">
                <EvaluationPanel initialIsOpen={true} canClose={true} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ModuleNavigation
        previousRoute="/module/system-parameters"
        nextRoute="/module/system-parameters/roles"
      />

      {/* LLM Disclaimer */}
      <div className="fixed bottom-3 left-3 text-[13px] leading-snug text-muted-foreground/70 text-left z-10">
        LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
      </div>
    </div>
  );
}
