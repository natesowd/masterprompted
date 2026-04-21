import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Paperclip, FileText, List } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";

export default function MultipleSourcesTryItYourself() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5" />
        <div className="max-w-4xl mx-auto mt-8">
          <p className="text-muted-foreground text-sm mb-4">Multiple documents</p>

          <h1 className="text-h2 font-heading text-foreground mb-6">
            Try it yourself
          </h1>

          <p className="text-body-1 text-foreground leading-relaxed mb-8">
            Now that you've seen how an LLM merges information from multiple sources, try applying this in the Prompt Playground with a real journalism scenario.
          </p>

          {/* Case study */}
          <div className="rounded-xl border border-brand-tertiary-500/30 bg-brand-tertiary-500/5 p-6 mb-8 space-y-4">
            <h2 className="font-heading font-bold text-lg text-foreground">
              Case study: Diversity Summarization
            </h2>

            <p className="text-sm text-foreground leading-relaxed">
              In journalism, summarizing multiple sources means capturing <strong>all the diverse viewpoints</strong> — not just the majority opinion. This is called <strong>diversity summarization</strong>, and it's essential for fair reporting.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-white p-4 space-y-2">
                <div className="flex items-center gap-2 text-brand-tertiary-500">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-xs font-heading font-semibold uppercase tracking-wider">Input</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  A set of tweets and news articles about a topic. Upload them as documents — the same way you'd upload a PDF of the EU AI Act.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-white p-4 space-y-2">
                <div className="flex items-center gap-2 text-brand-tertiary-500">
                  <List className="h-4 w-4" />
                  <span className="text-xs font-heading font-semibold uppercase tracking-wider">Output</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  A list of bullet points capturing the main information, with <strong>each point attributed to its source</strong> — so you can verify where every claim comes from.
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              This is the opposite of consensus summarization ("most people liked X"). Diversity summarization preserves minority views and attributes each claim — exactly what journalists need.
            </p>
          </div>

          {/* How to do it in the Prompt Playground */}
          <div className="space-y-4 mb-10">
            <h2 className="font-heading font-bold text-lg text-foreground">
              How to try this in the Prompt Playground
            </h2>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 bg-brand-tertiary-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="text-sm text-foreground font-semibold">Switch to the System tab</p>
                  <p className="text-sm text-muted-foreground">Set up a system prompt that instructs the LLM to produce a diversity summary with source attribution.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 bg-brand-tertiary-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="text-sm text-foreground font-semibold">Use the Context buttons</p>
                  <p className="text-sm text-muted-foreground">Click <strong>Instruction</strong> to add summarization rules. Click <strong>Knowledge</strong> to paste in your source documents (tweets, articles).</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 bg-brand-tertiary-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="text-sm text-foreground font-semibold">Upload documents as attachments</p>
                  <p className="text-sm text-muted-foreground">Use the <Paperclip className="inline h-3.5 w-3.5" /> attachment button in the prompt box to upload PDFs of your source material, just like the EU AI Act exercise.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 bg-brand-tertiary-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                <div>
                  <p className="text-sm text-foreground font-semibold">Ask your question</p>
                  <p className="text-sm text-muted-foreground">Type a prompt like: "Summarize the diverse viewpoints in these documents as attributed bullet points."</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/module/multiple-sources/exercise")}
              className="h-12 w-12 rounded-full"
            >
              <ArrowLeft className="!h-6 !w-6" />
            </Button>
            <Button
              onClick={() => navigate("/playground-v2?from=gs")}
              className="font-heading font-semibold text-base px-10 py-6 rounded-full bg-brand-tertiary-500 hover:bg-brand-tertiary-600 text-white"
            >
              Open Prompt Playground
              <ArrowRight className="-mr-2 !h-6 !w-6" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/module/multiple-sources/takeaways")}
              className="font-heading font-semibold text-base px-8 py-6 rounded-full"
            >
              Skip to Takeaways
            </Button>
          </div>
        </div>
      </main>
      <ModuleNavigation
        previousRoute="/module/multiple-sources/exercise"
        nextRoute="/module/multiple-sources/takeaways"
      />
    </div>
  );
}
