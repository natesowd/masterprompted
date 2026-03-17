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

const PROMPT_TEXT = "Summarize who bears the main obligations under the EU AI Act and what responsibilities apply to deployers of high-risk AI systems.";

const TEMPERATURE_STEPS = [0.0, 0.2, 0.5, 0.8, 1.0];

const TEMPERATURE_OUTPUTS: Record<number, string> = {
  0.0: "Under the EU AI Act, providers — meaning developers — of high-risk AI systems bear the majority of obligations. This includes providers based outside the EU if their systems are used within the EU. Their duties include risk management, data governance, technical documentation, transparency, and human oversight.\n\nDeployers of high-risk AI systems also have responsibilities, though fewer than providers. These include using systems in accordance with instructions, monitoring operations, and conducting data protection impact assessments where required.",
  0.2: "Under the EU AI Act, providers — meaning developers — of high-risk AI systems bear the majority of obligations. This includes providers based outside the EU if their systems are used within the EU. Their duties include risk management, data governance, technical documentation, transparency, and human oversight.\n\nDeployers of high-risk AI systems also have responsibilities, though fewer than providers. These include using systems in accordance with instructions, monitoring operations, and conducting data protection impact assessments where required.",
  0.5: "The EU AI Act places its heaviest regulatory burden on the developers of high-risk AI — a category broad enough to reach beyond European borders to any provider whose products operate within the bloc. Their obligations span risk assessment, data quality, record-keeping, and ensuring meaningful human control.\n\nOrganizations that deploy high-risk AI face a lighter but still significant set of duties: following usage instructions, maintaining oversight of system behavior, and ensuring compliance with fundamental rights protections.",
  0.8: "At the heart of the EU AI Act sits a clear principle: those who build high-risk AI must answer for it. Providers carry the lion's share of compliance demands — from rigorous risk assessments to transparency requirements — and this burden extends extraterritorially, pulling non-EU developers into the regulatory fold whenever their systems touch European lives.\n\nDeployers, meanwhile, occupy a distinct but meaningful position in the accountability chain. While their obligations are proportionally lighter, they are expected to exercise vigilance: monitoring AI behavior in practice, respecting fundamental rights, and ensuring that real-world use aligns with the system's intended purpose.",
  1.0: "The EU AI Act constructs an intricate hierarchy of responsibility, placing its most exacting demands on the architects of high-risk AI. Providers — whether headquartered in Brussels or Bangalore — must navigate a labyrinth of obligations: risk management frameworks, meticulous data governance, transparency protocols, and the ever-present imperative of human oversight. The Act's jurisdictional reach is deliberately expansive, ensnaring any developer whose algorithmic creation sets foot on European soil.\n\nFor deployers, the regulatory landscape is less demanding but far from inconsequential. Theirs is a role defined by vigilance and contextual responsibility — ensuring that these powerful tools are wielded within their intended boundaries, that fundamental rights remain undisturbed, and that the gap between intended design and lived experience is continuously monitored.",
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
              <div className="w-[860px]">
                <Breadcrumb />
              </div>
            </div>

            {/* Three column layout: Left panel + Center content + Evaluation */}
            <div className="flex flex-1 items-start px-6 relative justify-center">
              {/* Left panel - Temperature controls */}
              <div className="w-[320px] flex-shrink-0 pr-10">
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Set Temperature</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Drag the slider to see how different temperature values affect the AI's output. Lower values produce more predictable text; higher values produce more varied, creative text.
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <Slider
                    value={[stepIndex]}
                    onValueChange={(val) => setStepIndex(val[0])}
                    min={0}
                    max={TEMPERATURE_STEPS.length - 1}
                    step={1}
                    className="w-full"
                  />

                  <div className="text-sm font-medium text-foreground">{temperature.toFixed(1)}</div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More Stable</span>
                    <span>More Random</span>
                  </div>
                </div>
              </div>

              {/* Middle column - Prompt + Output text */}
              <div className="w-[860px] flex-shrink-0">
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
