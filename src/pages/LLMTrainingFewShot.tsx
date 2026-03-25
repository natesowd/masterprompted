import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import TextFlag from "@/components/TextFlag";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const EXAMPLE_LEDE = {
  title: "German court rules turning away asylum-seekers unlawful",
  lede: "Conservative Karol Nawrocki, who was backed by US President Donald Trump, won a narrow victory over his pro-EU rival, delivering a blow to Prime Minister Donald Tusk's government. DW has more",
};

type ResponsePart = {
  text: string;
  flagged: boolean;
  factor?: "factual_accuracy" | "relevance" | "voice" | "bias" | "plagiarism";
  explanation?: string;
};

const RESPONSE_OFF: ResponsePart[] = [
  { text: "The European Union's flagship AI Act, hailed as a ", flagged: false },
  {
    text: "world-first",
    flagged: true,
    factor: "voice",
    explanation: "The phrase 'world-first' uses promotional language that may overstate the uniqueness of this regulation. A more neutral description would be appropriate for journalistic writing.",
  },
  { text: " in regulating artificial intelligence, is facing mounting scrutiny as fresh allegations surface linking the legislation's final text to aggressive corporate lobbying and opaque political bargaining—raising concerns ", flagged: false },
  {
    text: "about transparency and accountability at the heart of Brussels",
    flagged: true,
    factor: "voice",
    explanation: "This phrasing uses dramatic, editorial language ('at the heart of Brussels') that may not align with DW's neutral reporting voice. Consider more measured wording.",
  },
  { text: ".", flagged: false },
];

const RESPONSE_ON: ResponsePart[] = [
  { text: "The European Union has finalized its AI Act, the first comprehensive legal framework for artificial intelligence. The regulation introduces a risk-based system that bans certain AI practices outright while imposing strict requirements on high-risk applications in areas such as law enforcement, migration, and critical infrastructure.", flagged: false },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LLMTrainingFewShot() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<"off" | "on">("off");

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
                  Few-shot prompting
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  We can apply principles of supervised learning to our prompts using few-shot prompting. Providing examples helps guide the model, especially for tailored or uncommon tasks.
                </p>

                <p className="text-sm font-semibold text-foreground mb-3">
                  Select an option and compare how well the LLM generates a DW-style lede with and without examples.
                </p>

                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setSelectedOption("off")}
                    className={cn(
                      "w-full rounded-xl border p-3 text-center transition-shadow font-heading text-sm font-semibold",
                      selectedOption === "off"
                        ? "border-brand-tertiary-500 shadow-sm"
                        : "border-border hover:shadow-md"
                    )}
                  >
                    DW voice examples off
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOption("on")}
                    className={cn(
                      "w-full rounded-xl border p-3 text-center transition-shadow font-heading text-sm font-semibold",
                      selectedOption === "on"
                        ? "border-brand-tertiary-500 shadow-sm"
                        : "border-border hover:shadow-md"
                    )}
                  >
                    DW voice examples on
                  </button>
                </div>

                {/* Example Lede Used - only when examples are on */}
                {selectedOption === "on" && (
                  <div>
                    <h3 className="text-base font-heading font-bold text-foreground mb-3">
                      Example Lede Used
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-semibold text-foreground block">Title</span>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {EXAMPLE_LEDE.title}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground block">Lede</span>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {EXAMPLE_LEDE.lede}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Center content ── */}
              <div className="flex-initial flex flex-col px-6 py-6 2xl:pt-0 items-start">
                <div className="w-full max-w-[1100px] 2xl:hidden">
                  <Breadcrumb />
                  <div className="mb-5" />
                </div>

                <div className="flex gap-6 max-w-[1100px] w-full">
                  <div className="flex-1 flex flex-col">
                    {/* Response area */}
                    <div className="bg-background rounded-lg p-8 flex-1 flex flex-col">
                      <div className="max-h-[500px] overflow-y-auto flex-1">
                        <p className="text-xl text-foreground leading-relaxed">
                          {(selectedOption === "on" ? RESPONSE_OFF : RESPONSE_ON).map((part, i) =>
                            part.flagged ? (
                              <TextFlag
                                key={`${selectedOption}-${i}`}
                                text={part.text}
                                evaluationFactor={part.factor!}
                                explanation={part.explanation!}
                              />
                            ) : (
                              <span key={`${selectedOption}-${i}`}>{part.text}</span>
                            )
                          )}
                        </p>
                      </div>

                      {/* Navigation buttons */}
                      <div className="mt-8 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/module/llm-training/supervised")}
                          className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                        >
                          <ArrowLeft className="!h-5 !w-5 -ml-2" />
                          Previous (Supervised Learning)
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/module/llm-training/takeaways")}
                          className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                        >
                          Takeaways
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
