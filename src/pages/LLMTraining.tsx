import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, X } from "lucide-react";
import dumbbellImg from "@/assets/dumbbell.png";

export default function LLMTraining() {
  const navigate = useNavigate();

  const handleContinue = () => {
    // TODO: navigate to first exercise page when built
    navigate("/module/llm-training/supervised");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5" />
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[600px]">
          <Card className="flex flex-row items-start gap-10 p-10 bg-card border border-border shadow-lg rounded-2xl">
            {/* Left column - Dumbbell image */}
            <div className="flex-shrink-0">
              <img
                src={dumbbellImg}
                alt="Dumbbell illustration representing training"
                className="w-[325px] h-auto"
              />
            </div>

            {/* Right column - Content */}
            <CardContent className="p-0 w-full flex flex-col">
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-muted-foreground text-sm">
                  Learning 6: LLM Training
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
                How are LLM responses improved by training?
              </h1>

              {/* Description */}
              <div className="text-muted-foreground text-body-1 leading-relaxed mb-8 flex-grow space-y-4">
                <p>
                  LLM responses improve when models are exposed to examples that show what kind of output is expected. During training, this happens through large numbers of input-output pairs that teach the model patterns in language and tasks.
                </p>
                <p>
                  The same principle can also be applied at prompt time. By providing a few examples — known as few-shot prompting — users can guide the model to produce more structured, stylistically consistent, or task-specific outputs.
                </p>
                <p>
                  In both cases, the model learns how to respond by observing examples — not by being explicitly programmed.
                </p>
              </div>

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
        <div className="fixed bottom-4 left-4 z-10">
          <p className="text-[13px] text-muted-foreground/70">
            LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
          </p>
        </div>
      </main>
    </div>
  );
}
