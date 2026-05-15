import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ChatboxDummy from "@/components/ChatBoxDummy";
import Breadcrumb from "@/components/Breadcrumb";

import { PopoverSeries } from "@/components/PopoverSeries";
import AnimatedTransition from "@/components/AnimatedTransition";
import ModuleNavigation from "@/components/ModuleNavigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NextWordPrediction() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [clickCount, setClickCount] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleSubmit = () => {
    setShowAnimation(true);
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


  useEffect(() => {
    if (showAnimation) {
      navigate('/module/next-word-prediction/response');
    }
  }, [showAnimation, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[calc(100vh-300px)]">
          <div className="w-full relative">
          <ChatboxDummy
            value={t('nextWord.prompt.input')}
            submitButtonId="chatbox-submit-button"
            onSubmit={handleSubmit}
          />
          {showPopover && (
            <PopoverSeries
              steps={[
                {
                  id: "submit-hint",
                  trigger: "#chatbox-submit-button",
                  content: t('nextWord.prompt.popoverSubmit')
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
        
      </main>
      
      <ModuleNavigation 
        previousRoute="/module/next-word-prediction" 
        nextRoute="/module/next-word-prediction/response"
      />
    </div>
  );
}