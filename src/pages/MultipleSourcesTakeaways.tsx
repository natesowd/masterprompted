import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TAKEAWAYS = [
{
  title: "Search engines return sources:",
  body: " They provide lists of links that require users to evaluate credibility and verify information themselves."
},
{
  title: "LLMs generate synthesized answers:",
  body: " They produce a single, conversational response by combining information, prioritizing speed and convenience."
},
{
  title: "Verification becomes harder with LLMs:",
  body: " Because sources are often abstracted or omitted, inaccuracies and biases can be harder to detect."
}];


export default function MultipleSourcesTakeaways() {
  const navigate = useNavigate();

  const handleDownload = () => {
    const content = [
    "Multiple Documents — Takeaways",
    "",
    "How does asking an LLM vs a search engine differ?",
    "",
    ...TAKEAWAYS.map((t, i) => `${i + 1}. ${t.title}${t.body}`)].
    join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "multiple-documents-takeaways.txt";
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
          <p className="text-muted-foreground text-sm mb-4">Multiple documents</p>

          <h1 className="text-h2 font-heading text-foreground mb-12">
            How does asking an LLM vs a search engine differ?
          </h1>

          <div className="space-y-8">
            {TAKEAWAYS.map((point, i) =>
            <div key={i} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-body-1 text-foreground pt-2">
                  <span className="font-bold">{point.title}</span>
                  {point.body}
                </p>
              </div>
            )}
          </div>

          <div className="mt-16 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/module/multiple-sources/exercise")}
              className="h-12 w-12 rounded-full">
              
              <ArrowLeft className="!h-6 !w-6" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/module/llm-training")}
              className="font-heading font-semibold text-base px-10 py-6 rounded-full">
              
              Continue
              <ArrowRight className="-mr-2 !h-6 !w-6" />
            </Button>
            <div className="flex-1" />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
                  
                  <Download className="!h-5 !w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-heading">Download Takeaways</DialogTitle>
                </DialogHeader>
                <div className="border border-border rounded-lg bg-muted/30 p-5 font-mono text-sm text-muted-foreground space-y-2 whitespace-pre-line max-h-[50vh] overflow-y-auto">
                  <p className="font-bold text-foreground">
                    How does asking an LLM vs a search engine differ?
                  </p>
                  {TAKEAWAYS.map((point, i) =>
                  <p key={i}>
                      {i + 1}. {point.title}
                      {point.body}
                    </p>
                  )}
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
        previousRoute="/module/multiple-sources/exercise"
        nextRoute="/module/llm-training" />
      
    </div>);

}