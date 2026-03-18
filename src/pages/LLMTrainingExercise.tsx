import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import TextFlag from "@/components/TextFlag";
import { Button } from "@/components/ui/button";
import { ArrowRight, ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface InputOutputPair {
  id: string;
  input: string;
  outputTitle: string;
  outputBody: string;
}

const INPUT_OUTPUT_PAIRS: InputOutputPair[] = [
  {
    id: "pair-1",
    input: "Create an outline for an article about renewable energy policy in Europe",
    outputTitle: "European Renewable Energy Policy Article Outline",
    outputBody: `Introduction
Current state of renewable energy in Europe
Policy goals and climate commitments
Importance for energy security and climate change...`,
  },
  {
    id: "pair-2",
    input: "Write a summary of the EU AI Act's key provisions",
    outputTitle: "EU AI Act Summary",
    outputBody: `Overview
Purpose and scope of the regulation
Risk-based classification framework
Key obligations for providers and deployers...`,
  },
];

const ARTICLE_CONTENT = {
  title: "AI Act Article Outline",
  sections: [
    {
      heading: "Introduction",
      items: [
        "What is the EU AI Act and why it matters",
        "Timeline: from proposal to enforcement (2021-2025)",
        "First comprehensive AI regulation globally",
      ],
    },
    {
      heading: "Key Provisions",
      items: [
        "Risk-based approach: prohibited, high-risk, limited-risk, and minimal-risk AI systems",
        "Prohibited AI practices (social scoring, emotion recognition in workplaces/schools, etc.)",
        "Requirements for high-risk AI systems (documentation, transparency, human oversight)",
        "Foundation model regulations for powerful AI systems",
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LLMTrainingExercise() {
  const navigate = useNavigate();
  const [selectedPair, setSelectedPair] = useState<string>(INPUT_OUTPUT_PAIRS[0].id);

  const togglePair = (id: string) => {
    setSelectedPair((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col">
            {/* Breadcrumb for 2xl */}
            <div className="hidden 2xl:block pt-6 pb-5">
              <Breadcrumb />
            </div>

            {/* Three-column layout */}
            <div className="flex flex-1">
              {/* ── Left sidebar ── */}
              <div className="w-80 flex-shrink-0 px-6 pt-6 2xl:pt-0">
                <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                  Supervised learning
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The model will use the training example (input) to create the output.
                </p>

                <p className="text-sm font-semibold text-foreground mb-3">
                  Select an input-output pair and see how the output changes
                </p>

                <div className="space-y-3">
                  {INPUT_OUTPUT_PAIRS.map((pair, index) => {
                    const isSelected = selectedPair === pair.id;
                    return (
                      <button
                        key={pair.id}
                        type="button"
                        onClick={() => togglePair(pair.id)}
                        className={cn(
                          "w-full rounded-xl border p-3 text-left transition-shadow",
                          isSelected
                            ? "border-brand-tertiary-500 shadow-sm"
                            : "border-border hover:shadow-md"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          {!isSelected && (
                            <span className="text-xs font-semibold text-foreground">
                              Input Output pair {index + 1}
                            </span>
                          )}
                          {isSelected ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {isSelected && (
                          <div className="mt-2 space-y-2">
                            <div>
                              <span className="text-xs font-semibold text-foreground block">
                                Input
                              </span>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {pair.input}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-foreground block">
                                Output
                              </span>
                              <div className="flex items-start gap-1.5">
                                <ListChecks className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" strokeWidth={2} />
                                <span className="text-xs font-semibold text-foreground underline decoration-destructive underline-offset-2">
                                  {pair.outputTitle}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed mt-1 whitespace-pre-line">
                                {pair.outputBody}
                              </p>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Center content ── */}
              <div className="flex-initial flex flex-col px-6 py-6 2xl:pt-0 items-start">
                <div className="w-full max-w-[860px] 2xl:hidden">
                  <Breadcrumb />
                  <div className="mb-5" />
                </div>

                <div className="flex gap-6 max-w-[860px] w-full">
                  <div className="flex-1 flex flex-col">
                    {/* Response area */}
                    <div className="bg-background rounded-lg p-8 flex-1 flex flex-col">
                      {/* Article title as TextFlag */}
                      <div className="mb-6">
                        <TextFlag
                          text={ARTICLE_CONTENT.title}
                          evaluationFactor="factual_accuracy"
                          explanation="The title suggests a comprehensive outline, but the content should be verified against official EU AI Act documentation for completeness and accuracy."
                        />
                      </div>

                      <div className="max-h-[500px] overflow-y-auto flex-1">
                        <div className="space-y-6">
                          {ARTICLE_CONTENT.sections.map((section, i) => (
                            <div key={i}>
                              <h3 className="text-lg font-heading font-semibold text-foreground mb-3">
                                {section.heading}
                              </h3>
                              <ul className="space-y-2 ml-1">
                                {section.items.map((item, j) => (
                                  <li
                                    key={j}
                                    className="flex items-start gap-3 text-base text-foreground leading-relaxed"
                                  >
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Next button */}
                      <div className="mt-8 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/module/llm-training/few-shot")}
                          className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                        >
                          Next (Few-Shot Prompting)
                          <ArrowRight className="-mr-2 !h-6 !w-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right sidebar ── */}
              <div className="w-80 flex-shrink-0">
                <EvaluationPanel initialIsOpen={false} canClose={true} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* LLM Disclaimer */}
      <div className="fixed bottom-3 left-3 text-[13px] leading-snug text-muted-foreground/70 text-left">
        LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
      </div>
    </div>
  );
}
