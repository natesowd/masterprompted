import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chatbox from "@/components/ChatBox";
import SentPrompt from "@/components/SentPrompt";
import LoadingDots from "@/components/LoadingDots";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";

interface AnimatedTransitionProps {
  promptText: string;
  fileName?: string;
  targetRoute: string;
  onComplete?: () => void;
}

type AnimationPhase = "chatbox" | "transforming" | "sent" | "generating" | "morphing" | "complete";

const AnimatedTransition = ({ 
  promptText, 
  fileName, 
  targetRoute, 
  onComplete 
}: AnimatedTransitionProps) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<AnimationPhase>("chatbox");
  const [showResponseElements, setShowResponseElements] = useState(false);

  const handleSubmit = () => {
    // Start the animation sequence
    setPhase("transforming");
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    switch (phase) {
      case "transforming":
        timeout = setTimeout(() => setPhase("sent"), 800);
        break;
      case "sent":
        timeout = setTimeout(() => setPhase("generating"), 500);
        break;
      case "generating":
        timeout = setTimeout(() => {
          setShowResponseElements(true);
          setPhase("morphing");
        }, 2000);
        break;
      case "morphing":
        timeout = setTimeout(() => {
          setPhase("complete");
          navigate(targetRoute);
          onComplete?.();
        }, 1000);
        break;
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [phase, navigate, targetRoute, onComplete]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        {/* Breadcrumb with fade animation */}
        <div className={`transition-all duration-500 ${
          phase === "morphing" ? "opacity-100" : "opacity-100"
        }`}>
          <Breadcrumb />
        </div>
        <div className="mb-5"></div>
        
        <div className="max-w-7xl mx-auto">
          {/* Layout morphing animation */}
          <div className={`transition-all duration-1000 ${
            showResponseElements 
              ? "grid grid-cols-1 lg:grid-cols-12 gap-8" 
              : "flex justify-center"
          }`}>
            
            {/* Main content area */}
            <div className={`transition-all duration-1000 ${
              showResponseElements ? "lg:col-span-8" : "max-w-2xl w-full"
            }`}>
              
              {/* Prompt area with transformation */}
              <div className="mb-8">
                {phase === "chatbox" && (
                  <div className="animate-fade-in">
                    <Chatbox 
                      canType={false} 
                      text={promptText}
                      fileName={fileName}
                      onSubmit={handleSubmit}
                    />
                  </div>
                )}
                
                {phase === "transforming" && (
                  <div className="animate-scale-in">
                    <Chatbox 
                      canType={false} 
                      text={promptText}
                      fileName={fileName}
                      onSubmit={() => {}}
                    />
                  </div>
                )}
                
                {(phase === "sent" || phase === "generating" || phase === "morphing" || phase === "complete") && (
                  <div className="animate-fade-in">
                    <SentPrompt text={promptText} fileName={fileName} />
                  </div>
                )}
              </div>

              {/* Loading/Generation phase */}
              {phase === "generating" && (
                <div className="animate-fade-in bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                  <LoadingDots text="Analyzing prompt and generating response" />
                </div>
              )}

              {/* Response content with morphing animation */}
              {(phase === "morphing" || phase === "complete") && (
                <div className="animate-fade-in space-y-6">
                  <p className="text-gray-700 text-lg">
                    Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:
                  </p>
                  
                  {/* Preview of the response content */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h1 className="text-2xl text-gray-900 leading-loose font-normal md:text-4xl">
                      European Union Unites On Historic AI Ethics Framework, Charting Path For Responsible Technology Development
                    </h1>
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar that fades in during morphing */}
            {showResponseElements && (
              <div className="lg:col-span-4 animate-slide-in-right">
                <EvaluationPanel />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnimatedTransition;