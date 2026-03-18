import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import EvaluationPanel from "@/components/EvaluationPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, File, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface DocumentItem {
  id: string;
  icon: "research" | "ethics" | "article";
  date: string;
  title: string;
  source: string;
}

const DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    icon: "research",
    date: "June 2024",
    title: "Trusted Journalism in the Age of Generative AI",
    source: "Research Paper",
  },
  {
    id: "doc-2",
    icon: "ethics",
    date: "Date",
    title: "AI Ethics Guides for Media Organizations",
    source: "Source",
  },
  {
    id: "doc-3",
    icon: "article",
    date: "Date",
    title: "What is Deutsche Welle's approach to generative AI?",
    source: "Deutsche Welle …",
  },
];

const SNIPPETS = [
  {
    title: 'Trusted Journalism in the Age of Generative AI":',
    paragraphs: [
      "An ethical approach to using AI in the media is called for. First, media organisations need an AI strategy and to focus on what the technology can contribute to delivering public service value.",
      "Organisations should also use their power and influence when purchasing products, lobbying for regulation, and getting involved in copyright and data protection debates.",
      "It is imperative for every company to regularly scrutinise the products they use for biases and stereotypes to avoid the amplification of harm.",
    ],
  },
];

const RESPONSE_TEXT = `Obligations for Providers: The majority of obligations fall on providers (developers) of high-risk AI systems, including those outside the EU if their systems are used within the EU.

User Responsibilities: Users (deployers) of high-risk AI systems have certain obligations, though less than providers.`;

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MultipleSourcesExercise() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set([DOCUMENTS[0].id, DOCUMENTS[1].id]));
  const [snippetsOpen, setSnippetsOpen] = useState(true);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
                <h2 className="text-h4 font-heading font-bold text-foreground mb-3">
                  Multiple Documents
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Compare how the output changes based on three distinct sources and evaluate their respective outputs side-by-side to gain a comprehensive understanding of the topic.
                </p>

                <p className="text-sm font-semibold text-foreground mb-3">
                  Select one or more documents
                </p>

                <div className="space-y-3">
                  {DOCUMENTS.map((doc) => {
                    const isSelected = selected.has(doc.id);
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => toggle(doc.id)}
                        className={cn(
                          "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-shadow",
                          isSelected
                            ? "border-brand-tertiary-500 shadow-sm"
                            : "border-border hover:shadow-md"
                        )}
                      >
                        <File className="h-8 w-8 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-muted-foreground">{doc.date}</span>
                          <span className="text-sm font-semibold text-foreground leading-tight block">
                            {doc.title}
                          </span>
                          <span className="text-xs text-muted-foreground">{doc.source}</span>
                        </div>
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
                      <div className="max-h-[500px] overflow-y-auto flex-1">
                        <div className="space-y-4">
                          <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                            {RESPONSE_TEXT}
                          </p>
                        </div>
                      </div>

                      {/* Takeaways button */}
                      <div className="mt-8">
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

              {/* ── Right sidebar ── */}
              <div className="w-80 flex-shrink-0">
                <EvaluationPanel initialIsOpen={false} canClose={true} />

                {/* Retrieved Snippets */}
                <div className="px-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setSnippetsOpen(!snippetsOpen)}
                    className="flex items-center gap-2 text-base font-semibold font-heading text-foreground mb-3"
                  >
                    Retrieved Snippets
                    {snippetsOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {snippetsOpen && (
                    <div className="space-y-4">
                      {SNIPPETS.map((snippet, i) => (
                        <div
                          key={i}
                          className="border border-border rounded-lg p-4 space-y-3"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {snippet.title}
                          </p>
                          {snippet.paragraphs.map((para, j) => (
                            <p
                              key={j}
                              className="text-sm text-muted-foreground leading-relaxed"
                            >
                              {para}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* LLM Disclaimer */}
      <div className="fixed bottom-3 left-3 text-[13px] leading-snug text-muted-foreground/70 text-left">
        LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
      </div>

      <ModuleNavigation
        previousRoute="/module/multiple-sources"
        nextRoute="/modules"
      />
    </div>
  );
}
