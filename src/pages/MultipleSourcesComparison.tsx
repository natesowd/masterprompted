import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Search, Bot, Database, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface DocSource {
  id: string;
  label: string;
  color: string;
  borderColor: string;
  snippet: string;
}

const DOCUMENTS: DocSource[] = [
  {
    id: "doc-1",
    label: "Trusted Journalism in the Age of Generative AI",
    color: "bg-blue-50",
    borderColor: "border-blue-300",
    snippet:
      "Media organisations need an AI strategy focused on public service value. They should scrutinise products for biases and stereotypes to avoid amplification of harm.",
  },
  {
    id: "doc-2",
    label: "AI Ethics Guides for Media Organizations",
    color: "bg-amber-50",
    borderColor: "border-amber-300",
    snippet:
      "Media organisations must establish clear governance frameworks for AI use, including editorial oversight mechanisms and accountability structures.",
  },
  {
    id: "doc-3",
    label: "Deutsche Welle's approach to generative AI",
    color: "bg-emerald-50",
    borderColor: "border-emerald-300",
    snippet:
      "DW uses AI tools to support journalists but maintains that final editorial decisions must always rest with human editors.",
  },
];

const LLM_DATABASE_SNIPPET =
  "General training data: AI ethics principles, journalism standards, technology policy debates, and millions of web pages the model was trained on.";

/* ── Search engine results: sources kept separate ── */
const SEARCH_RESULTS: Record<number, { source: string; text: string; color: string }[]> = {
  1: [
    {
      source: "Trusted Journalism in the Age of Generative AI",
      text: "Media organisations need an AI strategy focused on public service value. They should scrutinise products for biases and stereotypes to avoid amplification of harm.",
      color: "bg-blue-50 border-blue-200",
    },
  ],
  2: [
    {
      source: "Trusted Journalism in the Age of Generative AI",
      text: "Media organisations need an AI strategy focused on public service value. They should scrutinise products for biases and stereotypes to avoid amplification of harm.",
      color: "bg-blue-50 border-blue-200",
    },
    {
      source: "AI Ethics Guides for Media Organizations",
      text: "Media organisations must establish clear governance frameworks for AI use, including editorial oversight mechanisms and accountability structures.",
      color: "bg-amber-50 border-amber-200",
    },
  ],
  3: [
    {
      source: "Trusted Journalism in the Age of Generative AI",
      text: "Media organisations need an AI strategy focused on public service value. They should scrutinise products for biases and stereotypes to avoid amplification of harm.",
      color: "bg-blue-50 border-blue-200",
    },
    {
      source: "AI Ethics Guides for Media Organizations",
      text: "Media organisations must establish clear governance frameworks for AI use, including editorial oversight mechanisms and accountability structures.",
      color: "bg-amber-50 border-amber-200",
    },
    {
      source: "Deutsche Welle's approach to generative AI",
      text: "DW uses AI tools to support journalists but maintains that final editorial decisions must always rest with human editors.",
      color: "bg-emerald-50 border-emerald-200",
    },
  ],
};

/* ── LLM merged outputs: information blended together ── */
const LLM_OUTPUTS: Record<number, { text: string; issues: string[] }> = {
  1: {
    text: "Public service media have a special responsibility to inform, educate, and connect people. Human judgment must remain at the heart of editorial decisions, and ethics must guide all technological choices. Organizations must guard public trust carefully.",
    issues: [
      "\"inform, educate, and connect\" — not in the source document",
      "\"Human judgment must remain at the heart\" — fabricated quote",
      "\"guard public trust\" — paraphrased from training data, not the document",
    ],
  },
  2: {
    text: "Journalists are the gatekeepers of accuracy and fairness in the age of AI. Media organizations must establish governance frameworks while investing in training staff on AI risks. Regulators and policymakers also bear responsibility for creating legal frameworks to govern AI use in journalism.",
    issues: [
      "\"gatekeepers\" — neither document uses this word",
      "\"training staff on AI risks\" — not in either source",
      "\"Regulators and policymakers\" — entire category invented by the model",
    ],
  },
  3: {
    text: "DW is firmly committed to journalism produced by people. Their journalists control all applications and review everything before publication. Combined with governance frameworks from ethics boards and the principle that a human is always responsible for outcomes when AI is used, the industry is moving toward responsible AI adoption.",
    issues: [
      "\"control all applications\" — not in any source document",
      "\"a human is always responsible\" — fabricated attribution",
      "Information from 3 distinct sources blended into one seamless narrative with no attribution",
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MultipleSourcesComparison() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"search" | "llm">("search");
  const [docCount, setDocCount] = useState(1);

  const activeDocs = DOCUMENTS.slice(0, docCount);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col pb-10">
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col">
            <div className="hidden 2xl:block pt-6 pb-5">
              <Breadcrumb />
            </div>

            <div className="flex flex-1">
              {/* ── Left sidebar ── */}
              <div className="w-80 flex-shrink-0 px-6 pt-6 2xl:pt-0">
                <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                  LLM vs Search Engine
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  See how an LLM merges information from multiple sources into one answer — and how a search engine keeps each source separate.
                </p>

                {/* Mode toggle */}
                <p className="text-sm font-semibold text-foreground mb-3">
                  Select a mode
                </p>
                <div className="space-y-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setMode("search")}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-shadow",
                      mode === "search"
                        ? "border-brand-tertiary-500 shadow-sm bg-brand-tertiary-500/5"
                        : "border-border hover:shadow-md"
                    )}
                  >
                    <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">Search Engine</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("llm")}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-shadow",
                      mode === "llm"
                        ? "border-brand-tertiary-500 shadow-sm bg-brand-tertiary-500/5"
                        : "border-border hover:shadow-md"
                    )}
                  >
                    <Bot className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">LLM</span>
                  </button>
                </div>

                {/* Document count */}
                <p className="text-sm font-semibold text-foreground mb-3">
                  Number of documents
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDocCount(n)}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-sm font-semibold font-heading transition-all",
                        docCount === n
                          ? "border-brand-tertiary-500 bg-brand-tertiary-500/10 text-brand-tertiary-500"
                          : "border-border text-muted-foreground hover:border-muted-foreground/40"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Center content ── */}
              <div className="flex-initial flex flex-col px-6 py-6 2xl:pt-0 items-start">
                <div className="w-full max-w-[1100px] 2xl:hidden">
                  <Breadcrumb />
                  <div className="mb-5" />
                </div>

                <div className="max-w-[1100px] w-full">
                  {/* Query */}
                  <div className="mb-6 ml-auto max-w-[80%] bg-muted p-5 rounded-[20px]">
                    <p className="text-foreground leading-relaxed">
                      Who holds the most responsibility to uphold AI ethics?
                    </p>
                  </div>

                  {/* ── Block diagram ── */}
                  <div className="space-y-6">
                    {/* Input sources row */}
                    <div>
                      <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Input Sources
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        {activeDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className={cn(
                              "flex-1 min-w-[180px] rounded-lg border-2 p-4 transition-all",
                              doc.color,
                              doc.borderColor
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs font-semibold text-foreground line-clamp-1">
                                {doc.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {doc.snippet}
                            </p>
                          </div>
                        ))}

                        {/* LLM training data block — only in LLM mode */}
                        {mode === "llm" && (
                          <div className="flex-1 min-w-[180px] rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="h-4 w-4 text-purple-500 flex-shrink-0" />
                              <span className="text-xs font-semibold text-purple-700">
                                LLM Training Data
                              </span>
                            </div>
                            <p className="text-xs text-purple-600/70 leading-relaxed">
                              {LLM_DATABASE_SNIPPET}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Processing arrow / merge indicator */}
                    <div className="flex justify-center">
                      <div
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-heading font-semibold",
                          mode === "search"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {mode === "search" ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Sources kept separate
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4" />
                            All sources merged into one output
                          </>
                        )}
                      </div>
                    </div>

                    {/* Output */}
                    <div>
                      <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Output
                      </p>

                      {mode === "search" ? (
                        /* Search engine: separate results with clear attribution */
                        <div className="space-y-3">
                          {SEARCH_RESULTS[docCount].map((result, i) => (
                            <div
                              key={i}
                              className={cn("rounded-lg border p-4", result.color)}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-semibold text-foreground">
                                  {result.source}
                                </span>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed">
                                {result.text}
                              </p>
                            </div>
                          ))}

                          <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                            <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-700 leading-relaxed">
                              Each result is clearly attributed to its source. You can verify claims by checking the original document.
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* LLM: merged output with hallucination flags */
                        <div className="space-y-3">
                          <div className="rounded-lg border border-border bg-white p-4">
                            <p className="text-sm text-foreground leading-relaxed">
                              {LLM_OUTPUTS[docCount].text}
                            </p>
                          </div>

                          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <span className="text-xs font-semibold text-red-700">
                                Information mixing detected
                              </span>
                            </div>
                            <ul className="space-y-1.5">
                              {LLM_OUTPUTS[docCount].issues.map((issue, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-red-600/80 leading-relaxed flex items-start gap-1.5"
                                >
                                  <span className="text-red-400 mt-0.5">&#x2022;</span>
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="mt-10 mb-12 flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate("/module/multiple-sources/exercise")}
                      className="h-12 w-12 border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                    >
                      <ArrowLeft className="!h-6 !w-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/module/multiple-sources/takeaways")}
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
        </div>
      </main>

      <ModuleNavigation
        previousRoute="/module/multiple-sources/exercise"
        nextRoute="/module/multiple-sources/takeaways"
      />

      {/* LLM Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 z-10 px-3 py-2 bg-background/80 backdrop-blur-sm">
        <p className="text-[13px] leading-snug text-muted-foreground/70 text-left">
          LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
        </p>
      </div>
    </div>
  );
}
