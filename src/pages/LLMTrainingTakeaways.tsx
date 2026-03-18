import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TAKEAWAYS = [
  {
    title: "Training uses input-output examples:",
    body: " LLMs are trained on large numbers of input-output pairs that show what kind of responses are expected for different tasks.",
  },
  {
    title: "Examples teach response patterns:",
    body: " From these examples, models learn patterns in structure, language, and task behavior — not fixed rules or facts.",
  },
  {
    title: "The same principle applies at prompt time:",
    body: " By providing a few examples (few-shot prompting), users can guide the model toward more structured, stylistically consistent, or task-specific outputs.",
  },
];

export default function LLMTrainingTakeaways() {
  const navigate = useNavigate();

  const handleDownload = () => {
    const content = [
      "LLM Training — Takeaways",
      "",
      "How are LLM responses improved by training?",
      "",
      ...TAKEAWAYS.map((t, i) => `${i + 1}. ${t.title}${t.body}`),
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "llm-training-takeaways.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5" />
        <div className="max-w-4xl mx-auto my-[170px] mt-[130px]">
          <p className="text-muted-foreground text-sm mb-4">LLM Training</p>

          <h1 className="text-h2 font-heading text-foreground mb-12">
            How are LLM responses improved by training?
          </h1>

          <div className="space-y-8">
            {TAKEAWAYS.map((point, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-body-1 text-foreground pt-2">
                  <span className="font-bold">{point.title}</span>
                  {point.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/module/llm-training/few-shot")}
              className="h-12 w-12 rounded-full"
            >
              <ArrowLeft className="!h-6 !w-6" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/playground")}
              className="font-heading font-semibold text-base px-10 py-6 rounded-full"
            >
              Prompt Playground
              <ArrowRight className="-mr-2 !h-6 !w-6" />
            </Button>
            <div className="flex-1" />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                  <Download className="!h-5 !w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-heading">Download Takeaways</DialogTitle>
                </DialogHeader>
                <div className="border border-border rounded-lg bg-muted/30 p-5 font-mono text-sm text-muted-foreground space-y-2 whitespace-pre-line max-h-[50vh] overflow-y-auto">
                  <p className="font-bold text-foreground">
                    How are LLM responses improved by training?
                  </p>
                  {TAKEAWAYS.map((point, i) => (
                    <p key={i}>
                      {i + 1}. {point.title}
                      {point.body}
                    </p>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" onClick={handleDownload} className="rounded-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download .txt
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      <ModuleNavigation
        previousRoute="/module/llm-training/few-shot"
        nextRoute="/playground"
      />
    </div>
  );
}
