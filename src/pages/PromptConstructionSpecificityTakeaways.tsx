import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import LearningProgressBar from "@/components/LearningProgressBar";

export default function PromptConstructionSpecificityTakeaways() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/playground");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Takeaways:</h1>
          <h2 className="text-4xl font-bold text-foreground mb-12">How does my input affect the quality of the LLM's output?</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                1
              </div>
              <p className="text-lg text-foreground pt-2">
                <span className="font-bold">How you prompt directly impacts LLM output:</span> An LLM will use your word choice and information provided to try and form an appropriate response.
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                2
              </div>
              <p className="text-lg text-foreground pt-2">
                <span className="font-bold">You don't need to interact conversationally:</span> Interacting in a human-like manner may only increase the plausibility of the LLM's response and make it harder to evaluate.
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                3
              </div>
              <p className="text-lg text-foreground pt-2">
                <span className="font-bold">Look out for key parameters to get better results:</span> Include context, specificity and phrase your prompts in a neutral, technical manner
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <button 
              onClick={() => navigate("/playground")}
              className="bg-green-400 hover:bg-green-500 text-black font-medium px-8 py-3 rounded-full transition-colors inline-flex items-center gap-3"
            >
              Prompt Playground
              <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5H11M11 5L7 1M11 5L7 9" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            <div className="mt-8">
              <LearningProgressBar 
                module="prompt-construction"
                currentStep="takeaway"
                baseRoute="/module/prompt-construction"
              />
            </div>
          </div>
        </div>
      </main>
      
      <ModuleNavigation 
        previousRoute="/module/prompt-construction/specificity/response" 
        nextRoute="/module/prompt-construction/conversation-style"
      />
    </div>
  );
}
