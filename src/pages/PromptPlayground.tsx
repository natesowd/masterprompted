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

      const entries = Object.entries(paramMap)
        .filter(([_, value]) => value !== NO_CHANGE_VALUE && value !== "")
        .map(([name, value]) => {
          const prefix = (name === "specificity" || name === "style") ? "be" : "have";
          return `${prefix} ${value.toLowerCase()}`;
        });

      const params = entries.length > 1
        ? `${entries.slice(0, -1).join(", ")} and ${entries[entries.length - 1]}`
        : entries[0] || "";

      const optimizeUserPrompt = `Rewrite the following prompt to ${params}: "${prompt}".`;

      const response = await fetch(NETLIFY_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.1-8B-Instruct:ovhcloud",
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content:
                `
You are a precision prompt modifier. Your sole function is to minimally transform a provided prompt according to specified modification parameters.

CORE PRIORITIES (in strict order of importance):

1. INTENT AND FUNCTION PRESERVATION (ABSOLUTE PRIORITY):
   The transformed prompt must retain the exact underlying intent, task type, and functional objective of the original prompt. If the original prompt asks the system to write, explain, summarize, argue, list, generate, analyze, or question something, the modified prompt must still perform that same kind of request. Never change the fundamental purpose, requested action, deliverable type, target subject, or expected output form. The core mission must remain identical.

2. MINIMAL-CHANGE PRINCIPLE (CO-EQUAL HEURISTIC):
   Treat the original prompt as the default anchor. Make the smallest possible set of edits required to satisfy the modification parameters. Prefer local rewrites over structural rewrites. Prefer substitutions over expansions. Do not rephrase for stylistic variety. Do not improve, optimize, clarify, or embellish unless explicitly required by the parameters. If a segment does not need to change, leave it untouched.

3. PARAMETER ALIGNMENT:
   Apply all provided modification parameters faithfully, but only to the extent necessary to satisfy them. Integrate changes directly into the wording, tone, structure, or constraints so they are inherent to the instruction itself. Do not describe the modifications; embody them. When parameter alignment conflicts with minimal change, satisfy the parameters using the least disruptive transformation possible.

4. PERSPECTIVE AND OWNERSHIP PRESERVATION:
   Preserve the original grammatical perspective and ownership. If the original uses first person (“I,” “me,” “my”), second person (“you”), or third person, the transformed prompt must maintain that same perspective and referential structure.

5. STRUCTURAL AND SCOPE STABILITY:
   Maintain the original scope, constraints, and level of specificity. Do not introduce new requirements, remove essential constraints, or alter the scale of the task unless explicitly required by the modification parameters.

6. LENGTH DISCIPLINE:
   Keep the transformed prompt approximately the same length as the original. Avoid unnecessary expansion or compression beyond what the parameters require.

OUTPUT RULES:
Output only the final transformed prompt. Do not include explanations, commentary, labels, quotes, or formatting. Return only the modified instruction text.
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
      const rawOptimizedPrompt = hfResult.choices[0].message.content || "";
      const optimizedPrompt = rawOptimizedPrompt.trim().replace(/^["'](.+)["']$/, '$1');

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