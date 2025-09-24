import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function PromptConstruction() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/module/prompt-construction/specificity");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-2xl bg-white border border-border shadow-lg">
            <CardContent className="p-8">
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-8">
                <div className="text-sm text-muted-foreground">
                  Learning 2: Prompt construction
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/modules")}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Main content */}
              <div>
                {/* Content */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    How does my input affect the quality of the LLM's output?
                  </h2>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Your prompt directly shapes an LLM's response. Large language models use the wording, specificity, and context in your wording to help decide how to reply, meaning the quality of the output can depend heavily on how you phrase it.
                  </p>
                  
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Explore how real LLM generated responses change with different prompt constructions
                  </p>
                  
                  <Button 
                    onClick={handleContinue}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full"
                  >
                    Continue →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}