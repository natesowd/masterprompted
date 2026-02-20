// src/pages/PromptPlayground.tsx

import Header from "@/components/Header";
import PromptControls from "@/components/PromptControls";
import { useState, useEffect, useCallback } from "react";
import { PopoverSeries } from "@/components/PopoverSeries";
import { useLanguage } from '@/contexts/LanguageContext';
import ChatBody from "@/components/ChatBody";
import { checkDisinformation, DisinformationSpan } from "@/services/disinformationApi";
const NO_CHANGE_VALUE = "no-change";
const NETLIFY_CHAT_URL = "https://luxury-blini-3336bb.netlify.app/.netlify/functions/chat";

export type Parameters = {
  specificity: string;
  style: string;
  context: string;
  bias: string;
};

export type VersionEvaluation = {
  loading: boolean;
  error: boolean;
  data: DisinformationSpan[] | null;
};

export type ThreadVersion = { prompt: string; answer?: string; parameters?: Parameters };
export type Thread = {
  versions: ThreadVersion[];
  currentIndex: number;
  showDiff?: boolean;
  showEvaluation?: boolean;
  evaluations?: VersionEvaluation[];
};

type AttachedFile = {
  name: string;
  isUploading?: boolean;
  // id?: string; // reserved for future backend IDs
};
const PromptPlayground = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [parameters, setParameters] = useState<Parameters>({ specificity: "", style: "", context: "", bias: "" });
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
  const [showControlPanelPopover, setShowControlPanelPopover] = useState<boolean>(false);
  const { t } = useLanguage();
  const [waitingforOptimization, setWaitingForOptimization] = useState<boolean>(false);

  // Track current page language (forwarded from Header -> LanguageSwitcher)
  const [pageLanguage, setPageLanguage] = useState<'en' | 'es'>('en');

  const handleThreadDiffToggle = useCallback((threadIndex: number, checked: boolean) => {
    setThreads(prev => {
      const next = [...prev];
      if (!next[threadIndex]) {
        return prev;
      }
      next[threadIndex] = { ...next[threadIndex], showDiff: checked };
      return next;
    });
  }, []);

  const handleThreadEvaluationToggle = useCallback((threadIndex: number, checked: boolean) => {
    setThreads(prev => {
      const next = [...prev];
      if (!next[threadIndex]) {
        return prev;
      }
      next[threadIndex] = { ...next[threadIndex], showEvaluation: checked };
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(LOCALSTORAGE_POPKEY);
      if (!seen) setShowControlPanelPopover(true);
    } catch (e) { setShowControlPanelPopover(false); }
  }, []);

  const handleParameterChange = (paramKey: keyof Parameters, value: string) => {
    setParameters(prev => ({ ...prev, [paramKey]: value }));
  };

  const handleReset = () => {
    setFullReset(true);
    setParameters({ specificity: "", style: "", context: "", bias: "" });
  };



  const submitAnswerForThreadVersion = useCallback(
    async (threadIndex: number, versionIndex: number, promptText: string) => {
      const response = await fetch(NETLIFY_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.1-8B-Instruct:ovhcloud",
          temperature: 0.7,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: promptText },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`answer request failed: ${response.status} - ${errorText}`);
      }

      const hfResult = await response.json();
      const answer = hfResult.choices[0].message.content || "";
      const data: { answer: string } = { answer };

      // Update answer in state
      setThreads(prev => {
        const copy = [...prev];
        const thread = copy[threadIndex];
        if (!thread?.versions[versionIndex]) return prev;
        const versions = thread.versions.map((version, idx) =>
          idx === versionIndex ? { ...version, answer: data.answer } : version
        );

        // Initialize evaluation entry as loading and disable showEvaluation
        const evaluations = [...(thread.evaluations || [])];
        evaluations[versionIndex] = { loading: true, error: false, data: null };

        copy[threadIndex] = {
          ...thread,
          versions,
          evaluations,
          showEvaluation: false, // Auto-disable while loading
        };
        return copy;
      });

      // Trigger disinformation check
      const evaluationResult = await checkDisinformation(data.answer);

      // Update evaluation state
      setThreads(prev => {
        const copy = [...prev];
        const thread = copy[threadIndex];
        if (!thread?.evaluations) return prev;

        const evaluations = [...thread.evaluations];
        evaluations[versionIndex] = {
          loading: false,
          error: evaluationResult === null,
          data: evaluationResult,
        };

        copy[threadIndex] = { ...thread, evaluations };
        return copy;
      });
    },
    []
  );

  const handlePromptOptimize = useCallback(async (prompt: string, ...args: string[]) => {
    if (!prompt.trim()) return;
    setWaitingForOptimization(true);
    setPreviousPrompt(prompt);
    try {
      const [specificity, style, context, bias] = args;
      const paramMap: Record<string, string> = { specificity, style, context, bias };

      const params = Object.entries(paramMap)
        .filter(([_, value]) => value !== NO_CHANGE_VALUE && value !== "")
        .map(([name, value]) => `${name} level: ${value}`)
        .join(", ");

      const optimizeUserPrompt = `Rewrite the following string to align with the following paramters: ${params}. String: "${prompt}".`;

      const response = await fetch(NETLIFY_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.1-8B-Instruct:ovhcloud",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                `You are an instructional refiner. Your role is to perform a seamless transformation of a provided string based on the requested modifications.

              OPERATIONAL PRINCIPLES:
              1. INTENT PRESERVATION: Maintain the fundamental objective and structural type of the original request. The core mission of the input must remain intact through the transformation. Crucially, preserve the original point of view, pronouns, and ownership; if the input says "my," "I," or "me," the output must retain that specific perspective.
              2. LINGUISTIC INTEGRATION: Incorporate the requested shifts directly into the syntax, tone, and framing of the text. The final output should be a cohesive instruction where the modifications are inherent to the writing style rather than externally described. 
              3. LENGTH CONCIOUSNESS: Try to mirror the length of the original string. Try to be as concise as possible in order to achieve the desired output. 
              4. OUTPUT STRICTURE: You must output ONLY the final transformed text. Do not include introductory remarks, concluding statements, quotes, markdown formatting, or meta-commentary. The response must contain the modified instruction and nothing else.
              `
            },
            { role: "user", content: optimizeUserPrompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`optimize request failed: ${response.status} - ${errorText}`);
      }

      const hfResult = await response.json();
      const optimizedPrompt = hfResult.choices[0].message.content || "";

      if (optimizedPrompt) {
        setEditingText(optimizedPrompt);
        setDisableOptimize(false);
        setOptimizePulse(prev => prev + 1);
      } else {
        throw new Error("handlePromptOptimize: optimized_prompt missing or empty");
      }
    } catch (err) { console.error("handlePromptOptimize failed:", err); }
    setWaitingForOptimization(false);
  }, [pageLanguage]);

  useEffect(() => {
    if (!currentPrompt.trim() && !editingText.trim()) return;
    if (Object.values(parameters).every(p => p === "")) {
      if (!fullReset) {
        setEditingText(currentPrompt);
        setDisableOptimize(true);
        setOptimizePulse(prev => prev + 1);
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
  }, [parameters, handlePromptOptimize]);

  const handleUndo = () => {
    if (!previousPrompt) return;
    setCurrentPrompt(previousPrompt);
    setEditingText(previousPrompt);
    setPreviousPrompt("");
  };

  const createNewThreadAndFetch = async (submittedText: string) => {
    const newThreadIndex = threads.length;
    setThreads(prev => [...prev, { versions: [{ prompt: submittedText }], currentIndex: 0, showDiff: false }]);
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
        const targetThread = copy[threadIndex];
        if (!targetThread) {
          return prev;
        }
        copy[threadIndex] = {
          ...targetThread,
          versions: [...targetThread.versions, { prompt: promptText, answer: undefined, parameters }],
          currentIndex: newVersionIndex,
        };
        return copy;
      });
      await submitAnswerForThreadVersion(threadIndex, newVersionIndex, promptText);
    }
  };

  const handleSubmit = async (submittedText: string, isOptimize: boolean = false) => {
    if (!submittedText.trim()) return;
    if (isOptimize) {
      setCurrentPrompt(submittedText);
    }
    setDisableSend(true);
    setDisableOptimize(true);
    setHasManualEdit(false);
    setEnableSpecificity(true); setEnableBias(true); setEnableContext(true); setEnableStyle(true);
    if (threads.length === 0 || hasManualEdit) {
      await createNewThreadAndFetch(submittedText);
    } else {
      await submitAnswerForLatestVersion(submittedText);
    }
  };

  const handleChatSubmit = (submittedText: string) => { void handleSubmit(submittedText, true); };
  const handleOptimizeSubmit = async () => { if (editingText.trim()) { void handleSubmit(editingText, false); } };
  const handleInputChange = (input: string) => {
    setHasManualEdit(true);
    handleReset();
    setEditingText(input);
    setCurrentPrompt(input);
    const isEmpty = !input.trim();
    setDisableSend(isEmpty);
    setDisableOptimize(true);
    setEnableSpecificity(false); setEnableBias(false); setEnableContext(false); setEnableStyle(false);
  };

  const handlePrevVersion = useCallback((threadIndex: number) => {
    setThreads(prev => {
      const copy = [...prev];
      const thread = copy[threadIndex];
      if (!thread) return prev;
      copy[threadIndex] = {
        ...thread,
        currentIndex: Math.max(0, thread.currentIndex - 1),
      };
      return copy;
    });
  }, []);

  const handleNextVersion = useCallback((threadIndex: number) => {
    setThreads(prev => {
      const copy = [...prev];
      const thread = copy[threadIndex];
      if (!thread) return prev;
      copy[threadIndex] = {
        ...thread,
        currentIndex: Math.min(thread.versions.length - 1, thread.currentIndex + 1),
      };
      return copy;
    });
  }, []);

  return (
    <div className="min-h-screen max-h-screen bg-background">
      <Header onLanguageChange={setPageLanguage} />
      <main className="container mx-auto px-6 py-4">
        <div className="flex gap-8 h-[calc(100vh-8rem)]">
          <div className="flex-none h-full">
            <div className="sticky top-4 h-[calc(100vh-8rem)]">
              <PromptControls {...{
                parameters,
                onParameterChange: handleParameterChange,
                onReset: handleReset,
                onOptimize: handleOptimizeSubmit,
                onUndo: handleUndo,
                chatValue: editingText,
                onChatChange: handleInputChange,
                onChatSubmit: handleChatSubmit,
                chatSubmitButtonId: "prompt-playground-submit",
                disableSend,
                disableOptimize,
                enableBias,
                enableSpecificity,
                enableContext,
                enableStyle,
                chatAnimationKey: optimizePulse,
                waitingforOptimization,
                files: [],
                onUploadFiles: () => { }
              }} />
            </div>
          </div>
          <ChatBody
            threads={threads}
            onPrevVersion={handlePrevVersion}
            onNextVersion={handleNextVersion}
            onToggleThreadDiff={handleThreadDiffToggle}
            onToggleThreadEvaluation={handleThreadEvaluationToggle}
            onRequestControlPanelHelp={() => setShowControlPanelPopover(true)}
          />
        </div>
      </main>
      {showControlPanelPopover && (
        <PopoverSeries
          steps={[
            { id: "submit-hint", trigger: "#chatbox", content: t('components.popoverSeries.promptPlayground.submitHint') },
            { id: "controls-hint", trigger: "#parameters", content: t('components.popoverSeries.promptPlayground.controlsHint') }
          ]}
          initialStep={0}
          onClose={() => {
            try { localStorage.setItem(LOCALSTORAGE_POPKEY, "true"); } catch (e) { /* ignore */ }
            setShowControlPanelPopover(false);
          }}
        />
      )}
      <div className="mt-6 text-sm text-muted-foreground max-w-7xl mx-auto">
        LLMs have been used in the following places:<br />
        The creation of prompt optimizations and generated outputs in the Prompt Playground<br />
        LLMs used include: Mistral, Claude, Chat GPT & Llama 3.1 8B (open source)
      </div>
    </div>
  );
};

export default PromptPlayground;