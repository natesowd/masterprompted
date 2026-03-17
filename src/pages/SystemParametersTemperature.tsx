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

const PROMPT_TEXT = "Draft a lead paragraph for a news article about how EU member states are preparing to enforce the AI Act's requirements on high-risk AI systems.";

const TEMPERATURE_STEPS = [0.0, 0.2, 0.5, 0.8, 1.0];

const TEMPERATURE_OUTPUTS: Record<number, string> = {
  0.0: "EU member states are establishing national authorities to oversee compliance with the AI Act's requirements for high-risk AI systems. The regulation, which entered into force in August 2024, requires providers and deployers of high-risk AI to meet strict standards on transparency, risk management, and human oversight. Member states have until August 2025 to designate competent authorities and notify the European Commission.\n\nThe enforcement framework gives national regulators the power to conduct market surveillance, request documentation, and impose fines of up to €35 million or 7% of global turnover for the most serious violations.",
  0.2: "EU member states are establishing national authorities to oversee compliance with the AI Act's requirements for high-risk AI systems. The regulation, which entered into force in August 2024, requires providers and deployers of high-risk AI to meet strict standards on transparency, risk management, and human oversight. Member states have until August 2025 to designate competent authorities and notify the European Commission.\n\nThe enforcement framework gives national regulators the power to conduct market surveillance, request documentation, and impose fines of up to €35 million or 7% of global turnover for the most serious violations.",
  0.5: "Across the European Union, governments are racing to build the regulatory machinery needed to police artificial intelligence. With the AI Act now law, member states face a tight deadline to stand up national watchdogs capable of scrutinizing everything from hiring algorithms to medical diagnostic tools classified as high-risk.\n\nThe stakes are considerable: regulators will wield the authority to audit AI systems, demand technical documentation, and levy fines that could reach tens of millions of euros — a prospect that has already prompted major technology companies to begin compliance reviews.",
  0.8: "A quiet regulatory revolution is underway across Europe. As the AI Act shifts from legislative text to operational reality, EU member states find themselves in a high-stakes scramble to build enforcement agencies from the ground up — bodies that must somehow acquire the technical expertise to evaluate opaque algorithms while navigating the political pressures of an industry that generates billions in economic value.\n\nFor technology companies, the message is unmistakable: the era of self-regulation is over. National authorities will soon hold the power to halt AI deployments, demand source-level transparency, and impose penalties severe enough to reshape corporate strategy.",
  1.0: "The bureaucratic scaffolding of Europe's AI ambitions is being erected in real time, and it is anything but elegant. Across 27 member states, a patchwork of newly minted regulators — some staffed by former academics, others by repurposed data protection officials — are grappling with an extraordinary mandate: to become the world's first line of defense against algorithmic harm, armed with a regulation so sweeping it touches everything from chatbots to cardiac monitors.\n\nThe irony is not lost on industry observers: a continent that has struggled to produce a single tech giant now aspires to referee the global AI race, wielding fines that could dwarf the annual budgets of the very agencies tasked with collecting them.",
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
