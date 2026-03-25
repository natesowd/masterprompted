import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ChatPrompt from "@/components/ChatPrompt";
import FeatureHighlight from "@/components/FeatureHighlight";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface OutputSection {
  heading: string;
  items: string[];
}

interface InputOutputPair {
  id: string;
  input: string;
  outputTitle: string;
  sections: OutputSection[];
  footer?: string;
}

const INPUT_OUTPUT_PAIRS: InputOutputPair[] = [
  {
    id: "pair-1",
    input: "Create an outline for an article about renewable energy policy in Europe",
    outputTitle: "European Renewable Energy Policy Article Outline",
    sections: [
      {
        heading: "Introduction",
        items: [
          "Current state of renewable energy in Europe",
          "Policy goals and climate commitments",
          "Importance for energy security and climate change",
        ],
      },
      {
        heading: "Key Policies",
        items: [
          "European Green Deal objectives",
          "REPowerEU plan and energy independence",
          "Renewable Energy Directive (RED III) targets",
        ],
      },
      {
        heading: "Implementation Challenges",
        items: [
          "Grid infrastructure and storage limitations",
          "Financing and investment requirements",
          "Cross-border energy cooperation",
        ],
      },
      {
        heading: "Economic Impact",
        items: [
          "Job creation in green energy sectors",
          "Energy price effects for consumers",
          "Industrial competitiveness concerns",
        ],
      },
      {
        heading: "Conclusion",
        items: [
          "Progress toward 2030 and 2050 targets",
          "Role of policy in accelerating transition",
          "Future outlook and remaining gaps",
        ],
      },
    ],
    footer:
      "Would you like me to expand on any particular section or adjust the focus of the outline?",
  },
  {
    id: "pair-2",
    input: "Design an outline for an article about the EU AI Act",
    outputTitle: "AI Act Article Outline",
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
      {
        heading: "Compliance Requirements",
        items: [
          "Conformity assessments and CE marking",
          "Risk management systems and quality management",
          "Data governance and record-keeping obligations",
          "Human oversight requirements",
        ],
      },
      {
        heading: "Enforcement and Penalties",
        items: [
          "National supervisory authorities",
          "Fines up to €35 million or 7% of global turnover",
          "Phased implementation timeline through 2027",
        ],
      },
      {
        heading: "Industry Impact",
        items: [
          "Effects on AI developers and deployers",
          "Compliance costs and market access",
          "Innovation vs. regulation balance",
          "Global influence on AI governance",
        ],
      },
      {
        heading: "Conclusion",
        items: [
          "Significance for the future of AI regulation",
          "Potential model for other jurisdictions",
          "Challenges and opportunities ahead",
        ],
      },
    ],
    footer:
      "Would you like me to expand on any particular section or adjust the focus of the outline?",
  },
];

const ARTICLE_CONTENT = INPUT_OUTPUT_PAIRS[1]; // pair-2 drives center

/* ------------------------------------------------------------------ */
/*  Structural highlight groups                                        */
/* ------------------------------------------------------------------ */

type StructGroup = "title" | "heading" | "bullet" | "footer";

const STRUCT_COLORS: Record<StructGroup, string> = {
  title: "bg-brand-tertiary-500/20 ring-1 ring-brand-tertiary-500/30",
  heading: "bg-sky-400/20 ring-1 ring-sky-400/30",
  bullet: "bg-violet-400/15 ring-1 ring-violet-400/25",
  footer: "bg-amber-400/15 ring-1 ring-amber-400/25",
};

/* ------------------------------------------------------------------ */
/*  Session-once hint                                                  */
/* ------------------------------------------------------------------ */

const HIGHLIGHT_HINT_KEY = "llm-training-struct-hint-seen";

function useStructHint() {
  const [show, setShow] = useState(
    () => !sessionStorage.getItem(HIGHLIGHT_HINT_KEY)
  );
  const dismiss = () => {
    sessionStorage.setItem(HIGHLIGHT_HINT_KEY, "1");
    setShow(false);
  };
  return { show, dismiss };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LLMTrainingExercise() {
  const navigate = useNavigate();
  const [activeStruct, setActiveStruct] = useState<StructGroup | null>(null);
  const { show: showHint, dismiss: dismissHint } = useStructHint();

  /* Highlight helpers */
  const structClass = (group: StructGroup) =>
    cn(
      "transition-all duration-200 rounded-sm",
      activeStruct === group ? STRUCT_COLORS[group] : "",
      activeStruct && activeStruct !== group ? "opacity-35" : ""
    );

  const structHandlers = (group: StructGroup) => ({
    onMouseEnter: () => setActiveStruct(group),
    onMouseLeave: () => setActiveStruct(null),
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col">
            <div className="hidden 2xl:block pt-6 pb-5">
              <Breadcrumb />
            </div>

            <div className="flex flex-1">
              {/* ── Left sidebar ── */}
              <div
                className="w-80 flex-shrink-0 px-6 pt-6 2xl:pt-0 flex flex-col overflow-hidden"
                data-highlight-target="pair-sidebar"
              >
                <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                  Supervised learning
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The model will use the training example (input) to create the
                  output.
                </p>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Hover across both outputs to compare their structure
                </p>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1 pb-4">
                  {INPUT_OUTPUT_PAIRS.map((pair, index) => (
                    <div
                      key={pair.id}
                      className="w-full rounded-xl border border-brand-tertiary-500 shadow-sm p-3 text-left font-heading"
                    >
                      <span className="text-xs font-semibold text-foreground block mb-2">
                        Input Output pair {index + 1}
                      </span>

                      {/* Input */}
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                          Input
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {pair.input}
                        </p>
                      </div>

                      {/* Output */}
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                          Output
                        </span>

                        {/* Title */}
                        <span
                          className={cn(
                            "text-xs font-semibold text-foreground block px-1 py-0.5 cursor-default",
                            structClass("title")
                          )}
                          {...structHandlers("title")}
                        >
                          {pair.outputTitle}
                        </span>

                        {/* Sections */}
                        <div className="mt-1.5 space-y-1.5">
                          {pair.sections.map((section, si) => (
                            <div key={si}>
                              <span
                                className={cn(
                                  "text-xs font-semibold text-foreground block px-1 py-0.5 cursor-default",
                                  structClass("heading")
                                )}
                                {...structHandlers("heading")}
                              >
                                {section.heading}
                              </span>
                              <ul className="ml-2 mt-0.5 space-y-0.5">
                                {section.items.map((item, ii) => (
                                  <li
                                    key={ii}
                                    className={cn(
                                      "text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5 px-1 py-0.5 cursor-default",
                                      structClass("bullet")
                                    )}
                                    {...structHandlers("bullet")}
                                  >
                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        {pair.footer && (
                          <p
                            className={cn(
                              "text-xs text-muted-foreground italic mt-2 px-1 py-0.5 cursor-default",
                              structClass("footer")
                            )}
                            {...structHandlers("footer")}
                          >
                            {pair.footer}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Center content ── */}
              <div className="flex-initial flex flex-col px-6 py-6 2xl:pt-0 items-start">
                <div className="w-full max-w-[1100px] 2xl:hidden">
                  <Breadcrumb />
                  <div className="mb-5" />
                </div>

                <div className="flex gap-6 max-w-[1100px] w-full">
                  <div className="flex-1 flex flex-col">
                    <div className="bg-background rounded-lg p-8 flex-1 flex flex-col">
                      <ChatPrompt text="Design an outline for an article about the EU AI Act" />
                      <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
                        {ARTICLE_CONTENT.outputTitle}
                      </h2>

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

                      {ARTICLE_CONTENT.footer && (
                        <p className="text-sm text-muted-foreground italic mt-6">
                          {ARTICLE_CONTENT.footer}
                        </p>
                      )}

                      <div className="mt-8 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/module/llm-training")}
                          className="rounded-md border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                        >
                          <ArrowLeft className="!h-5 !w-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() =>
                            navigate("/module/llm-training/few-shot")
                          }
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

      <div className="fixed bottom-3 left-3 text-[13px] leading-snug text-muted-foreground/70 text-left">
        LLMs used in the creation of prompt output examples in the Guided
        Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open
        source)
      </div>

      {/* Feature Highlight */}
      <FeatureHighlight
        target='[data-highlight-target="pair-sidebar"]'
        open={showHint}
        onClose={dismissHint}
        side="right"
        sideOffset={20}
        closeLabel="Got it"
      >
        <strong>Compare output structures!</strong>
        <br />
        Hover over titles, headings, bullet points, or footers in either output
        to see how the model produces structurally similar responses across
        different topics.
      </FeatureHighlight>
    </div>
  );
}
