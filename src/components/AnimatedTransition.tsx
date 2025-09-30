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
        timeout = setTimeout(() => setPhase("sent"), 100);
        break;
      case "sent":
        timeout = setTimeout(() => setPhase("responding"), 100);
        break;
      case "responding":
        timeout = setTimeout(() => setPhase("streaming"), 100);
        break;
      case "streaming":
        // Streaming will trigger streamingComplete phase via TypewriterText onComplete
        break;
      case "streamingComplete":
        timeout = setTimeout(() => setPhase("showHeadline"), 100);
        break;
      case "showHeadline":
        setShowHeadline(true);
        timeout = setTimeout(() => setPhase("showEvaluation"), 100);
        break;
      case "showEvaluation":
        setShowResponseElements(true);
        setShowEvaluation(true);
        timeout = setTimeout(() => setPhase("complete"), 4000);
        break;
      case "complete":
        timeout = setTimeout(() => {
          navigate(targetRoute);
          onComplete?.();
        }, 1500);
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
          <div className={`transition-all duration-[2000ms] ease-in-out ${
            showResponseElements 
              ? "grid grid-cols-1 lg:grid-cols-12 gap-8" 
              : "flex justify-center"
          }`}>
            
            {/* Main content area */}
            <div className={`transition-all duration-[2000ms] ease-in-out ${
              showResponseElements ? "lg:col-span-8" : "max-w-2xl w-full"
            }`}>
              
              {/* Prompt area with smooth transformation */}
              <div className="mb-8">
                {phase === "chatbox" && (
                  <div className="transition-all duration-300">
                    <Chatbox 
                      canType={false} 
                      value={promptText}
                      onChange={() => {}}
                      fileName={fileName}
                      onSubmit={handleSubmit}
                    />
                  </div>
                )}
                
                {phase === "sending" && (
                  <div className="transform transition-all duration-600 scale-98 opacity-90">
                    <Chatbox 
                      canType={false} 
                      value={promptText}
                      onChange={() => {}}
                      fileName={fileName}
                      onSubmit={() => {}}
                    />
                  </div>
                )}
                
                {(phase === "sent" || phase === "responding" || phase === "streaming" || phase === "streamingComplete" || phase === "showHeadline" || phase === "showEvaluation" || phase === "complete") && (
                  <div className="animate-fade-in duration-1000">
                    <SentPrompt text={promptText} fileName={fileName} />
                  </div>
                )}
              </div>

              {/* Responding phase */}
              {phase === "responding" && (
                <div className="animate-fade-in duration-1000 p-8">
                  <LoadingDots text="Generating response" />
                </div>
              )}

              {/* Streaming response */}
              {(phase === "streaming" || phase === "streamingComplete" || phase === "showHeadline" || phase === "showEvaluation" || phase === "complete") && (
                <div className="animate-fade-in duration-1000 space-y-6">
                  <div className="p-6">
                    {phase === "streaming" ? (
                      <TypewriterText
                        text="Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:"
                        delay={80}
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
                    <div className="animate-fade-in duration-1500 p-6">
                      <TypewriterText
                        text="European Union Unites On Historic AI Ethics Framework, Charting Path For Responsible Technology Development"
                        delay={100}
                        className="text-2xl text-gray-900 leading-loose font-normal md:text-4xl block"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right sidebar - Evaluation Panel appears last */}
            {showResponseElements && showEvaluation && (
              <div className="lg:col-span-4 animate-fade-in duration-[2000ms] animate-slide-in-right">
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