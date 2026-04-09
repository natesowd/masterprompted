import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import EvaluationPanel from "@/components/EvaluationPanel";
import TextFlag from "@/components/TextFlag";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, ArrowRight, File, Paperclip, ChevronDown, ChevronUp, Bot, Search, Database, FileText, ArrowDown, Lock, Eye, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface DocumentItem {
  id: string;
  date: string;
  title: string;
  source: string;
}

interface Snippet {
  title: string;
  paragraphs: string[];
}

const DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    date: "June 2024",
    title: "Trusted Journalism in the Age of Generative AI",
    source: "Research Paper",
  },
  {
    id: "doc-2",
    date: "March 2024",
    title: "AI Ethics Guides for Media Organizations",
    source: "Ethics Board Report",
  },
  {
    id: "doc-3",
    date: "January 2025",
    title: "What is Deutsche Welle's approach to generative AI?",
    source: "Deutsche Welle",
  },
];

/* Per-document retrieved snippets (RAG) */
const SNIPPETS_BY_DOC: Record<string, Snippet[]> = {
  "doc-1": [
    {
      title: "Trusted Journalism in the Age of Generative AI:",
      paragraphs: [
        "An ethical approach to using AI in the media is called for. First, media organisations need an AI strategy and to focus on what the technology can contribute to delivering public service value.",
        "Organisations should also use their power and influence when purchasing products, lobbying for regulation, and getting involved in copyright and data protection debates.",
        "It is imperative for every company to regularly scrutinise the products they use for biases and stereotypes to avoid the amplification of harm.",
      ],
    },
  ],
  "doc-2": [
    {
      title: "AI Ethics Guides for Media Organizations:",
      paragraphs: [
        "Media organisations must establish clear governance frameworks for AI use, including editorial oversight mechanisms and accountability structures.",
        "Transparency with audiences about AI-generated or AI-assisted content is a fundamental ethical obligation for news organizations.",
      ],
    },
  ],
  "doc-3": [
    {
      title: "Deutsche Welle's approach to generative AI:",
      paragraphs: [
        "DW uses AI tools to support journalists but maintains that final editorial decisions must always rest with human editors.",
        "The organization has developed internal guidelines that require labelling of AI-assisted content and prohibit fully automated publishing without human review.",
      ],
    },
  ],
};

/* ── Difference flags ── */
/* Each flag highlights a phrase unique to or notably different from other docs/output */
interface FlagDef {
  text: string;
  explanation: string;
}

/* ── Output difference flags ── */
/* Highlights where the LLM output contains quotes or claims not found in the retrieved snippets */
const OUTPUT_FLAGS: Record<string, FlagDef[]> = {
  "doc-1": [
    { text: "Public service media have a special responsibility in this context. While they are bound by the mission and mandate to inform, educate, and connect people, they are also accountable to the public.", explanation: "This is presented as a direct quote from the document, but this text does not appear anywhere in the retrieved snippet. The snippet discusses AI strategy and public service value — not a specific mandate to 'inform, educate, and connect'." },
    { text: "Human judgment must remain at the heart of our editorial decisions.", explanation: "Fabricated quote: the retrieved snippet discusses scrutinising products for 'biases and stereotypes' — it never mentions 'editorial decisions' or 'human judgment'." },
    { text: "We must guard this trust like the apple of our eye.", explanation: "This quote does not appear in the retrieved snippet. The snippet focuses on AI strategy, regulation lobbying, and bias scrutiny — trust preservation is not mentioned." },
    { text: "Ethics must guide our technological choices.", explanation: "Another fabricated quote. The retrieved snippet says organisations need 'an AI strategy' and should 'scrutinise the products they use' — it never frames this as 'technological choices'." },
    { text: "The industry's outlook on tech has changed... The current generation of decision makers are in many ways more realistic about the benefits and risks of new technologies than their predecessors.", explanation: "This quote is not in the retrieved snippet. The model appears to have generated text that sounds authoritative but cannot be verified against the provided source material." },
  ],
  "doc-1,doc-2": [
    { text: "journalists are gatekeepers of accuracy and fairness", explanation: "Neither snippet uses the word 'gatekeepers'. Doc 1 mentions 'scrutinise products for biases'; Doc 2 mentions 'editorial oversight mechanisms' — the model reframes these with its own terminology." },
    { text: "AI Developers and Technology Providers", explanation: "Neither Doc 1 nor Doc 2 snippets mention AI developers or technology providers. The model introduces an entire responsibility category not supported by the retrieved text." },
    { text: "Regulators and Policymakers", explanation: "No retrieved snippet mentions regulators or policymakers. The model fabricates this section, including claims about 'legal and regulatory frameworks' attributed to 'the YLE guide'." },
    { text: "Invest in training staff on AI risks and ethical implications", explanation: "Not in either retrieved snippet. The snippets discuss governance frameworks and transparency obligations — staff training is the model's own addition." },
  ],
  "doc-1,doc-2,doc-3": [
    { text: "DW is firmly committed to journalism that is produced by people.", explanation: "Presented as a DW quote, but the Doc 3 snippet actually says 'DW uses AI tools to support journalists but maintains that final editorial decisions must always rest with human editors' — similar sentiment, different wording." },
    { text: "Our journalists will continue to control all applications and thoroughly review anything before publication.", explanation: "This quote is not in the Doc 3 snippet. The snippet mentions 'labelling of AI-assisted content' and prohibiting 'fully automated publishing' — not 'control all applications'." },
    { text: "A human is always responsible for the outcome when AI is used.", explanation: "Attributed to 'Yle principles', but the Doc 2 snippet discusses 'governance frameworks' and 'transparency with audiences' — this specific principle is not in the retrieved text." },
    { text: "AI chatbots, such as ChatGPT, cannot be relied upon as accurate sources of information.", explanation: "Not found in any retrieved snippet. The model presents this as a DW quote, but it's not supported by the retrieved document excerpts." },
    { text: "Generative AI makes it easier to produce and spread disinformation around the world. It is our job as journalists to expose this disinformation.", explanation: "This quote about disinformation does not appear in any of the three retrieved snippets. The model introduces content beyond what was retrieved." },
  ],
};

/** Render a response with inline TextFlag annotations for output-vs-snippet differences */
function renderFlaggedResponse(
  text: string,
  flags: FlagDef[],
): React.ReactNode {
  if (!flags || flags.length === 0) return text;

  // Split into lines, process each
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />);

    // Find flags that match in this line
    const lineFlags = flags
      .map((f) => ({ ...f, index: line.indexOf(f.text) }))
      .filter((f) => f.index !== -1)
      .sort((a, b) => a.index - b.index);

    if (lineFlags.length === 0) {
      result.push(<span key={`line-${lineIdx}`}>{line}</span>);
      return;
    }

    let last = 0;
    lineFlags.forEach((flag, i) => {
      if (flag.index > last) {
        result.push(<span key={`line-${lineIdx}-t${i}`}>{line.slice(last, flag.index)}</span>);
      }
      result.push(
        <TextFlag
          key={`line-${lineIdx}-f${i}`}
          text={flag.text}
          evaluationFactor="factual_accuracy"
          explanation={flag.explanation}
          severity="warning"
        />,
      );
      last = flag.index + flag.text.length;
    });
    if (last < line.length) {
      result.push(<span key={`line-${lineIdx}-end`}>{line.slice(last)}</span>);
    }
  });

  return <>{result}</>;
}


/* Per-document-combination responses (simulated RAG output) */
const RESPONSES: Record<string, string> = {
  "doc-1": `It's all about fostering innovation while protecting people's rights, promoting fairness, and making sure AI works for everyone.

Want to dive deeper into specific sectors like healthcare, education, or law enforcement? I can break those down too!

Key Points from the Document:

Public Service Media Responsibility:

"Public service media have a special responsibility in this context. While they are bound by the mission and mandate to inform, educate, and connect people, they are also accountable to the public."

Public service organizations must balance the opportunities AI offers with the risks it poses, ensuring it aligns with their ethical mission.

Human Oversight and Judgment:

"Human judgment must remain at the heart of our editorial decisions."

Journalistic organizations are responsible for ensuring that AI tools are used to augment rather than replace human decision-making.

Safeguarding Public Trust:

"We must guard this trust like the apple of our eye."

The document highlights the critical role organizations play in maintaining public confidence in journalism by responsibly managing AI tools and outputs.

Ethical Standards:

"Ethics must guide our technological choices."

Journalistic organizations must establish and follow ethical guidelines to ensure that AI supports, rather than undermines, their credibility.

Monitoring and Combating Risks:

The document stresses the risks of AI, including disinformation, bias, and over-reliance on tech giants. Organizations are tasked with actively addressing these challenges:

"The industry's outlook on tech has changed... The current generation of decision makers are in many ways more realistic about the benefits and risks of new technologies than their predecessors."

Conclusion:

In the context of the document, journalistic organizations bear the primary responsibility for upholding AI ethics. They must ensure that AI tools align with editorial values, are transparently used, and are managed to support public trust and journalistic integrity. This responsibility is amplified for public service media, which have a specific mandate to serve society ethically and inclusively.`,

  "doc-2": `AI Ethics in Media: Media organisations must establish clear governance frameworks for AI use, including editorial oversight and accountability structures.

Transparency with audiences about AI-generated content is a fundamental ethical obligation. Organizations should implement labelling systems and disclosure policies.`,

  "doc-3": `Deutsche Welle's AI Approach: DW uses AI tools to support journalists while maintaining that final editorial decisions rest with human editors.

Internal guidelines require labelling of AI-assisted content and prohibit fully automated publishing without human review.`,

  "doc-1,doc-2": `In light of the two documents — "TRUSTED JOURNALISM in the Age of Generative AI" and "AI Ethics Guides for Media Organizations" (by YLE) — the primary responsibility to uphold AI ethics falls most heavily on media organizations and their leadership.

Here's a breakdown of where the responsibility lies, according to the themes in both documents:

1. Media Organizations and Leadership

Primary responsibility

Why?

Both documents stress the need for institutional accountability. The YLE guide, for example, emphasizes that ethical AI use must be embedded in organizational policies, not left to individual discretion.

Media outlets control the design, deployment, and oversight of AI tools in news production and distribution.

What they must do:

Ensure transparency in AI-assisted journalism.

Establish editorial standards and governance structures for AI use.

Invest in training staff on AI risks and ethical implications.

2. Journalists and Editorial Teams

Secondary responsibility

Why?

As users of AI in reporting or editing tasks, journalists are gatekeepers of accuracy and fairness.

The "Trusted Journalism" paper highlights the need for human oversight in content generated or augmented by AI.

What they must do:

Maintain editorial judgment and verify AI outputs.

Be transparent with audiences about how AI was used in creating content.

3. AI Developers and Technology Providers

Shared but more indirect responsibility

Why?

While developers do not control the editorial process, they are responsible for the design and integrity of the AI systems used by media.

What they must do:

Provide systems that are transparent, explainable, and designed with ethical safeguards.

Collaborate with media organizations to tailor tools for responsible use.

4. Regulators and Policymakers

Supportive responsibility

Why?

The YLE guide calls for legal and regulatory frameworks that support responsible AI use while preserving freedom of the press.

What they must do:

Define boundaries for acceptable AI use.

Protect journalistic independence while ensuring public accountability.

Conclusion

Media organizations themselves hold the most responsibility to uphold AI ethics — through clear policies, oversight, and culture. However, journalists, developers, and regulators all share supporting roles in ensuring ethical, transparent, and trustworthy journalism in the age of AI.

Let me know if you'd like a chart or summary comparing these roles!`,

  "doc-1,doc-3": `Trusted Journalism & DW's Approach: Media organisations need an AI strategy focused on public service value. DW exemplifies this by using AI to support journalists while keeping editorial control with humans.

Both sources emphasise the need to scrutinise AI tools for biases and maintain transparency through content labelling and human oversight.`,

  "doc-2,doc-3": `Ethics & Practice: Clear governance frameworks for AI use are essential, as demonstrated by DW's internal guidelines requiring human editorial oversight.

Transparency obligations include labelling AI-assisted content and ensuring audiences understand when AI tools have been used in the editorial process.`,

  "doc-1,doc-2,doc-3": `1. Journalistic Organizations (Primary Responsibility)

Organizations like Deutsche Welle (DW) and Yle hold the most responsibility because they are accountable for the content they produce, the decisions they make about AI implementation, and how they maintain trust with their audiences.

Supporting Quotes:

"DW is firmly committed to journalism that is produced by people."

This highlights that the ultimate control lies with human journalists, ensuring they uphold high ethical standards.

"Our journalists will continue to control all applications and thoroughly review anything before publication."

Reinforces that the responsibility for ethical decisions about AI outputs rests on the organization and its journalists.

"A human is always responsible for the outcome when AI is used." (Yle principles)

Aligns with DW's stance on maintaining human oversight.

DW's transparent and hands-on approach ensures that AI tools are aids, not replacements, reinforcing that organizations are stewards of ethical AI use.

2. Developers of AI Systems

While journalistic organizations are responsible for how they use AI, developers like OpenAI and Google share significant responsibility for ensuring their tools are designed ethically. They must:

Minimize inherent biases in their models.

Improve the transparency of how their systems function, as DW noted: "AI chatbots, such as ChatGPT, cannot be relied upon as accurate sources of information."

Generative AI creators are responsible for providing tools that organizations can ethically use but have less control over how their products are applied downstream.

3. Public Service and Media Organizations

Public broadcasters like DW and Yle play a unique role in upholding ethics because they have a public service mandate. Their responsibility extends to:

Exposing and countering disinformation, as DW emphasizes: "Generative AI makes it easier to produce and spread disinformation around the world. It is our job as journalists to expose this disinformation."

Expanding fact-checking capacity to combat AI-generated falsehoods.

Acting as role models in transparent AI usage, which DW and Yle commit to.

4. Governments and Regulators

Governments hold secondary responsibility in creating frameworks for AI ethics. However, their role is more indirect and often reactive. Their ability to enforce standards complements organizational efforts but does not supersede the immediate accountability of AI users.

5. Individual Journalists

Journalists are front-line practitioners, but their responsibility is bounded by organizational policies. For instance:

DW requires journalists to verify AI-generated insights and never rely on chatbots as direct sources. "We will verify any information we know comes from a chatbot in the same way we verify information from other sources."

Conclusion

The most responsibility lies with journalistic organizations, like DW and Yle, as they integrate AI into their workflows while upholding ethical standards and trust. Developers and regulators play supporting roles by shaping tools and frameworks that facilitate ethical AI use. This layered accountability ensures that AI enhances journalism without compromising its core values of independence, transparency, and accuracy.`,
};

/* ------------------------------------------------------------------ */
/* ── "How it works" block-diagram data                                */
/* ------------------------------------------------------------------ */

const LLM_DATABASE_SNIPPET =
  "AI ethics principles, journalism standards, technology policy debates, and millions of web pages the model was trained on.";

/* What the LLM "extracts" per doc (short fragments, some fabricated) */
const LLM_EXTRACTIONS: Record<string, string> = {
  "doc-1": "\"AI strategy for public service\" · \"scrutinise for biases\" · \"guard public trust\"",
  "doc-2": "\"governance frameworks\" · \"editorial oversight\" · \"training staff on AI risks\"",
  "doc-3": "\"journalism produced by people\" · \"control all applications\" · \"review before publication\"",
};

const LLM_MERGED_OUTPUTS: Record<string, { text: string; issues: string[] }> = {
  "doc-1": {
    text: "Public service media have a special responsibility to inform, educate, and connect people. Human judgment must remain at the heart of editorial decisions, and ethics must guide all technological choices.",
    issues: [
      "\"inform, educate, and connect\" — not in the source document",
      "\"Human judgment must remain at the heart\" — fabricated quote",
      "\"guard public trust\" — paraphrased from training data, not the document",
    ],
  },
  "doc-1,doc-2": {
    text: "Journalists are the gatekeepers of accuracy and fairness in the age of AI. Media organizations must establish governance frameworks while investing in training staff on AI risks. Regulators and policymakers also bear responsibility.",
    issues: [
      "\"gatekeepers\" — neither document uses this word",
      "\"training staff on AI risks\" — not in either source",
      "\"Regulators and policymakers\" — entire category invented by the model",
    ],
  },
  "doc-1,doc-2,doc-3": {
    text: "DW is firmly committed to journalism produced by people. Their journalists control all applications and review everything before publication. Combined with governance frameworks from ethics boards, the industry is moving toward responsible AI adoption.",
    issues: [
      "\"control all applications\" — not in any source document",
      "\"a human is always responsible\" — fabricated attribution",
      "Information from 3 sources + training data blended with no attribution",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* ── Page ── */
/* ------------------------------------------------------------------ */

export default function MultipleSourcesExercise() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set(["doc-1"]));
  const [snippetsOpen, setSnippetsOpen] = useState(true);
  /* Top-level view: "exercise" (original) or "how-it-works" (block diagram) */
  const [topView, setTopView] = useState<"exercise" | "how-it-works">("exercise");
  /* Inside "how-it-works": which route has the user chosen? */
  const [diagramRoute, setDiagramRoute] = useState<null | "llm" | "search">(null);
  /* Separate doc selection for the LLM diagram (independent from exercise) */
  const [diagramDocs, setDiagramDocs] = useState<Set<string>>(new Set(["doc-1"]));

  /* Only allow sequential selection: doc-1, doc-1+doc-2, doc-1+doc-2+doc-3 */
  const ALLOWED_SETS: string[][] = [
    ["doc-1"],
    ["doc-1", "doc-2"],
    ["doc-1", "doc-2", "doc-3"],
  ];

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // Check if the resulting set is allowed
      const nextArr = Array.from(next).sort();
      const isAllowed = ALLOWED_SETS.some(
        (allowed) => allowed.length === nextArr.length && allowed.every((v, i) => v === nextArr[i])
      );
      if (!isAllowed) return prev; // reject invalid combination
      return next;
    });
  };

  /* Diagram doc toggle (free selection, not sequential) */
  const toggleDiagramDoc = (id: string) => {
    setDiagramDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); } // keep at least 1
      else next.add(id);
      return next;
    });
  };

  const diagramSelectionKey = useMemo(() => Array.from(diagramDocs).sort().join(","), [diagramDocs]);
  const diagramSelectedDocs = useMemo(() => DOCUMENTS.filter((d) => diagramDocs.has(d.id)), [diagramDocs]);

  /* Derive response and snippets from selected documents */
  const selectionKey = useMemo(() => {
    const sorted = Array.from(selected).sort();
    return sorted.join(",");
  }, [selected]);

  const currentResponse = RESPONSES[selectionKey] || "Select one or more documents to generate a response.";

  const currentSnippets = useMemo(() => {
    const sorted = Array.from(selected).sort();
    return sorted.flatMap((id) => (SNIPPETS_BY_DOC[id] || []).map((s) => ({ ...s, docId: id })));
  }, [selected]);

  const selectedDocs = useMemo(() => {
    return DOCUMENTS.filter((doc) => selected.has(doc.id));
  }, [selected]);

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
              <div className="w-80 flex-shrink-0 px-6 pt-6 2xl:pt-0">
                <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                  Multiple Documents
                </h2>

                {/* Top-level view toggle */}
                <div className="mb-5">
                  <ToggleGroup
                    type="single"
                    value={topView}
                    onValueChange={(v) => { if (v) { setTopView(v as typeof topView); if (v === "how-it-works") setDiagramRoute(null); } }}
                    className="w-full"
                  >
                    <ToggleGroupItem value="exercise" className="flex-1 gap-1.5 text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      Exercise
                    </ToggleGroupItem>
                    <ToggleGroupItem value="how-it-works" className="flex-1 gap-1.5 text-xs">
                      <Layers className="h-3.5 w-3.5" />
                      How It Works
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* ── Exercise sidebar ── */}
                {topView === "exercise" && (
                  <>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Compare how the output changes based on three distinct sources and evaluate their respective outputs side-by-side.
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
                            <File className="h-8 text-muted-foreground flex-shrink-0 my-[23px] w-[32px]" strokeWidth={1.5} />
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
                  </>
                )}

                {/* ── How-it-works sidebar (minimal — controls are in main column) ── */}
                {topView === "how-it-works" && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Explore how an LLM and a search engine each process the same query with multiple documents.
                  </p>
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

                    {/* ============================================ */}
                    {/* EXERCISE VIEW (original)                      */}
                    {/* ============================================ */}
                    {topView === "exercise" && (
                      <div className="bg-background rounded-lg p-8 flex-1 flex flex-col">
                        <div
                          className="mb-6 mx-2 max-w-fit ml-auto bg-muted p-5 max-w-[80%]"
                          style={{ borderRadius: '20px' }}
                        >
                          <p className="text-foreground leading-relaxed">
                            Who holds the most responsibility to uphold AI ethics?
                          </p>
                          {selectedDocs.length > 0 && (
                            <div className="flex flex-col gap-1 mt-2">
                              {selectedDocs.map((doc) => (
                                <div key={doc.id} className="inline-flex items-center gap-2">
                                  <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm text-foreground font-medium">{doc.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="max-h-[500px] overflow-y-auto flex-1">
                          <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                              {renderFlaggedResponse(currentResponse, OUTPUT_FLAGS[selectionKey] || [])}
                            </p>
                          </div>
                        </div>
                        <div className="mt-8 flex items-center gap-3">
                          <Button variant="outline" size="lg" onClick={() => navigate("/module/multiple-sources")} className="rounded-md border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10">
                            <ArrowLeft className="!h-5 !w-5" />
                          </Button>
                          <Button variant="outline" size="lg" onClick={() => navigate("/module/multiple-sources/takeaways")} className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10">
                            Takeaways <ArrowRight className="-mr-2 !h-6 !w-6" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* ============================================ */}
                    {/* HOW IT WORKS VIEW                             */}
                    {/* ============================================ */}
                    {topView === "how-it-works" && (
                      <div className="bg-background rounded-lg p-8 flex-1 flex flex-col">

                        {/* Route chooser (inline in main column) */}
                        {!diagramRoute && (
                          <>
                            <p className="text-sm text-muted-foreground mb-6">
                              How does each approach handle the same query with multiple documents?
                            </p>
                            <div className="mb-6 ml-auto max-w-[80%] bg-muted p-5 rounded-[20px]">
                              <p className="text-foreground leading-relaxed">
                                Who holds the most responsibility to uphold AI ethics?
                              </p>
                            </div>
                            <div className="flex gap-4 mt-4">
                              <button
                                type="button"
                                onClick={() => setDiagramRoute("llm")}
                                className="flex-1 flex flex-col items-center gap-3 rounded-xl border-2 border-border hover:border-brand-tertiary-500 p-6 transition-all hover:shadow-md"
                              >
                                <Bot className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm font-heading font-semibold text-foreground">LLM</span>
                                <span className="text-xs text-muted-foreground text-center">Merges all sources into one answer</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDiagramRoute("search")}
                                className="flex-1 flex flex-col items-center gap-3 rounded-xl border-2 border-border hover:border-brand-tertiary-500 p-6 transition-all hover:shadow-md"
                              >
                                <Search className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm font-heading font-semibold text-foreground">Search Engine</span>
                                <span className="text-xs text-muted-foreground text-center">Keeps each source separate</span>
                              </button>
                            </div>
                          </>
                        )}

                        {/* ── LLM block diagram ── */}
                        {diagramRoute === "llm" && (
                          <div className="flex-1 space-y-4">
                            <button
                              type="button"
                              onClick={() => setDiagramRoute(null)}
                              className="text-xs text-brand-tertiary-500 font-semibold flex items-center gap-1 hover:underline mb-2"
                            >
                              <ArrowLeft className="h-3 w-3" /> Back
                            </button>

                            {/* Document selector (inline) */}
                            <div>
                              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Select documents to include
                              </p>
                              <div className="flex gap-2 flex-wrap mb-1">
                                {DOCUMENTS.map((doc) => {
                                  const isOn = diagramDocs.has(doc.id);
                                  return (
                                    <button
                                      key={doc.id}
                                      type="button"
                                      onClick={() => toggleDiagramDoc(doc.id)}
                                      className={cn(
                                        "rounded-lg border p-3 flex-1 min-w-[140px] text-left transition-all",
                                        isOn ? "border-foreground bg-muted" : "border-border opacity-40"
                                      )}
                                    >
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className={cn("text-xs font-semibold", isOn ? "text-foreground" : "text-muted-foreground")}>
                                          {doc.title}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        {SNIPPETS_BY_DOC[doc.id]?.[0]?.paragraphs[0] || ""}
                                      </p>
                                    </button>
                                  );
                                })}
                                {/* Locked database */}
                                <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-3 flex-1 min-w-[140px]">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Database className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-foreground">Training Database</span>
                                    <Lock className="h-3 w-3 text-muted-foreground/50 ml-auto" />
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    {LLM_DATABASE_SNIPPET}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-muted-foreground/40" /></div>

                            {/* Extraction */}
                            <div>
                              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Information extracted
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {diagramSelectedDocs.map((doc) => (
                                  <div key={doc.id} className="rounded-lg border border-border bg-muted/30 p-2.5 flex-1 min-w-[130px]">
                                    <p className="text-[11px] text-foreground leading-relaxed italic">
                                      {LLM_EXTRACTIONS[doc.id]}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-muted-foreground/40" /></div>

                            {/* Output */}
                            <div>
                              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Output
                              </p>
                              {(() => {
                                const key = Array.from(diagramDocs).sort().join(",");
                                const merged = LLM_MERGED_OUTPUTS[key];
                                if (!merged) return <p className="text-xs text-muted-foreground">Select a valid document combination.</p>;
                                return (
                                  <div className="rounded-lg border border-border bg-white p-4">
                                    <p className="text-sm text-foreground leading-relaxed">{merged.text}</p>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* ── Search engine block diagram ── */}
                        {diagramRoute === "search" && (
                          <div className="flex-1 space-y-4">
                            <button
                              type="button"
                              onClick={() => setDiagramRoute(null)}
                              className="text-xs text-brand-tertiary-500 font-semibold flex items-center gap-1 hover:underline mb-2"
                            >
                              <ArrowLeft className="h-3 w-3" /> Back
                            </button>

                            {/* Indexed sources */}
                            <div>
                              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Documents indexed separately
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {DOCUMENTS.map((doc) => (
                                  <div key={doc.id} className="rounded-lg border border-border bg-muted/30 p-3 flex-1 min-w-[140px]">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-xs font-semibold text-foreground">{doc.title}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                      {SNIPPETS_BY_DOC[doc.id]?.[0]?.paragraphs[0] || ""}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-muted-foreground/40" /></div>

                            {/* Separate results */}
                            <div>
                              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Results returned with source attribution
                              </p>
                              <div className="space-y-2.5">
                                {DOCUMENTS.map((doc) => (
                                  <div key={doc.id} className="rounded-lg border border-border bg-white p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-xs font-semibold text-foreground">{doc.title}</span>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed">
                                      {SNIPPETS_BY_DOC[doc.id]?.[0]?.paragraphs.join(" ") || ""}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Navigation */}
                        {diagramRoute && (
                          <div className="mt-8 flex items-center gap-3">
                            <Button variant="outline" size="lg" onClick={() => navigate("/module/multiple-sources")} className="rounded-md border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10">
                              <ArrowLeft className="!h-5 !w-5" />
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => navigate("/module/multiple-sources/takeaways")} className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10">
                              Takeaways <ArrowRight className="-mr-2 !h-6 !w-6" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right sidebar - Evaluation */}
                  {(topView === "exercise" || (topView === "how-it-works" && diagramRoute === "llm")) && (
                    <div className="w-80 flex-shrink-0">
                      <EvaluationPanel initialIsOpen={topView === "how-it-works"} canClose={true} />

                      {/* Retrieved Snippets (exercise only) */}
                      {topView === "exercise" && (
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
                              {currentSnippets.map((snippet, i) => (
                                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                                  <p className="text-sm font-semibold text-foreground">{snippet.title}</p>
                                  {snippet.paragraphs.map((para, j) => (
                                    <p key={j} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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

      <ModuleNavigation
        previousRoute="/module/multiple-sources"
        nextRoute="/module/multiple-sources/takeaways"
      />
    </div>
  );
}
