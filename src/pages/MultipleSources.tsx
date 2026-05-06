import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, X } from "lucide-react";
import magnifyingGlassImage from "@/assets/magnifying-glass.png";

export default function MultipleSources() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/module/multiple-sources/exercise");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-6 pb-12">
        <Breadcrumb />
        <div className="mb-5" />
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[600px]">
          <Card className="flex flex-row items-start gap-10 p-10 bg-card border border-border shadow-lg rounded-2xl">
            {/* Left column - Magnifying glass image */}
            <div className="flex-shrink-0">
              <img
                src={magnifyingGlassImage}
                alt="Magnifying glass illustration"
                className="w-[325px] h-auto"
              />
            </div>

            {/* Right column - Content */}
            <CardContent className="p-0 w-full flex flex-col">
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-muted-foreground text-sm">
                  Learning 5: Multiple Documents
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/modules")}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Main heading */}
              <h1 className="text-h3 font-heading text-foreground mb-3">
                How does asking an LLM vs a search engine differ?
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-body-1 leading-relaxed mb-8 flex-grow whitespace-pre-line">
                {"While LLMs offer advantages like concise, easy-to-follow responses, they risk introducing more bias and misinformation compared to traditional search engines. \n\nOne way is when multiple documents are used together as sources. Due to how LLMs compile data, users may get answers to questions that are inaccurate and/or loses the information source. Ideas can get mixed, and lose the original meaning as well as the attribution to the document it came from."}
              </p>

              {/* Continue button */}
              <Button
                onClick={handleContinue}
                className="w-fit px-10 py-6 font-heading font-semibold text-base rounded-full"
              >
                Continue
                <ArrowRight className="-mr-2 !h-6 !w-6" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* LLM Disclaimer */}
        <div className="fixed bottom-0 left-0 right-0 z-10 px-3 py-2 bg-background/80 backdrop-blur-sm">
          <p className="text-[13px] leading-snug text-muted-foreground/70 text-left">
            LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
          </p>
        </div>
      </main>
    </div>
  );
}
