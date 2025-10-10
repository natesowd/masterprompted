import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chatbox from "@/components/ChatBox";
import ChatPrompt from "@/components/ChatPrompt";
import LoadingDots from "@/components/LoadingDots";
import TypewriterText from "@/components/TypewriterText";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";

interface AnimatedTransitionProps {
  promptText: string;
  fileName?: string;
  targetRoute: string;
  onComplete?: () => void;
}

type AnimationPhase = "chatbox" | "sending" | "sent" | "responding" | "streaming" | "streamingComplete" | "showHeadline" | "showEvaluation" | "complete";

const AnimatedTransition = ({ 
  promptText, 
  fileName, 
  targetRoute, 
  onComplete 
}: AnimatedTransitionProps) => {
  const navigate = useNavigate();
  const [phase] = useState<AnimationPhase>("complete");
  const showResponseElements = true;
  const showHeadline = true;

  // Navigate to target route after a brief moment
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate(targetRoute);
      onComplete?.();
    }, 500);
    return () => clearTimeout(timeout);
  }, [navigate, targetRoute, onComplete]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="transition-opacity duration-500">
          <Breadcrumb />
        </div>
        <div className="mb-5"></div>
        
        <div className="max-w-7xl mx-auto">
          {/* Layout with consistent grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main content area */}
            <div className="lg:col-span-8">
              
              {/* Prompt area */}
              <div className="mb-8">
                <ChatPrompt text={promptText} fileName={fileName} />
              </div>

              {/* Response content */}
              <div className="space-y-6">
                <div className="p-6">
                  <p className="text-foreground text-lg leading-loose">
                    Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:
                  </p>
                </div>
                
                {/* Headline */}
                <div className="p-6">
                  <p className="text-2xl text-foreground leading-loose font-normal md:text-4xl block">
                    European Union Unites On Historic AI Ethics Framework, Charting Path For Responsible Technology Development
                  </p>
                </div>
              </div>
            </div>

            {/* Right sidebar - Evaluation Panel */}
            <div className="lg:col-span-4">
              <EvaluationPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnimatedTransition;