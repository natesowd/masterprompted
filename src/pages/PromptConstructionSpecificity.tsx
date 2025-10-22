import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import LearningProgressBar from "@/components/LearningProgressBar";
import GuidanceTooltip from "@/components/GuidanceTooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { PopoverSeries } from "@/components/PopoverSeries";
import Chatbox from "@/components/ChatBox";

export default function Specificity() {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(true);
  const [promptText, setPromptText] = useState("Summarize the main points of the EU AI Act, including its risk categories and rules for high-risk AI systems");
  const [clickCount, setClickCount] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const submitButton = document.getElementById("chatbox-submit-button");
      const target = event.target as HTMLElement;

      // Only count clicks that are NOT on the submit button
      if (submitButton && !submitButton.contains(target)) {
        setClickCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setShowPopover(true);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);
  const handleSubmit = () => {
    // Navigate to the document attachment page
    navigate("/module/prompt-construction/summarize");
  };
  const handleFileUpload = () => {
    // Handle file upload logic here
    console.log("File upload clicked");
  };
  return <div className="min-h-screen bg-background">
    <Header />

    <main className="container mx-auto px-6 py-6">
      <Breadcrumb />
      <div className="mb-5"></div>

      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[calc(100vh-300px)]">
        <div className="w-full relative">
          <Chatbox
            canType={false}
            value={"Summarize the main points of the EU AI Act, including its risk categories and rules for high-risk AI systems."}
            onChange={() => { }}
            fileName="EU_AI_Act.pdf"
            submitButtonId="chatbox-submit-button" // Pass the ID here
            onSubmit={handleSubmit}
          />
          {showPopover && (
            <PopoverSeries
              steps={[
                {
                  id: "submit-hint",
                  trigger: "#chatbox-submit-button",
                  content: "Click here to submit your prompt and see the AI's response!"
                }
              ]}
              initialStep={0}
              onClose={() => {
                setShowPopover(false);
                setClickCount(0); // Reset click count when popover is closed
              }}
            />
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <LearningProgressBar 
          module="prompt-construction"
          currentStep="intro"
          baseRoute="/module/prompt-construction"
        />
      </div>
    </main>
  </div>;
}