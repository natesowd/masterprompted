import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ArrowRight, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TEMPERATURE_STEPS = [0.0, 0.2, 0.5, 0.8, 1.0];

const TEMPERATURE_OUTPUTS: Record<number, string> = {
  0.0: "Obligations for Providers: The majority of obligations fall on providers (developers) of high-risk AI systems, including those outside the EU if their systems are used within the EU.\n\nUser Responsibilities: Users (deployers) of high-risk AI systems have certain obligations, though less than providers.",
  0.2: "Obligations for Providers: The majority of obligations fall on providers (developers) of high-risk AI systems, including those outside the EU if their systems are used within the EU.\n\nUser Responsibilities: Users (deployers) of high-risk AI systems have certain obligations, though less than providers.",
  0.5: "Provider Duties: Most regulatory requirements target the developers of high-risk AI, even those based outside the EU whose products operate within its borders.\n\nUser Duties: Deployers of high-risk AI bear a lighter but still meaningful set of compliance requirements.",
  0.8: "Developer Accountability: The heaviest compliance burden rests with those who build high-risk AI systems — a rule that extends extraterritorially to non-EU providers serving the European market.\n\nDeployer Responsibilities: Organizations using high-risk AI face their own regulatory expectations, though these are proportionally less demanding than those imposed on developers.",
  1.0: "Architects of Risk: The EU AI Act places its most exacting demands on the creators of high-risk artificial intelligence — casting a wide jurisdictional net that ensnares even non-European developers whose systems touch EU soil.\n\nThe User's Burden: Those who deploy high-risk AI inherit a lighter, though far from trivial, tapestry of obligations — a regulatory acknowledgment that the act of wielding powerful technology carries its own weight of responsibility.",
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

              {/* Middle column - Output text */}
              <div className="w-[860px] flex-shrink-0">
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
