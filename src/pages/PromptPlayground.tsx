// src/components/PromptPlayground.tsx

import Header from "@/components/Header";
import EvaluationPanel from "@/components/EvaluationPanel";
import Chatbox from "@/components/ChatBox";
import PromptControls from "@/components/PromptControls";
import SentPrompt from "@/components/SentPrompt"; // ✨ 1. Import the new component
import { useState } from "react";

const PromptPlayground = () => {

  // ✨ 2. Add new state to store the list of submitted prompts
  const [submittedPrompts, setSubmittedPrompts] = useState<string[]>([]);

  // ✨ 3. Update the handler to manage the list and clear the input
  const handleChatSubmit = async (submittedText: string) => {
    if (!submittedText.trim()) return; // Don't submit empty prompts


    // Add the new prompt to our list of submitted prompts
    setSubmittedPrompts(prevPrompts => [...prevPrompts, submittedText]);

    console.log("Text submitted from Chatbox:", submittedText);

    let currentFileIds: string[] = []; // Placeholder for file IDs
    const response = await fetch(
      "https://llm1.hochschule-stralsund.de:8000/answer",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: submittedText,
          temperature: 0.7,
          fileIds: currentFileIds,
        }),
      }
    );

    const data: any = await response.json();

    const answer: string = data.answer;

    console.log("Received answer from backend:", answer);
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