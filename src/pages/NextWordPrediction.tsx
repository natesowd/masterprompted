import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Chatbox from "@/components/ChatBox";
import Breadcrumb from "@/components/Breadcrumb";
import { PopoverSeries } from "@/components/PopoverSeries";

export default function NextWordPrediction() {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [showPopover, setShowPopover] = useState(false);

  const handleSubmit = () => {
    navigate("/module/next-word-prediction/response");
  };

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


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-2xl mx-auto relative min-h-[600px]">
          <Chatbox 
            canType={false} 
            text="Write a headline for a long form journalistic article about ai ethics agreement reached across the eu" 
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
      </main>
    </div>
  );
}