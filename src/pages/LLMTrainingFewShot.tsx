import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ChatPrompt from "@/components/ChatPrompt";
import TextFlag from "@/components/TextFlag";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, ArrowRight, Eye, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data — DW Voice view (existing)                                    */
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
  severity?: "error" | "warning" | "info" | "success";
};

const RESPONSE_OFF: ResponsePart[] = [
  { text: "The European Union's flagship AI Act, hailed as a ", flagged: false },
  {
    text: "world-first",
    flagged: true,
    factor: "voice",
    severity: "warning",
    explanation: "The phrase 'world-first' uses promotional language that may overstate the uniqueness of this regulation. A more neutral description would be appropriate for journalistic writing.",
  },
  { text: " in regulating artificial intelligence, is facing mounting scrutiny as fresh allegations surface linking the legislation's final text to aggressive corporate lobbying and opaque political bargaining—raising concerns ", flagged: false },
  {
    text: "about transparency and accountability at the heart of Brussels",
    flagged: true,
    factor: "voice",
    severity: "warning",
    explanation: "This phrasing uses dramatic, editorial language ('at the heart of Brussels') that may not align with DW's neutral reporting voice. Consider more measured wording.",
  },
  { text: ".", flagged: false },
];

const RESPONSE_ON: ResponsePart[] = [
  { text: "The European Union has finalized its AI Act, the first comprehensive legal framework for artificial intelligence. The regulation introduces a risk-based system that bans certain AI practices outright while imposing strict requirements on high-risk applications in areas such as law enforcement, migration, and critical infrastructure.", flagged: false },
];

/* ------------------------------------------------------------------ */
/*  Data — Choose Examples view                                        */
/* ------------------------------------------------------------------ */

type Publication = "bild" | "dw" | "euractiv";

interface ExampleLede {
  id: string;
  publication: Publication;
  headline: string;
  lede: string;
}

const PUBLICATION_LABELS: Record<Publication, string> = {
  bild: "Bild",
  dw: "DW",
  euractiv: "Euractiv",
};

const PUBLICATION_COLORS: Record<Publication, { bg: string; text: string; border: string; ring: string }> = {
  bild: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", ring: "ring-red-400" },
  dw: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300", ring: "ring-blue-400" },
  euractiv: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", ring: "ring-amber-400" },
};

const EXAMPLE_LEDES: ExampleLede[] = [
  // Bild — tabloid, punchy, emotional, short sentences
  {
    id: "bild-1",
    publication: "bild",
    headline: "Mega-fine for tech giants!",
    lede: "Brussels drops the hammer! Companies that break the new AI rules face fines of up to 35 MILLION euros. What this means for your smartphone — and your job.",
  },
  {
    id: "bild-2",
    publication: "bild",
    headline: "AI chaos in Europe",
    lede: "The EU wants to ban facial recognition at train stations and airports. But critics warn: this could make us LESS safe. The bitter truth about the new AI law.",
  },
  {
    id: "bild-3",
    publication: "bild",
    headline: "Now even robots have rules!",
    lede: "ChatGPT, self-driving cars, smart cameras — the EU is cracking down on ALL of them. What's allowed, what's banned, and why German companies are furious.",
  },
  // DW — neutral, factual, international perspective, measured tone
  {
    id: "dw-1",
    publication: "dw",
    headline: "EU AI Act: What the landmark regulation means",
    lede: "The European Union has adopted the world's first comprehensive framework for regulating artificial intelligence. The legislation classifies AI systems by risk level and introduces binding requirements for developers and deployers across the bloc.",
  },
  {
    id: "dw-2",
    publication: "dw",
    headline: "AI regulation enters enforcement phase in Europe",
    lede: "After years of negotiation, the EU's AI Act is moving from paper to practice. National authorities are now tasked with overseeing compliance as the first prohibitions on high-risk AI practices take effect.",
  },
  {
    id: "dw-3",
    publication: "dw",
    headline: "How the EU AI Act could reshape global tech policy",
    lede: "As the European Union begins implementing its AI Act, governments from Brazil to South Korea are watching closely. Analysts say the regulation could set a de facto global standard, much as GDPR did for data protection.",
  },
  // Euractiv — policy-focused, institutional detail, Brussels insider tone
  {
    id: "euractiv-1",
    publication: "euractiv",
    headline: "Trilogue deal on AI Act clears final Council hurdle",
    lede: "EU ambassadors signed off on the AI Act compromise text following weeks of behind-the-scenes wrangling over foundation model obligations and law enforcement exemptions, paving the way for formal adoption before the European elections.",
  },
  {
    id: "euractiv-2",
    publication: "euractiv",
    headline: "AI Act implementation: Member states scramble to set up supervisory bodies",
    lede: "With the AI Act's phased enforcement timeline kicking in, several member states — including Germany, France, and Italy — have yet to designate national competent authorities, raising questions about the regulation's readiness.",
  },
  {
    id: "euractiv-3",
    publication: "euractiv",
    headline: "Industry lobby pushes back on AI Act codes of practice",
    lede: "Major tech industry associations have written to the European Commission urging revisions to the draft codes of practice for general-purpose AI models, arguing the current text imposes disproportionate compliance burdens on European SMEs.",
  },
];

/**
 * Output ledes generated in the style of each publication.
 * When users select examples from a publication, the output matches that style.
 */
const STYLE_OUTPUTS: Record<Publication, string> = {
  bild: "Brussels goes ALL IN on AI! The EU's new mega-law targets everything from ChatGPT to facial recognition — and companies that break the rules face fines of up to 35 million euros or 7% of their global revenue. Tech bosses are in shock. But what does this mean for YOU? Experts warn: the AI revolution will never be the same.",
  dw: "The European Union has finalized its AI Act, the first comprehensive legal framework for artificial intelligence. The regulation introduces a risk-based system that bans certain AI practices outright while imposing strict requirements on high-risk applications in areas such as law enforcement, migration, and critical infrastructure.",
  euractiv: "The European Commission is moving to enforce the AI Act's first wave of prohibitions, with delegated acts on high-risk system classification expected by Q3 2025. Member states face mounting pressure to transpose the regulation's supervisory requirements, while industry stakeholders warn that the codes of practice for general-purpose AI models remain insufficiently defined to ensure legal certainty.",
};

/** Mixed-source output when examples from multiple publications are selected */
const MIXED_OUTPUT = "The EU's AI Act — billed as the world's first comprehensive AI regulation — entered its enforcement phase this year, bringing sweeping new rules for developers and deployers. The legislation bans certain high-risk practices outright, including real-time biometric surveillance, while imposing strict transparency and oversight requirements on foundation models. But implementation challenges loom large: several member states have yet to designate supervisory authorities, and industry groups warn that compliance costs could disadvantage European firms on the global stage.";

/** Output when no examples are selected */
const NO_EXAMPLES_OUTPUT = "AI is being regulated by the European Union with a new law called the AI Act. It has different categories for AI systems based on how risky they are. Some uses of AI will be banned, like social scoring. Companies will need to follow new rules and could face fines. The regulation is expected to have a big impact on the technology industry both in Europe and around the world.";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LLMTrainingFewShot() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"voice" | "examples">("examples");
  const [selectedOption, setSelectedOption] = useState<"off" | "on">("off");
  const [selectedExamples, setSelectedExamples] = useState<Set<string>>(new Set());

  const handleToggleExample = (id: string) => {
    setSelectedExamples(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /** Determine which publications have selected examples */
  const selectedPublications = useMemo(() => {
    const pubs = new Set<Publication>();
    selectedExamples.forEach(id => {
      const example = EXAMPLE_LEDES.find(e => e.id === id);
      if (example) pubs.add(example.publication);
    });
    return pubs;
  }, [selectedExamples]);

  /** Derive the output lede based on selected examples */
  const examplesOutput = useMemo(() => {
    if (selectedExamples.size === 0) return NO_EXAMPLES_OUTPUT;
    if (selectedPublications.size === 1) {
      const pub = [...selectedPublications][0];
      return STYLE_OUTPUTS[pub];
    }
    return MIXED_OUTPUT;
  }, [selectedExamples, selectedPublications]);

  /** Derive the ChatPrompt text based on selected examples */
  const examplesPromptText = useMemo(() => {
    if (selectedExamples.size === 0) {
      return "Write a lede for a news article about the EU AI Act.";
    }
    const pubs = [...selectedPublications].map(p => PUBLICATION_LABELS[p]);
    if (pubs.length === 1) {
      return `Write a lede for a news article about the EU AI Act in the style of ${pubs[0]}.`;
    }
    return `Write a lede for a news article about the EU AI Act (examples from ${pubs.join(", ")}).`;
  }, [selectedExamples, selectedPublications]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col pb-10">
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col">
            {/* Breadcrumb for 2xl */}
            <div className="hidden 2xl:block pt-6 pb-5">
              <Breadcrumb />
            </div>

            {/* Three-column layout */}
            <div className="flex flex-1">
              {/* ── Left sidebar ── */}
              <div className="w-80 flex-shrink-0 px-6 pt-6 2xl:pt-0 flex flex-col" style={{ maxHeight: 'calc(100vh - 140px)' }}>
                <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                  Few-shot prompting
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {viewMode === "voice"
                    ? "Providing examples helps guide the model, especially for tailored or uncommon tasks."
                    : "Select example ledes from different publications to see how they shape the model's output style."
                  }
                </p>

                {/* View mode toggle — DW Voice hidden for now
                <div className="mb-4">
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(v) => v && setViewMode(v as typeof viewMode)}
                    className="w-full"
                  >
                    <ToggleGroupItem value="voice" className="flex-1 gap-1.5 text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      DW Voice
                    </ToggleGroupItem>
                    <ToggleGroupItem value="examples" className="flex-1 gap-1.5 text-xs">
                      <MousePointerClick className="h-3.5 w-3.5" />
                      Choose Examples
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                */}

                {/* ── DW Voice view sidebar ── */}
                {viewMode === "voice" && (
                  <>
                    <p className="text-sm font-semibold text-foreground mb-3">
                      Compare how well the LLM generates a DW-style lede with and without examples.
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
                  </>
                )}

                {/* ── Choose Examples view sidebar ── */}
                {viewMode === "examples" && (
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        Select example ledes
                      </p>
                      {selectedExamples.size > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedExamples(new Set())}
                          className="text-[10px] text-muted-foreground hover:text-foreground underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {(["bild", "dw", "euractiv"] as Publication[]).map(pub => {
                      const colors = PUBLICATION_COLORS[pub];
                      const pubExamples = EXAMPLE_LEDES.filter(e => e.publication === pub);
                      return (
                        <div key={pub}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                              colors.bg, colors.text
                            )}>
                              {PUBLICATION_LABELS[pub]}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {pubExamples.map(example => {
                              const isSelected = selectedExamples.has(example.id);
                              return (
                                <button
                                  key={example.id}
                                  type="button"
                                  onClick={() => handleToggleExample(example.id)}
                                  className={cn(
                                    "w-full rounded-lg border p-2.5 text-left transition-all",
                                    isSelected
                                      ? cn(colors.border, "shadow-sm", `ring-1 ${colors.ring}`)
                                      : "border-border hover:shadow-sm"
                                  )}
                                >
                                  <p className="text-xs font-semibold text-foreground leading-snug mb-1">
                                    {example.headline}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                    {example.lede}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {selectedExamples.size > 0 && (
                      <div className="pt-1">
                        <p className="text-[10px] text-muted-foreground">
                          {selectedExamples.size} example{selectedExamples.size !== 1 ? "s" : ""} selected
                          {selectedPublications.size === 1
                            ? ` from ${PUBLICATION_LABELS[[...selectedPublications][0]]}`
                            : selectedPublications.size > 1
                              ? ` across ${selectedPublications.size} publications`
                              : ""
                          }
                        </p>
                      </div>
                    )}
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

                      {/* ── DW Voice view output ── */}
                      {viewMode === "voice" && (
                        <>
                          <ChatPrompt text="Write a lede for a news article about the EU AI Act in the style of DW." fileName="EU_AI_Act.pdf" />
                          <div className="max-h-[500px] overflow-y-auto flex-1">
                            <p className="text-base text-foreground leading-relaxed">
                              {(selectedOption === "on" ? RESPONSE_OFF : RESPONSE_ON).map((part, i) =>
                                part.flagged ? (
                                  <TextFlag
                                    key={`${selectedOption}-${i}`}
                                    text={part.text}
                                    evaluationFactor={part.factor!}
                                    severity={part.severity}
                                    explanation={part.explanation!}
                                  />
                                ) : (
                                  <span key={`${selectedOption}-${i}`}>{part.text}</span>
                                )
                              )}
                            </p>
                          </div>
                        </>
                      )}

                      {/* ── Choose Examples view output ── */}
                      {viewMode === "examples" && (
                        <>
                          <ChatPrompt text={examplesPromptText} fileName="EU_AI_Act.pdf" />
                          <div className="max-h-[500px] overflow-y-auto flex-1">
                            {selectedExamples.size > 0 && selectedPublications.size === 1 && (
                              <div className="mb-3">
                                {(() => {
                                  const pub = [...selectedPublications][0];
                                  const colors = PUBLICATION_COLORS[pub];
                                  return (
                                    <span className={cn(
                                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                      colors.bg, colors.text
                                    )}>
                                      {PUBLICATION_LABELS[pub]} style
                                    </span>
                                  );
                                })()}
                              </div>
                            )}
                            {selectedExamples.size > 0 && selectedPublications.size > 1 && (
                              <div className="mb-3 flex gap-1.5">
                                {[...selectedPublications].map(pub => {
                                  const colors = PUBLICATION_COLORS[pub];
                                  return (
                                    <span key={pub} className={cn(
                                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                      colors.bg, colors.text
                                    )}>
                                      {PUBLICATION_LABELS[pub]}
                                    </span>
                                  );
                                })}
                                <span className="text-[10px] text-muted-foreground self-center">mixed style</span>
                              </div>
                            )}
                            <p className="text-base text-foreground leading-relaxed">
                              {examplesOutput}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Navigation buttons */}
                      <div className="mt-8 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/module/llm-training")}
                          className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                        >
                          <ArrowLeft className="!h-5 !w-5 -ml-2" />
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/module/llm-training/supervised")}
                          className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                        >
                          Next (Supervised Learning)
                          <ArrowRight className="-mr-2 !h-6 !w-6" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right sidebar - Evaluation */}
                  <div className="w-80 flex-shrink-0">
                    <EvaluationPanel initialIsOpen={false} canClose={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* LLM Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 z-10 px-3 py-2 bg-background/80 backdrop-blur-sm">
        <p className="text-[13px] leading-snug text-muted-foreground/70 text-left">
          LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
        </p>
      </div>
    </div>
  );
}
