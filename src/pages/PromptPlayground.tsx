import Header from "@/components/Header";
import EvaluationPanel from "@/components/EvaluationPanel";
import PromptControls from "@/components/PromptControls";
import ChatPrompt from "@/components/ChatPrompt";
import { useState, useRef, useEffect } from "react";
import ChatAnswer from "@/components/ChatAnswer";

type ThreadVersion = { prompt: string; answer?: string };
type Thread = { versions: ThreadVersion[]; currentIndex: number };

function ChatBody({
  threads,
  onPrevVersion,
  onNextVersion,
}: {
  threads: Thread[];
  onPrevVersion: (threadIndex: number) => void;
  onNextVersion: (threadIndex: number) => void;
}) {
  return (
    <div className="mt-6 space-y-4">
      {threads.map((thread, threadIndex) => {
        const current = thread.versions[thread.currentIndex];
        return (
          <div key={threadIndex}>
            <ChatPrompt
              text={current.prompt}
              versionIndex={thread.currentIndex}
              versionCount={thread.versions.length}
              onPrevVersion={() => onPrevVersion(threadIndex)}
              onNextVersion={() => onNextVersion(threadIndex)}
            />
            {current.answer && (
              <ChatAnswer
                text={current.answer}
                // Provide previous answers within this thread for diffing
                answerArray={thread.versions.map(v => v.answer ?? "")}
                currentIndex={thread.currentIndex}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
const PromptPlayground = () => {
  // Create a ref for the scrollable chat container
  const chatEndRef = useRef<HTMLDivElement>(null);

  // state to store threads with versioned prompts/answers
  const [threads, setThreads] = useState<Thread[]>([]);

  // State lifted from PromptControls
  const [specificity, setSpecificity] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [bias, setBias] = useState<string>("");

  // ChatBox text state
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  // editingText is the live text being edited in the Chatbox (controlled)
  const [editingText, setEditingText] = useState<string>("");
  // Stores the previous prompt to enable single-level undo
  const [previousPrompt, setPreviousPrompt] = useState<string>("");

  const [sentBasePrompt, setSentBasePrompt] = useState<boolean>(false);

  // Handler functions lifted from PromptControls
  const handleReset = () => {
    setSpecificity("");
    setStyle("");
    setContext("");
    setBias("");
  };

  const handlePromptOptimize = async (
    prompt: string,
    specificity: string,
    style: string,
    context: string,
    bias: string
  ) => {
    if (!prompt.trim()) return; // Don't optimize empty prompts

    // Capture the previous prompt before applying changes
    setPreviousPrompt(prompt);

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

    // Add optimized prompt as a new version in the latest thread (or create one if none)
    let targetThreadIndex = 0;
    let newVersionIndex = 0;
    setThreads(prev => {
      if (prev.length === 0) {
        targetThreadIndex = 0;
        newVersionIndex = 0;
        return [{ versions: [{ prompt: optimized_prompt }], currentIndex: 0 }];
      }
      targetThreadIndex = prev.length - 1;
      const copy = [...prev];
      const t = { ...copy[targetThreadIndex] };
      t.versions = [...t.versions, { prompt: optimized_prompt }];
      newVersionIndex = t.versions.length - 1;
      t.currentIndex = newVersionIndex;
      copy[targetThreadIndex] = t;
      return copy;
    });

    // Fetch answer for the newly added version (use captured indices)
    await submitAnswerForThreadVersion(targetThreadIndex, newVersionIndex, optimized_prompt);

    handleReset();
  };

  // Undo handler: revert to the previous prompt (single-level undo)
  const handleUndo = () => {
    if (!previousPrompt) return;
    setCurrentPrompt(previousPrompt);
    setEditingText(previousPrompt);
    // Clear previousPrompt after undo to disable the button until next change
    setPreviousPrompt("");
  };

  // On submit: update `currentPrompt` synchronously, then perform async submit
  const handleChatSubmit = (submittedText: string) => {
    if (!submittedText.trim()) return; // Don't submit empty prompts

    // Update currentPrompt and editing buffer to the submitted text
    setCurrentPrompt(submittedText);
    // setEditingText(submittedText);
    // setSentBasePrompt(true);

    // Call the async submitter (fire-and-forget)
    void createNewThreadAndFetch(submittedText);
  };

  // Create a new thread with the submitted prompt, then fetch and set answer
  const createNewThreadAndFetch = async (submittedText: string) => {
    let newThreadIndex = -1;
    setThreads(prev => {
      newThreadIndex = prev.length;
      return [...prev, { versions: [{ prompt: submittedText }], currentIndex: 0 }];
    });
    await submitAnswerForThreadVersion(newThreadIndex, 0, submittedText);
  };

  // Helper to submit answer for the latest thread's latest version (used after optimize)
  const submitAnswerForLatestVersion = async () => {
    const threadIndex = threads.length === 0 ? 0 : threads.length - 1;
    const versionIndex = threads[threadIndex]?.versions.length ? threads[threadIndex].versions.length - 1 : 0;
    const promptText = threads[threadIndex]?.versions[versionIndex]?.prompt ?? currentPrompt;
    await submitAnswerForThreadVersion(threadIndex, versionIndex, promptText);
  };

  // Perform network call and write answer into a specific thread/version
  const submitAnswerForThreadVersion = async (threadIndex: number, versionIndex: number, promptText: string) => {
    console.log("Submitting for thread/version:", threadIndex, versionIndex, promptText);
    const currentFileIds: string[] = [];
    const response = await fetch(
      "https://llm1.hochschule-stralsund.de:8000/answer",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          temperature: 0.7,
          fileIds: currentFileIds,
        }),
      }
    );
    const data: { answer: string } = await response.json();
    const answer: string = data.answer;
    setThreads(prev => {
      const copy = [...prev];
      // Fallback to last thread if the provided index isn't available yet
      let safeThreadIndex = threadIndex;
      if (!copy[safeThreadIndex]) {
        safeThreadIndex = copy.length - 1;
      }
      if (safeThreadIndex < 0 || !copy[safeThreadIndex]) return prev;

      const t = { ...copy[safeThreadIndex] };
      const versions = [...t.versions];
      // Fallback to last version if the provided version index isn't available yet
      let safeVersionIndex = versionIndex;
      if (!versions[safeVersionIndex]) {
        safeVersionIndex = versions.length - 1;
      }
      if (safeVersionIndex < 0 || !versions[safeVersionIndex]) return prev;

      versions[safeVersionIndex] = { ...versions[safeVersionIndex], answer };
      t.versions = versions;
      copy[safeThreadIndex] = t;
      return copy;
    });
  };

  // Add useEffect to scroll when prompts or responses change
  useEffect(() => {
    if (chatEndRef.current) {
      // Scroll to the bottom of the container
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [threads]); // Dependency array: run whenever these states change

  // Version navigation handlers
  const handlePrevVersion = (threadIndex: number) => {
    setThreads(prev => {
      const copy = [...prev];
      if (!copy[threadIndex]) return prev;
      const t = { ...copy[threadIndex] };
      t.currentIndex = Math.max(0, t.currentIndex - 1);
      copy[threadIndex] = t;
      return copy;
    });
  };
  const handleNextVersion = (threadIndex: number) => {
    setThreads(prev => {
      const copy = [...prev];
      if (!copy[threadIndex]) return prev;
      const t = { ...copy[threadIndex] };
      t.currentIndex = Math.min(t.versions.length - 1, t.currentIndex + 1);
      copy[threadIndex] = t;
      return copy;
    });
  };

  return (
    <div className="min-h-screen max-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-4">
        <div className="flex gap-8 h-[calc(100vh-8rem)]">
          {/* Left Sidebar */}
          <div className="flex-none h-full">
            <div className="sticky top-4 h-[calc(100vh-8rem)]">
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
                undoEnabled={Boolean(previousPrompt && previousPrompt !== currentPrompt)}
                onUndo={handleUndo}
                chatValue={editingText}
                onChatChange={setEditingText}
                onChatSubmit={handleChatSubmit}
                chatSubmitButtonId="prompt-playground-submit"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-8rem)]">
            <div className='flex-1 overflow-y-auto' ref={chatEndRef}>
              <ChatBody
                threads={threads}
                onPrevVersion={handlePrevVersion}
                onNextVersion={handleNextVersion}
              />
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