import Header from "@/components/Header";
import EvaluationPanel from "@/components/EvaluationPanel";
import Chatbox from "@/components/ChatBox";
import PromptControls from "@/components/PromptControls";
import SentPrompt from "@/components/SentPrompt";
import { useState, useRef, useEffect } from "react";
import Answer from "@/components/Answer";

function ChatBody({ submittedPrompts, submittedResponses }: { submittedPrompts: string[], submittedResponses: string[] }) {
  return (
    <div className="mt-6 space-y-4">
      {submittedPrompts.map((prompt, index) => (
        <div key={index}>
          <SentPrompt text={prompt} />
          {submittedResponses[index] && (
            <Answer text={submittedResponses[index]} />
          )}
        </div>
      ))}
    </div>
  );
}
const PromptPlayground = () => {
  // Create a ref for the scrollable chat container
  const chatEndRef = useRef<HTMLDivElement>(null);

  // state to store the list of submitted prompts and responses
  const [submittedPrompts, setSubmittedPrompts] = useState<string[]>([]);
  const [submittedResponses, setSubmittedResponses] = useState<string[]>([]);

  // State lifted from PromptControls
  const [specificity, setSpecificity] = useState<string>("General");
  const [style, setStyle] = useState<string>("Conversational");
  const [context, setContext] = useState<string>("No Background");
  const [bias, setBias] = useState<string>("No Bias");

  // ChatBox text state
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  // editingText is the live text being edited in the Chatbox (controlled)
  const [editingText, setEditingText] = useState<string>("");

  // Handler functions lifted from PromptControls
  const handleReset = () => {
    setSpecificity("General");
    setStyle("Conversational");
    setContext("No Background");
    setBias("No Bias");
  };

  const handleApplyChanges = () => {
    // Handle submit logic here
    // The values to use are specificity, style, context, and bias
    console.log("Applying changes from PromptPlayground:");
    console.log("Specificity:", specificity);
    console.log("Style:", style);
    console.log("Context:", context);
    console.log("Bias:", bias);
  }

  const handlePromptOptimize = async (
    prompt: string,
    specificity: string,
    style: string,
    context: string,
    bias: string
  ) => {
    if (!prompt.trim()) return; // Don't optimize empty prompts

    const optimize_prompt = await fetch(
      "https://llm1.hochschule-stralsund.de:8000/optimize",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          language: "en",
          temperature: 0.7,
          specificity: specificity,
          communication_mode: style,
          depth: context, 
          bias: bias,
          length: "short",
        }),
      }
    );

    const data = await optimize_prompt.json();

    const optimized_prompt: string = data.optimized_prompt;

    console.log("Received optimized prompt from backend:", optimized_prompt);

    // update both currentPrompt and the editing buffer so Chatbox shows optimized text
    setCurrentPrompt(optimized_prompt);
    setEditingText(optimized_prompt);
  };

  // On submit: update `currentPrompt` synchronously, then perform async submit
  const handleChatSubmit = (submittedText: string) => {
    if (!submittedText.trim()) return; // Don't submit empty prompts

    // Update currentPrompt and editing buffer to the submitted text
    setCurrentPrompt(submittedText);
    setEditingText(submittedText);

    // Call the async submitter (fire-and-forget)
    void submitPromptAsync(submittedText);
  };

  // Async worker: performs network call and updates conversation state
  const submitPromptAsync = async (submittedText: string) => {
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
    setSubmittedResponses(prevResponses => [...prevResponses, answer]);
  };

  // Add useEffect to scroll when prompts or responses change
  useEffect(() => {
    if (chatEndRef.current) {
      // Scroll to the bottom of the container
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [submittedPrompts]); // Dependency array: run whenever these states change

  return (
    <div className="min-h-screen max-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="flex-none">
            <div className="sticky top-4">
              <PromptControls
              specificity={specificity}
              style={style}
              context={context}
              bias={bias}
              onSpecificityChange={setSpecificity}
              onStyleChange={setStyle}
              onContextChange={setContext}
              onBiasChange={setBias}
              onReset={handleReset}
              onSubmit={() => handlePromptOptimize(currentPrompt, specificity, style, context, bias)}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-8rem)]">
            <Chatbox
              value={editingText}
              onChange={setEditingText}
              onSubmit={handleChatSubmit}
              canType={true}
              submitButtonId="prompt-playground-submit"
            />
            <div className='flex-1 overflow-y-auto' ref={chatEndRef}>
              <ChatBody submittedPrompts={submittedPrompts} submittedResponses={submittedResponses} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex-none">
            <EvaluationPanel />
          </div>
        </div>
      </main >
    </div >
  );
};

export default PromptPlayground;