// src/pages/PromptPlayground.tsx

import Header from "@/components/Header";
import EvaluationPanel from "@/components/EvaluationPanel";
import PromptControls from "@/components/PromptControls";
import ChatPrompt from "@/components/ChatPrompt";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ChatAnswer from "@/components/ChatAnswer";
import { PopoverSeries } from "@/components/PopoverSeries";
import { Skeleton } from "@/components/ui/skeleton"
import { CircleQuestionMark } from "lucide-react";
import RemovedTextSidebar from "@/components/RemovedTextSidebar";
import * as jsdiff from "diff";

export type Parameters = {
  specificity: string;
  style: string;
  context: string;
  bias: string;
};

type ThreadVersion = { prompt: string; answer?: string };
type Thread = { versions: ThreadVersion[]; currentIndex: number };
type RemovedComment = { id: string; value: string };

function ChatBody({
  threads,
  onPrevVersion,
  onNextVersion,
  showDiff,
  onToggleDiff,
  hoveredCommentId,
  onHoverComment,
  scrollContainerRef,
  onUpdateCommentPosition,
  inlineCommentIds,
  onCommentClick,
}: {
  threads: Thread[];
  onPrevVersion: (threadIndex: number) => void;
  onNextVersion: (threadIndex: number) => void;
  showDiff: boolean;
  onToggleDiff: (checked: boolean) => void;
  hoveredCommentId: string | null;
  onHoverComment: (id: string | null) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onUpdateCommentPosition: (id: string, top: number) => void;
  inlineCommentIds: Set<string>;
  onCommentClick: (id: string) => void;
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
            {!current.answer && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[500px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            )}
            {current.answer && (
              <ChatAnswer
                text={current.answer}
                answerArray={thread.versions.map(v => v.answer ?? "")}
                currentIndex={thread.currentIndex}
                threadIndex={threadIndex}
                showDiff={showDiff}
                onToggleDiff={onToggleDiff}
                hoveredCommentId={hoveredCommentId}
                onHoverComment={onHoverComment}
                scrollContainerRef={scrollContainerRef}
                onUpdateCommentPosition={onUpdateCommentPosition}
                inlineCommentIds={inlineCommentIds}
                onCommentClick={onCommentClick}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
const PromptPlayground = () => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [parameters, setParameters] = useState<Parameters>({
    specificity: "", style: "", context: "", bias: "",
  });
  const [disableSend, setDisableSend] = useState(true);
  const [disableOptimize, setDisableOptimize] = useState(true);
  const [optimizePulse, setOptimizePulse] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [editingText, setEditingText] = useState<string>("");
  const [previousPrompt, setPreviousPrompt] = useState<string>("");
  const [hasManualEdit, setHasManualEdit] = useState<boolean>(false);
  const [enableBias, setEnableBias] = useState<boolean>(false);
  const [enableSpecificity, setEnableSpecificity] = useState<boolean>(false);
  const [enableStyle, setEnableStyle] = useState<boolean>(false);
  const [enableContext, setEnableContext] = useState<boolean>(false);
  const [fullReset, setFullReset] = useState<boolean>(false);
  const LOCALSTORAGE_POPKEY = "promptPlayground.popoverSeen";
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [waitingforOptimization, setWaitingForOptimization] = useState<boolean>(false);

  // --- State for Diffing, Comments, and Scrolling ---
  const [showDiff, setShowDiff] = useState(false);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [commentPositions, setCommentPositions] = useState<Record<string, number>>({});
  const [inlineCommentIds, setInlineCommentIds] = useState(() => new Set<string>());
  const isSyncingScroll = useRef(false);

  const activeComments = useMemo<RemovedComment[]>(() => {
    if (!showDiff) return [];
    const allComments: RemovedComment[] = [];
    threads.forEach((thread, threadIndex) => {
      if (thread.currentIndex > 0) {
        const currentAnswer = thread.versions[thread.currentIndex].answer?.replace(/\\n/g, '\n') ?? "";
        const originalAnswer = thread.versions[0].answer?.replace(/\\n/g, '\n') ?? "";
        const diffResult = jsdiff.diffWords(originalAnswer, currentAnswer);
        diffResult.forEach((part, index) => {
          if (part.removed) {
            allComments.push({
              id: `comment-${threadIndex}-${thread.currentIndex}-${index}`,
              value: part.value,
            });
          }
        });
      }
    });
    return allComments;
  }, [threads, showDiff]);

  const handleToggleDiff = (checked: boolean) => {
    if (!checked) {
      setCommentPositions({});
      setInlineCommentIds(new Set());
    }
    setShowDiff(checked);
  };

  const handleUpdateCommentPosition = useCallback((id: string, top: number) => {
    setCommentPositions(prev => {
      if (prev[id] === top) return prev;
      return { ...prev, [id]: top };
    });
  }, []);

  const handleCommentClick = (id: string) => {
    setInlineCommentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleHoverComment = (id: string | null) => {
    setHoveredCommentId(id);
    if (id && sidebarRef.current && !inlineCommentIds.has(id)) {
      const commentEl = document.getElementById(id);
      if (commentEl) {
        isSyncingScroll.current = true;
        sidebarRef.current.scrollTo({
          top: commentEl.offsetTop - 20,
          behavior: 'smooth'
        });
        setTimeout(() => isSyncingScroll.current = false, 500); // Disable sync briefly
      }
    }
  }

  // --- Scroll Synchronization Effect ---
  useEffect(() => {
    const chatEl = chatEndRef.current;
    const sidebarEl = sidebarRef.current;

    if (!chatEl || !sidebarEl) return;

    const syncSidebarToChat = () => {
      if (isSyncingScroll.current) return;
      isSyncingScroll.current = true;
      sidebarEl.scrollTop = chatEl.scrollTop;
      requestAnimationFrame(() => isSyncingScroll.current = false);
    };

    chatEl.addEventListener('scroll', syncSidebarToChat);
    return () => chatEl.removeEventListener('scroll', syncSidebarToChat);
  }, []);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(LOCALSTORAGE_POPKEY);
      if (!seen) setShowPopover(true);
    } catch (e) { setShowPopover(false); }
  }, []);

  const handleParameterChange = (paramKey: keyof Parameters, value: string) => {
    setParameters(prev => ({ ...prev, [paramKey]: value }));
  };

  const handleReset = () => {
    setFullReset(true);
    setParameters({ specificity: "", style: "", context: "", bias: "" });
  };

  const submitAnswerForThreadVersion = useCallback(async (threadIndex: number, versionIndex: number, promptText: string) => {
    const response = await fetch("https://llm1.hochschule-stralsund.de:8000/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText, temperature: 0.7, fileIds: [] }),
    });
    const data: { answer: string } = await response.json();
    setThreads(prev => {
      const copy = [...prev];
      if (!copy[threadIndex]?.versions[versionIndex]) return prev;
      copy[threadIndex].versions[versionIndex].answer = data.answer;
      return copy;
    });
  }, []);

  const handlePromptOptimize = useCallback(async (prompt: string, ...args: string[]) => {
    if (!prompt.trim()) return;
    setWaitingForOptimization(true);
    setPreviousPrompt(prompt);
    try {
      const [specificity, style, context, bias] = args;
      const response = await fetch("https://llm1.hochschule-stralsund.de:8000/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt, language: "en", temperature: 0.7, specificity, communication_mode: style, depth: context, bias, length: "short",
        }),
      });
      const data = await response.json();
      setEditingText(data.optimized_prompt);
      setDisableOptimize(false);
      setOptimizePulse(prev => prev + 1);
    } catch (err) { console.error("handlePromptOptimize failed:", err); }
    setWaitingForOptimization(false);
  }, []);

  useEffect(() => {
    if (!currentPrompt.trim() && !editingText.trim()) return;
    if (Object.values(parameters).every(p => p === "")) {
      if (!fullReset) {
        setEditingText(currentPrompt);
        setDisableOptimize(true);
      }
      setFullReset(false);
      return;
    }
    if (Object.values(parameters).some(p => p !== "")) {
      setDisableSend(true);
      const promptToOptimize = currentPrompt.trim() ? currentPrompt : editingText;
      if (promptToOptimize) {
        handlePromptOptimize(promptToOptimize, parameters.specificity, parameters.style, parameters.context, parameters.bias);
      }
    }
  }, [parameters, currentPrompt, editingText, fullReset, handlePromptOptimize]);

  const handleUndo = () => {
    if (!previousPrompt) return;
    setCurrentPrompt(previousPrompt);
    setEditingText(previousPrompt);
    setPreviousPrompt("");
  };

  const createNewThreadAndFetch = async (submittedText: string) => {
    const newThreadIndex = threads.length;
    setThreads(prev => [...prev, { versions: [{ prompt: submittedText }], currentIndex: 0 }]);
    await submitAnswerForThreadVersion(newThreadIndex, 0, submittedText);
  };

  const submitAnswerForLatestVersion = async (promptText: string) => {
    if (threads.length === 0) return;
    const threadIndex = threads.length - 1;
    const lastVersionPrompt = threads[threadIndex].versions.at(-1)?.prompt;
    if (promptText !== lastVersionPrompt) {
      const newVersionIndex = threads[threadIndex].versions.length;
      setThreads(prev => {
        const copy = [...prev];
        const t = copy[threadIndex];
        t.versions = [...t.versions, { prompt: promptText, answer: undefined }];
        t.currentIndex = newVersionIndex;
        return copy;
      });
      await submitAnswerForThreadVersion(threadIndex, newVersionIndex, promptText);
      handleReset();
    }
  };

  const handleSubmit = async (submittedText: string, isNewThread: boolean = false) => {
    if (!submittedText.trim()) return;
    setCurrentPrompt(submittedText);
    setDisableSend(true);
    setDisableOptimize(true);
    setHasManualEdit(false);
    setEnableSpecificity(true); setEnableBias(true); setEnableContext(true); setEnableStyle(true);
    if (threads.length === 0 || isNewThread || hasManualEdit) {
      handleReset();
      await createNewThreadAndFetch(submittedText);
    } else {
      await submitAnswerForLatestVersion(submittedText);
    }
  };

  const handleChatSubmit = (submittedText: string) => { void handleSubmit(submittedText, true); };
  const handleOptimizeSubmit = async () => { if (editingText.trim()) { handleReset(); void handleSubmit(editingText, false); } };
  const handleInputChange = (input: string) => {
    setHasManualEdit(true);
    handleReset();
    setEditingText(input);
    setCurrentPrompt(input);
    const isEmpty = !input.trim();
    setDisableSend(isEmpty);
    setDisableOptimize(true);
    setEnableSpecificity(!isEmpty); setEnableBias(!isEmpty); setEnableContext(!isEmpty); setEnableStyle(!isEmpty);
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight; }, [threads]);
  const handlePrevVersion = (threadIndex: number) => setThreads(prev => { const c = [...prev]; c[threadIndex].currentIndex = Math.max(0, c[threadIndex].currentIndex - 1); return c; });
  const handleNextVersion = (threadIndex: number) => setThreads(prev => { const c = [...prev]; c[threadIndex].currentIndex = Math.min(c[threadIndex].versions.length - 1, c[threadIndex].currentIndex + 1); return c; });

  return (
    <div className="min-h-screen max-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-4">
        <div className="flex gap-8 h-[calc(100vh-8rem)]">
          <div className="flex-none h-full">
            <div className="sticky top-4 h-[calc(100vh-8rem)]">
              <PromptControls {...{ parameters, onParameterChange: handleParameterChange, onReset: handleReset, onOptimize: handleOptimizeSubmit, onUndo: handleUndo, chatValue: editingText, onChatChange: handleInputChange, onChatSubmit: handleChatSubmit, chatSubmitButtonId: "prompt-playground-submit", disableSend, disableOptimize, enableBias, enableSpecificity, enableContext, enableStyle, chatAnimationKey: optimizePulse, waitingforOptimization }} />
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-8rem)] relative">
            <div className='flex-1 overflow-y-auto' ref={chatEndRef}>
              <ChatBody {...{ threads, onPrevVersion: handlePrevVersion, onNextVersion: handleNextVersion, showDiff, onToggleDiff: handleToggleDiff, hoveredCommentId, onHoverComment: handleHoverComment, scrollContainerRef: chatEndRef, onUpdateCommentPosition: handleUpdateCommentPosition, inlineCommentIds, onCommentClick: handleCommentClick }} />
            </div>
          </div>
          <div className="flex-none w-[calc(18rem+2.5rem)] h-full flex">
            <div className="flex-1 h-full overflow-y-hidden" ref={sidebarRef}>
              {showDiff && <RemovedTextSidebar {...{ comments: activeComments, positions: commentPositions, hoveredCommentId, onHover: handleHoverComment, inlineCommentIds, onCommentClick: handleCommentClick }} />}
            </div>
            <div className="w-[2.5rem] flex-none flex flex-col items-end gap-4 relative">
              <button className="p-2 rounded-full hover:bg-muted/50" onClick={() => setShowPopover(true)}>
                <CircleQuestionMark className="h-6 w-6 text-muted-foreground" />
              </button>
              <EvaluationPanel initialIsOpen={false} />
            </div>
          </div>
        </div>
      </main>
      {showPopover && <PopoverSeries steps={[{ id: "submit-hint", trigger: "#chatbox", content: "Click here to submit your prompt and see the AI's response!" }, { id: "controls-hint", trigger: "#parameters", content: "You can use the prompt controls to optimize your prompt." }]} initialStep={0} onClose={() => { try { localStorage.setItem(LOCALSTORAGE_POPKEY, "true"); } catch (e) { /* ignore */ } setShowPopover(false); }} />}
    </div>
  );
};

export default PromptPlayground;