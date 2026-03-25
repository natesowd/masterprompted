import { useState, useMemo } from "react";
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

/* ------------------------------------------------------------------ */
/* ── Page ── */
/* ------------------------------------------------------------------ */

export default function MultipleSourcesExercise() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [snippetsOpen, setSnippetsOpen] = useState(true);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* Derive response and snippets from selected documents */
  const selectionKey = useMemo(() => {
    const sorted = Array.from(selected).sort();
    return sorted.join(",");
  }, [selected]);

  const currentResponse = RESPONSES[selectionKey] || "Select one or more documents to generate a response.";

  const currentSnippets = useMemo(() => {
    const sorted = Array.from(selected).sort();
    return sorted.flatMap((id) => SNIPPETS_BY_DOC[id] || []);
  }, [selected]);

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
                        <div className="space-y-4">
                          <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                            {currentResponse}
                          </p>
                        </div>
                      </div>

                      {/* Takeaways button */}
                      <div className="mt-8 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/module/multiple-sources")}
                          className="rounded-md border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                        >
                          <ArrowLeft className="!h-5 !w-5" />
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
                      {currentSnippets.map((snippet, i) => (
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
