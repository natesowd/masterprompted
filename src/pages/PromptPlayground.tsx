import Header from "@/components/Header";
import EvaluationPanel from "@/components/EvaluationPanel";
import PromptControls from "@/components/PromptControls";
import ChatPrompt from "@/components/ChatPrompt";
import { useState, useRef, useEffect, useCallback } from "react";
import ChatAnswer from "@/components/ChatAnswer";
import { PopoverSeries } from "@/components/PopoverSeries";
import { Button } from "@/components/ui/button";
import { CircleQuestionMark } from "lucide-react";
import { set } from "zod";

// --- REFACTORED: Defined a single type for all optimization parameters ---
export type Parameters = {
  specificity: string;
  style: string;
  context: string;
  bias: string;
};

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

  // --- REFACTORED: State for parameters is now a single object ---
  const [parameters, setParameters] = useState<Parameters>({
    specificity: "",
    style: "",
    context: "",
    bias: "",
  });

  const [disableSend, setDisableSend] = useState(false);
  const [disableOptimize, setDisableOptimize] = useState(false);

  // numeric pulse to trigger UI animations in child components when optimize returns
  const [optimizePulse, setOptimizePulse] = useState(0);

  // ChatBox text state
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [editingText, setEditingText] = useState<string>("");
  // Stores the previous prompt to enable single-level undo
  const [previousPrompt, setPreviousPrompt] = useState<string>("");

  const [enableBias, setEnableBias] = useState<boolean>(false);
  const [enableSpecificity, setEnableSpecificity] = useState<boolean>(false)
  const [enableStyle, setEnableStyle] = useState<boolean>(false)
  const [enableContext, setEnableContext] = useState<boolean>(false)

  // Popover should show on first-ever visit, then not again. Use localStorage to persist.
  const LOCALSTORAGE_POPKEY = "promptPlayground.popoverSeen";
  const [showPopover, setShowPopover] = useState<boolean>(false);

  // On mount, open popover if not seen before
  useEffect(() => {
    try {
      const seen = localStorage.getItem(LOCALSTORAGE_POPKEY);
      if (!seen) {
        setShowPopover(true);
      }
    } catch (e) {
      // ignore localStorage errors and default to not showing
      setShowPopover(false);
    }
  }, []);


  // --- REFACTORED: Consolidated handler for all parameter changes ---
  const handleParameterChange = (paramKey: keyof Parameters, value: string) => {
    setParameters(prev => ({
      ...prev,
      [paramKey]: value,
    }));
  };

  // --- REFACTORED: Reset handler now clears the single parameters object ---
  const handleReset = useCallback(() => {
    setParameters({
      specificity: "",
      style: "",
      context: "",
      bias: "",
    });
  }, []);

  // Perform network call and write answer into a specific thread/version
  const submitAnswerForThreadVersion = useCallback(async (threadIndex: number, versionIndex: number, promptText: string) => {
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
      let safeThreadIndex = threadIndex;
      if (!copy[safeThreadIndex]) safeThreadIndex = copy.length - 1;
      if (safeThreadIndex < 0 || !copy[safeThreadIndex]) return prev;

      const t = { ...copy[safeThreadIndex] };
      const versions = [...t.versions];
      let safeVersionIndex = versionIndex;
      if (!versions[safeVersionIndex]) safeVersionIndex = versions.length - 1;
      if (safeVersionIndex < 0 || !versions[safeVersionIndex]) return prev;

      versions[safeVersionIndex] = { ...versions[safeVersionIndex], answer };
      t.versions = versions;
      copy[safeThreadIndex] = t;
      return copy;
    });
  }, []);

  const handlePromptOptimize = useCallback(async (
    prompt: string,
    specificity: string,
    style: string,
    context: string,
    bias: string,
    send?: boolean
  ) => {
    if (!prompt.trim()) return;

    console.log("handlePromptOptimize called with prompt:", prompt, { specificity, style, context, bias });
    setPreviousPrompt(prompt);

    try {
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

      // write optimized prompt first
      console.log("optimized done");
      setEditingText(optimized_prompt);
      setDisableOptimize(false);
      // trigger pulse so parent UI can animate (e.g. chatbox bounce)
      // Log the new value inside the functional updater to avoid reading stale state
      setOptimizePulse(prev => prev + 1);
    } catch (err) {
      console.error("handlePromptOptimize failed:", err);
    }
  }, []);

  // --- NEW: useEffect to automatically optimize the prompt when parameters change ---
  useEffect(() => {
    if (!currentPrompt.trim()) return;

    if (Object.values(parameters).every(p => p === "")) {
      // setOptimizePulse(prev => prev + 1);
      setEditingText(currentPrompt);
      setDisableOptimize(true);
      return;
    }

    // Only optimize if at least one parameter is set
    if (Object.values(parameters).some(p => p !== "")) {
      handlePromptOptimize(
        currentPrompt,
        parameters.specificity,
        parameters.style,
        parameters.context,
        parameters.bias,
        false
      );
    }

  }, [parameters, currentPrompt, handlePromptOptimize]);

  // Undo handler: revert to the previous prompt (single-level undo)
  const handleUndo = () => {
    if (!previousPrompt) return;
    setCurrentPrompt(previousPrompt);
    setEditingText(previousPrompt);
    setPreviousPrompt("");
  };

  const handleChatSubmit = (submittedText: string) => {
    if (!submittedText.trim()) return;
    setCurrentPrompt(submittedText);
    setDisableSend(true);
    setDisableOptimize(true);
    void createNewThreadAndFetch(submittedText);
    setEnableSpecificity(true);
    setEnableBias(true);
    setEnableContext(true);
    setEnableStyle(true);
    handleReset();
  };

  const handleInputChange = (input: string) => {
    // console.log(input)
    setEditingText(input);
    setDisableSend(false);
    setDisableOptimize(true);
    setEnableSpecificity(false);
    setEnableBias(false);
    setEnableContext(false);
    setEnableStyle(false);
  }

  const createNewThreadAndFetch = async (submittedText: string) => {
    let newThreadIndex = -1;
    setThreads(prev => {
      newThreadIndex = prev.length;
      return [...prev, { versions: [{ prompt: submittedText }], currentIndex: 0 }];
    });
    await submitAnswerForThreadVersion(newThreadIndex, 0, submittedText);
  };

  // Helper to submit answer for the latest thread's latest version

  const submitAnswerForLatestVersion = async () => {
    if (threads.length === 0) return;
    const threadIndex = threads.length - 1;
    const versionIndex = threads[threadIndex].versions.length - 1;
    const promptText = threads[threadIndex].versions[versionIndex]?.prompt;

    // Add new version if prompt has changed
    if (editingText !== promptText) {
      setThreads(prev => {
        const copy = [...prev];
        const t = { ...copy[threadIndex] };
        t.versions = [...t.versions, { prompt: editingText, answer: null }];
        t.currentIndex = t.versions.length - 1;
        copy[threadIndex] = t;
        return copy;
      });

      const response = await fetch(
        "https://llm1.hochschule-stralsund.de:8000/answer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: editingText,
            temperature: 0.7,
            fileIds: [],
          }),
        }
      );
      const data: { answer: string } = await response.json();
      const answer: string = data.answer;

      setThreads(prev => {
        const copy = [...prev];
        const t = { ...copy[threadIndex] };
        const versions = [...t.versions];
        versions[t.currentIndex] = { prompt: editingText, answer };
        t.versions = versions;
        copy[threadIndex] = t;
        return copy;
      });
      handleReset();
      setCurrentPrompt(editingText)
    }
  };

  const prevThreadCount = useRef(threads.length);
  useEffect(() => {
    if (threads.length !== prevThreadCount.current) {
      if (chatEndRef.current) {
        const latestVersionElement = chatEndRef.current.querySelector(`[versionindex="${threads[threads.length - 1].currentIndex}"]`);
        if (latestVersionElement) {
          const rect = latestVersionElement.getBoundingClientRect();
          const offset = rect.top - chatEndRef.current.offsetTop + chatEndRef.current.scrollTop;
          chatEndRef.current.scrollTo({ top: offset, behavior: 'smooth' });
        } else {
          chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
        }
      }
    }
    prevThreadCount.current = threads.length;
  }, [threads.length]);

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
              {/* --- REFACTORED: Passing consolidated props to PromptControls --- */}
              <PromptControls
                parameters={parameters}
                onParameterChange={handleParameterChange}
                onReset={handleReset}
                onOptimize={submitAnswerForLatestVersion}
                onUndo={handleUndo}
                chatValue={editingText}
                onChatChange={handleInputChange}
                onChatSubmit={handleChatSubmit}
                chatSubmitButtonId="prompt-playground-submit"
                disableSend={disableSend}
                disableOptimize={disableOptimize}
                enableBias={enableBias}
                enableSpecificity={enableSpecificity}
                enableContext={enableContext}
                enableStyle={enableStyle}
                chatAnimationKey={optimizePulse}
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
          <div className="w-[calc(18rem+2.5rem)] flex flex-col items-end gap-4">
            <button
              className="p-2 rounded-full hover:bg-muted/50"
              onClick={() => setShowPopover(true)}
            >
              <CircleQuestionMark className="h-6 w-6 text-muted-foreground" />
            </button>
            <EvaluationPanel initialIsOpen={false} />
          </div>
        </div>

      </main >
      {showPopover && (
        <PopoverSeries
          steps={[
            {
              id: "submit-hint",
              trigger: "#chatbox",
              content: "Click here to submit your prompt and see the AI's response!"
            },
            {
              id: "controls-hint",
              trigger: "#parameters",
              content: "You can use the prompt controls to optimize your prompt."
            }
          ]}
          initialStep={0}
          onClose={() => {
            try {
              localStorage.setItem(LOCALSTORAGE_POPKEY, "true");
            } catch (e) {
              /* ignore */
            }
            setShowPopover(false);
          }}
        />
      )}
    </div >
  );
};

export default PromptPlayground;