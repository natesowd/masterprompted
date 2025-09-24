import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, ArrowUp, X } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PopoverSeries } from "@/components/PopoverSeries";
import Chatbox from "@/components/ChatBox";
import Breadcrumb from "@/components/Breadcrumb";

export default function NextWordPrediction() {
  const submitButtonRef = useRef(null);
  const [popoverSteps, setPopoverSteps] = useState([]); // State to hold steps
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate("/module/headline-response");
  };

  // 1. Use useEffect to detect when the ref is attached and trigger a re-render.
  useEffect(() => {
    // Check if the ref has a value (i.e., the button has rendered)
    if (submitButtonRef.current) {
        console.log("Ref is now attached! Updating steps state.");
        
        // Define steps using the attached ref value
        const initialSteps = [
            {
                id: "step1",
                trigger: submitButtonRef.current, // Use the current value of the ref
                content: (
                    <p className="text-sm leading-relaxed">
                    Could you share the specifics or background for the message you want to convey? 
                    This will help me assist you better.
                    </p>
                )
            }
        ];
        
        // 2. Update the state, which triggers a re-render and causes PopoverSeries to render
        setPopoverSteps(initialSteps);
    }
  }, []); // Empty dependency array: runs once after the initial render

  // console.log("Current steps length:", popoverSteps.length); // You can debug here

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Breadcrumb/>
        <div className="max-w-2xl mx-auto relative min-h-[600px]">
          <Chatbox 
            canType={false} 
            text="Write a headline for a long form journalistic article about ai ethics agreement reached across the eu" 
            fileName="EU_AI_Act.pdf"
            ref={submitButtonRef} // Ref is passed and attached to the DOM element
            onSubmit={handleSubmit}
          />
        </div>
        
        {/* 3. Conditional Rendering: Only render PopoverSeries if steps are available */}
        {popoverSteps.length > 0 && (
            <PopoverSeries steps={popoverSteps} /> 
        )}
      </main>
    </div>
  );
}