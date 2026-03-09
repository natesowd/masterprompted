// src/pages/PromptPlayground.tsx

import Header from "@/components/Header";
import PromptControls from "@/components/PromptControlsPromptPlayground.tsx";
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

export type ParsedFile = {
  name: string;
  content: string;
  size: number;
  isUploading?: boolean;
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
  const [uploadedFiles, setUploadedFiles] = useState<ParsedFile[]>([]);
  const CONTEXT_WINDOW_LIMIT_WORDS = 150000;

  // Track current page language (forwarded from Header -> LanguageSwitcher)
  const [pageLanguage, setPageLanguage] = useState<'en' | 'es'>('en');

  const handleThreadDiffToggle = useCallback((threadIndex: number, checked: boolean) => {
    setThreads(prev => {
      const next = [...prev];
      if (!next[threadIndex]) {
        return prev;
      }
      next[threadIndex] = {
        ...next[threadIndex],
        showDiff: checked,
        showEvaluation: checked ? false : next[threadIndex].showEvaluation
      };
      return next;
    });
  }, []);

  const handleThreadEvaluationToggle = useCallback((threadIndex: number, checked: boolean) => {
    setThreads(prev => {
      const next = [...prev];
      if (!next[threadIndex]) {
        return prev;
      }
      next[threadIndex] = {
        ...next[threadIndex],
        showEvaluation: checked,
        showDiff: checked ? false : next[threadIndex].showDiff
      };
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
      const payload = {
        // model: "meta-llama/Llama-3.1-8B-Instruct:ovhcloud",
        model: "Qwen/Qwen3-Coder-30B-A3B-Instruct:fastest",
        temperature: 0.7,
        stream: true,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          ...uploadedFiles.map(file => ({
            role: "user" as const,
            content: `Context from uploaded PDF "${file.name}":\n\n${file.content}`
          })),
          { role: "user", content: promptText },
        ],
      };

      // Payload size verification (6MB limit)
      const payloadSize = new Blob([JSON.stringify(payload)]).size;
      if (payloadSize > 6 * 1024 * 1024) {
        alert(`Payload size (${(payloadSize / 1024 / 1024).toFixed(2)}MB) exceeds the 6MB Netlify limit.`);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("Client-side timeout: Aborting request after 25s.");
        controller.abort();
      }, 25000);

      try {
        const response = await fetch(NETLIFY_CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`answer request failed: ${response.status} - ${errorText}`);
        }

        if (!response.body) {
          throw new Error("No response body for streaming");
        }

        const decoder = new TextDecoder();
        let accumulatedAnswer = "";
        let isStreamComplete = false;

        // Initialize the version in the thread
        setThreads(prev => {
          const copy = [...prev];
          const thread = copy[threadIndex];
          if (!thread?.versions[versionIndex]) return prev;

          const versions = [...thread.versions];
          versions[versionIndex] = { ...versions[versionIndex], answer: "" };

          const evaluations = [...(thread.evaluations || [])];
          evaluations[versionIndex] = { loading: true, error: false, data: null };

          copy[threadIndex] = { ...thread, versions, evaluations, showEvaluation: false };
          return copy;
        });

        // Integrity Monitor: TransformStream to track chunks and completion
        const monitor = new TransformStream({
          transform(chunk, controller) {
            controller.enqueue(chunk);
          },
          flush() {
            isStreamComplete = true;
          }
        });

        const monitoredStream = response.body.pipeThrough(monitor);
        const reader = monitoredStream.getReader();
        let chunkCount = 0;

        console.info("Stream reading started...");

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunkCount++;
            if (chunkCount % 50 === 0) {
              console.log(`Still generating... (received ${chunkCount} text chunks, ~${accumulatedAnswer.length} chars)`);
            }

            accumulatedAnswer += decoder.decode(value, { stream: true });

            // Update UI with partial answer
            setThreads(prev => {
              const copy = [...prev];
              const thread = copy[threadIndex];
              if (!thread?.versions[versionIndex]) return prev;

              const versions = [...thread.versions];
              versions[versionIndex] = { ...versions[versionIndex], answer: accumulatedAnswer };

              copy[threadIndex] = { ...thread, versions };
              return copy;
            });
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.error("IncompleteStreamError: Request aborted due to 25s timeout.");
          } else {
            console.error("IncompleteStreamError: Stream interrupted unexpectedly.", err);
          }
        } finally {
          clearTimeout(timeoutId);
          if (!isStreamComplete) {
            const timeoutFlag = controller.signal.aborted ? "Timeout" : "Connection Interrupted";
            console.warn(`Stream terminated without reaching flush. Flagging as partial (${timeoutFlag}).`);
            accumulatedAnswer += `\n\n[[ERROR: [PARTIAL_RESULT - ${timeoutFlag}]]]`;

            // Final UI update with partial flag
            setThreads(prev => {
              const copy = [...prev];
              const thread = copy[threadIndex];
              if (!thread?.versions[versionIndex]) return prev;
              const versions = [...thread.versions];
              versions[versionIndex] = { ...versions[versionIndex], answer: accumulatedAnswer };
              copy[threadIndex] = { ...thread, versions };
              return copy;
            });
          }
        }

        // Trigger disinformation check once final answer is complete
        const evaluationResult = await checkDisinformation(accumulatedAnswer);

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
      } catch (err: any) {
        clearTimeout(timeoutId);
        const errorMessage = err.name === 'AbortError'
          ? "[[ERROR: [REQUEST_TIMEOUT - Connection took too long to establish]]]"
          : `[[ERROR: [CONNECTION_FAILED - ${err.message}]]]`;

        console.error("Fetch level error:", err);

        setThreads(prev => {
          const copy = [...prev];
          const thread = copy[threadIndex];
          if (!thread?.versions[versionIndex]) return prev;
          const versions = [...thread.versions];
          versions[versionIndex] = { ...versions[versionIndex], answer: errorMessage };
          copy[threadIndex] = { ...thread, versions };
          return copy;
        });

        if (err.name !== 'AbortError') {
          // throw err; // Don't throw for generic connection failures to keep UI stable
        }
      }
    },
    [uploadedFiles]
  );

  const handlePromptOptimize = useCallback(async (prompt: string, ...args: string[]) => {
    if (!prompt.trim()) return;
    setWaitingForOptimization(true);
    setPreviousPrompt(prompt);
    try {
      const [specificity, style, context, bias] = args;
      const paramMap: Record<string, string> = { specificity, style, context, bias };

      const beKeyword = pageLanguage === 'es' ? 'sea' : 'be';
      const haveKeyword = pageLanguage === 'es' ? 'tenga' : 'have';
      const andKeyword = pageLanguage === 'es' ? 'y' : 'and';

      const entries = Object.entries(paramMap)
        .filter(([_, value]) => value !== NO_CHANGE_VALUE && value !== "")
        .map(([name, value]) => {
          const prefix = (name === "specificity" || name === "style") ? beKeyword : haveKeyword;
          return `${prefix} ${value.toLowerCase()}`;
        });

      const params = entries.length > 1
        ? `${entries.slice(0, -1).join(", ")} ${andKeyword} ${entries[entries.length - 1]}`
        : entries[0] || "";

      const userPromptTemplate = t('promptPlayground.optimization.userPrompt');
      const optimizeUserPrompt = userPromptTemplate
        .replace('{params}', params)
        .replace('{prompt}', prompt);

      const response = await fetch(NETLIFY_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.1-8B-Instruct:ovhcloud",
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: t('promptPlayground.optimization.systemPrompt')
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

  const handleUploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const pdfs = fileList.filter(f => f.type === 'application/pdf');

    if (pdfs.length === 0) return;

    const { extractTextFromPDF } = await import('@/lib/pdfParser');

    console.log(`Starting upload/parse for ${pdfs.length} PDF(s)`);
    let cumulativeNewSize = 0;

    for (const file of pdfs) {
      console.log(`Parsing file: ${file.name}`);
      setUploadedFiles(prev => [...prev, { name: file.name, content: '', size: 0, isUploading: true }]);

      try {
        const text = await extractTextFromPDF(file);
        console.log(`Successfully parsed ${file.name}, extracted ${text.length} characters.`);

        const countWords = (str: string) => str.trim().split(/\s+/).filter(Boolean).length;
        const newFileWordCount = countWords(text);
        console.log(`Word count for "${file.name}": ${newFileWordCount} words.`);
        const currentTotalWords = uploadedFiles.reduce((acc, f) => acc + countWords(f.content), 0);

        if (currentTotalWords + cumulativeNewSize + newFileWordCount > CONTEXT_WINDOW_LIMIT_WORDS) {
          alert(`File "${file.name}" exceeds the ${CONTEXT_WINDOW_LIMIT_WORDS} word context window limit.`);
          setUploadedFiles(prev => prev.filter(f => f.name !== file.name || f.isUploading !== true));
          continue;
        }

        cumulativeNewSize += newFileWordCount;

        setUploadedFiles(prev => prev.map(f =>
          (f.name === file.name && f.isUploading)
            ? { name: file.name, content: text, size: text.length, isUploading: false }
            : f
        ));
      } catch (err) {
        console.error(`Failed to parse PDF ${file.name}:`, err);
        setUploadedFiles(prev => prev.filter(f => f.name !== file.name || f.isUploading !== true));
      }
    }
  }, [uploadedFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

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
    <div className="min-h-screen max-h-screen bg-background flex flex-col">
      <Header onLanguageChange={setPageLanguage} />
      <main className="flex-1 flex flex-col">
        <div className="flex flex-1 h-[calc(100vh-4rem)]">
          <div className="w-80 flex-shrink-0 bg-surface-200 2xl:bg-transparent 2xl:pb-4 flex items-start justify-center">
            <div className="w-[264px] pt-6 pb-4 2xl:pt-0 2xl:pb-0 2xl:bg-card 2xl:border 2xl:border-border 2xl:rounded-lg 2xl:shadow-sm 2xl:overflow-hidden 2xl:w-72">
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
                files: uploadedFiles,
                onUploadFiles: handleUploadFiles,
                onRemoveFile: handleRemoveFile
              }} />
            </div>
          </div>
          <div className="flex-1 px-6 py-4 overflow-auto">
            <ChatBody
              threads={threads}
              onPrevVersion={handlePrevVersion}
              onNextVersion={handleNextVersion}
              onToggleThreadDiff={handleThreadDiffToggle}
              onToggleThreadEvaluation={handleThreadEvaluationToggle}
              onRequestControlPanelHelp={() => setShowControlPanelPopover(true)}
            />
          </div>
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
    </div>
  );
};

export default PromptPlayground;