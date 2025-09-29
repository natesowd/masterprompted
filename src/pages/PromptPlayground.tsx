// src/components/PromptPlayground.tsx

import Header from "@/components/Header";
import EvaluationPanel from "@/components/EvaluationPanel";
import Chatbox from "@/components/ChatBox";
import PromptControls from "@/components/PromptControls";
import SentPrompt from "@/components/SentPrompt"; // ✨ 1. Import the new component
import { useState } from "react";

const PromptPlayground = () => {
  // State for the text currently in the chatbox
  const [text, setText] = useState(""); 
  
  // ✨ 2. Add new state to store the list of submitted prompts
  const [submittedPrompts, setSubmittedPrompts] = useState<string[]>([]);

  // ✨ 3. Update the handler to manage the list and clear the input
  const handleChatSubmit = (submittedText: string) => {
    if (!submittedText.trim()) return; // Don't submit empty prompts

    console.log("Text submitted from Chatbox:", submittedText);
    
    // Add the new prompt to our list of submitted prompts
    setSubmittedPrompts(prevPrompts => [...prevPrompts, submittedText]);
    
    // Set the main text state to the submitted value (optional, if needed elsewhere)
    setText(submittedText); 
    
    // NOTE: We don't clear the Chatbox from here. 
    // The Chatbox clears itself after calling onSubmit. We'll modify it slightly.
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="flex-none">
            <div className="sticky top-4">
              <PromptControls />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Chatbox onSubmit={handleChatSubmit} canType={true} />
            
            {/* ✨ 4. Render the list of submitted prompts */}
            <div className="mt-6 space-y-4">
              {submittedPrompts.map((prompt, index) => (
                <SentPrompt key={index} text={prompt} />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex-none">
            <EvaluationPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromptPlayground;