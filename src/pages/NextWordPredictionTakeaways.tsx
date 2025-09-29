import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";

export default function Takeaways() {
  const navigate = useNavigate();

  const handleNextTask = () => {
    navigate("/module/prompt-construction");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Takeaways:</h1>
          <h2 className="text-4xl font-bold text-foreground mb-12">How do LLMs form responses to user prompts?</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                1
              </div>
              <p className="text-lg text-foreground pt-2">
                <span className="font-bold">LLMs generate text through next-word prediction</span>—a powerful but probabilistic process that relies on patterns in data rather than strong logical reasoning.
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                2
              </div>
              <p className="text-lg text-foreground pt-2">
                <span className="font-bold">Because of this stochastic nature, errors are inevitable:</span> even the most advanced models can produce mistakes, distortions, or unfounded claims.
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                3
              </div>
              <p className="text-lg text-foreground pt-2">
                <span className="font-bold">As a journalist, your critical expertise is essential:</span> apply your analytical skills to evaluate AI outputs, filter out misinformation, and prevent LLM falsehoods from entering your reporting.
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <button 
              onClick={handleNextTask}
              className="bg-green-400 hover:bg-green-500 text-black font-medium px-8 py-3 rounded-full transition-colors"
            >
              Next Task →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}