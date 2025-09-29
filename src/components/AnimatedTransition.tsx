import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chatbox from "@/components/ChatBox";
import SentPrompt from "@/components/SentPrompt";
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
  const [phase, setPhase] = useState<AnimationPhase>("chatbox");
  const [showResponseElements, setShowResponseElements] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  // Auto-start the animation as soon as this component mounts
  useEffect(() => {
    const t = setTimeout(() => setPhase("sending"), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    // Start the animation sequence
    setPhase("sending");
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    switch (phase) {
      case "sending":
        timeout = setTimeout(() => setPhase("sent"), 800);
        break;
      case "sent":
        timeout = setTimeout(() => setPhase("responding"), 500);
        break;
      case "responding":
        setShowResponseElements(true);
        timeout = setTimeout(() => setPhase("streaming"), 1000);
        break;
      case "streaming":
        // Streaming will trigger streamingComplete phase via TypewriterText onComplete
        break;
      case "streamingComplete":
        timeout = setTimeout(() => setPhase("showHeadline"), 1000);
        break;
      case "showHeadline":
        setShowHeadline(true);
        timeout = setTimeout(() => setPhase("showEvaluation"), 2000);
        break;
      case "showEvaluation":
        setShowEvaluation(true);
        timeout = setTimeout(() => setPhase("complete"), 3000);
        break;
      case "complete":
        timeout = setTimeout(() => {
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
        {/* Breadcrumb */}
        <div className="transition-opacity duration-500">
          <Breadcrumb />
        </div>
        <div className="mb-5"></div>
        
        <div className="max-w-7xl mx-auto">
          {/* Layout morphing animation */}
          <div className={`transition-all duration-1000 ease-out ${
            showResponseElements 
              ? "grid grid-cols-1 lg:grid-cols-12 gap-8" 
              : "flex justify-center"
          }`}>
            
            {/* Main content area */}
            <div className={`transition-all duration-1000 ease-out ${
              showResponseElements ? "lg:col-span-8" : "max-w-2xl w-full"
            }`}>
              
              {/* Prompt area with smooth transformation */}
              <div className="mb-8">
                {phase === "chatbox" && (
                  <div className="transition-all duration-300">
                    <Chatbox 
                      canType={false} 
                      text={promptText}
                      fileName={fileName}
                      onSubmit={handleSubmit}
                    />
                  </div>
                )}
                
                {phase === "sending" && (
                  <div className="transform transition-all duration-600 scale-98 opacity-90">
                    <Chatbox 
                      canType={false} 
                      text={promptText}
                      fileName={fileName}
                      onSubmit={() => {}}
                    />
                  </div>
                )}
                
                {(phase === "sent" || phase === "responding" || phase === "streaming" || phase === "streamingComplete" || phase === "showHeadline" || phase === "showEvaluation" || phase === "complete") && (
                  <div className="animate-fade-in">
                    <SentPrompt text={promptText} fileName={fileName} />
                  </div>
                )}
              </div>

              {/* Responding phase */}
              {phase === "responding" && (
                <div className="animate-fade-in bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                  <LoadingDots text="Generating response" />
                </div>
              )}

              {/* Streaming response */}
              {(phase === "streaming" || phase === "streamingComplete" || phase === "showHeadline" || phase === "showEvaluation" || phase === "complete") && (
                <div className="animate-fade-in space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    {phase === "streaming" ? (
                      <TypewriterText
                        text="Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:"
                        delay={30}
                        onComplete={() => setPhase("streamingComplete")}
                        className="text-gray-700 text-lg"
                      />
                    ) : (
                      <p className="text-gray-700 text-lg">
                        Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:
                      </p>
                    )}
                  </div>
                  
                  {/* Headline that appears after intro text */}
                  {showHeadline && (
                    <div className="animate-fade-in bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                      <TypewriterText
                        text="European Union Unites On Historic AI Ethics Framework, Charting Path For Responsible Technology Development"
                        delay={40}
                        className="text-2xl text-gray-900 leading-loose font-normal md:text-4xl block"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right sidebar - Evaluation Panel appears last */}
            {showResponseElements && showEvaluation && (
              <div className="lg:col-span-4 animate-fade-in animate-slide-in-right">
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