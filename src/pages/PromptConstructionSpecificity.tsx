import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import GuidanceTooltip from "@/components/GuidanceTooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, ArrowUp } from "lucide-react";

export default function Specificity() {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(true);
  const [promptText, setPromptText] = useState("Summarize the main points of the EU AI Act, including its risk categories and rules for high-risk AI systems");

  const handleSubmit = () => {
    // Navigate to the response page
    navigate("/module/prompt-construction/specificity/response");
  };

  const handleFileUpload = () => {
    // Handle file upload logic here
    console.log("File upload clicked");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-4xl mx-auto relative min-h-[600px]">
          {/* Guidance Tooltip */}
          <GuidanceTooltip
            text="Let's start by prompting for a summary of the ai act."
            isVisible={showTooltip}
            onClose={() => setShowTooltip(false)}
            className="top-8 left-1/2 transform -translate-x-1/2"
          />

          {/* Prompt Box */}
          <Card 
            className="bg-white border border-gray-200 rounded-2xl shadow-lg"
            style={{
              position: 'absolute',
              top: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '768px'
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                {/* Left content */}
                <div className="flex-1 mr-4">
                  <Textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Type your message here..."
                    className="border-0 p-0 text-gray-800 text-lg leading-relaxed mb-4 resize-none min-h-[60px] focus:ring-0 focus:outline-none bg-transparent"
                    style={{
                      fontSize: '18px',
                      lineHeight: '1.5',
                    }}
                  />
                  
                  {/* Attached file */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm">EU_AI_Act.pdf</span>
                  </div>
                </div>
                
                {/* Arrow button */}
                <Button
                  onClick={handleSubmit}
                  className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-3 ml-4"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}