// src/pages/PromptPlayground.tsx

import Header from "@/components/Header";
import PromptControls from "@/components/PromptControlsPromptPlayground";
import { useState, useEffect, useCallback, useRef } from "react";
import { PopoverSeries } from "@/components/PopoverSeries";
import { useLanguage } from '@/contexts/LanguageContext';
import ChatBody from "@/components/ChatBody";
import { SSEContentParser } from "@/lib/sseStream";
import { runAllEvaluations } from "@/services/evaluations";
import type { EvaluationResult } from "@/services/evaluations/types";
import { runWebSearchRAG } from "@/services/webSearch";
import type { WebSearchResult } from "@/services/webSearch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { apiUrl } from "@/lib/apiBase";
const NO_CHANGE_VALUE = "no-change";
const NETLIFY_CHAT_URL = apiUrl("/api/chat");

export type Parameters = {
  specificity: string;
  style: string;
  context: string;
  bias: string;
};

export type VersionEvaluation = {
  loading: boolean;
  error: boolean;
  data: EvaluationResult | null;
};

export type ThreadVersion = {
  prompt: string;
  answer?: string;
  parameters?: Parameters;
  webSearchSources?: WebSearchResult[];
  searchStatus?: 'idle' | 'searching' | 'streaming' | 'complete' | 'error';
  webSearchEnabled?: boolean;
  fileNames?: string[];
  /** True once the answer stream has finished (both standard and web-search flows). */
  streamComplete?: boolean;
};
export type Thread = {
  versions: ThreadVersion[];
  currentIndex: number;
  /** @deprecated archived in favor of showCompare; retained for rollback */
  showDiff?: boolean;
  showEvaluation?: boolean;
  evaluations?: VersionEvaluation[];
  showCompare?: boolean;
  comparedVersionIndex?: number;
};

export type ParsedFile = {
  name: string;
  content: string;         // active content used by consumers (raw or summary)
  rawContent: string;      // always the full extracted PDF text
  summary?: string;        // map-reduced summary, if summarization was performed
  size: number;
  isUploading?: boolean;
  isSummarized?: boolean;
  originalTokenCount?: number;
  /** PDF metadata title (if present) — gives the LLM a real document title to cite. */
  documentTitle?: string;
};
const PromptPlayground = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [parameters, setParameters] = useState<Parameters>({ specificity: "", style: "", context: "", bias: "" });
  const [optimizePulse, setOptimizePulse] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [editingText, setEditingText] = useState<string>("");
  const [previousPrompt, setPreviousPrompt] = useState<string>("");
  // Dirty flags track whether a given trigger category has been touched since the last send.
  // They determine the button's mode (submit vs optimize) and whether it's enabled.
  const [hasManualEdit, setHasManualEdit] = useState<boolean>(false);
  const [paramChangeDirty, setParamChangeDirty] = useState<boolean>(false);
  const [fileOrSearchDirty, setFileOrSearchDirty] = useState<boolean>(false);
  // Last non-null mode; used to keep the button label stable while it's disabled.
  const [lastButtonMode, setLastButtonMode] = useState<'submit' | 'optimize'>('submit');
  const [fullReset, setFullReset] = useState<boolean>(false);
  const LOCALSTORAGE_POPKEY = "promptPlayground.popoverSeen";
  const [showControlPanelPopover, setShowControlPanelPopover] = useState<boolean>(false);
  const { t } = useLanguage();
  const [waitingforOptimization, setWaitingForOptimization] = useState<boolean>(false);
  const optimizeAbortControllerRef = useRef<AbortController | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<ParsedFile[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  const CONTEXT_WINDOW_LIMIT_TOKENS = 125000;

  // Controls whether map-reduced summaries are used instead of raw PDF text.
  // Both default to false — when both are false, summarization is skipped entirely.
  const [useSummaryForOptimization, setUseSummaryForOptimization] = useState<boolean>(false);
  const [useSummaryForOutput, setUseSummaryForOutput] = useState<boolean>(false);

  /** Resolve the content to use for a file given a useSummary flag. */
  const getFileContent = (file: ParsedFile, useSummary: boolean): string => {
    return (useSummary && file.summary) ? file.summary : file.rawContent;
  };

  const [summarizationProgress, setSummarizationProgress] = useState<{
    isActive: boolean;
    fileName: string;
    phase: string;
    current: number;
    total: number;
  }>({ isActive: false, fileName: '', phase: '', current: 0, total: 0 });

  // Optimization cache: key = JSON(prompt + parameters) -> optimized prompt
  const optimizationCacheRef = useRef<Map<string, string>>(new Map());

  const buildCacheKey = (prompt: string, params: Parameters, files?: ParsedFile[]): string => {
    const fileHash = files?.filter(f => !f.isUploading).map(f => f.name + f.size).join('|') || '';
    return JSON.stringify({ prompt: prompt.trim(), ...params, fileHash });
  };

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
        showDiff: checked ? false : next[threadIndex].showDiff,
        showCompare: checked ? false : next[threadIndex].showCompare,
      };
      return next;
    });
  }, []);

  const handleThreadCompareToggle = useCallback((threadIndex: number, comparedIndex?: number) => {
    setThreads(prev => {
      const next = [...prev];
      const thread = next[threadIndex];
      if (!thread) return prev;
      const turningOn = !thread.showCompare;
      next[threadIndex] = {
        ...thread,
        showCompare: turningOn,
        comparedVersionIndex: turningOn ? comparedIndex : thread.comparedVersionIndex,
        showEvaluation: turningOn ? false : thread.showEvaluation,
        showDiff: turningOn ? false : thread.showDiff,
      };
      return next;
    });
  }, []);

  const handleThreadCompareBaseChange = useCallback((threadIndex: number, comparedIndex: number) => {
    setThreads(prev => {
      const next = [...prev];
      const thread = next[threadIndex];
      if (!thread) return prev;
      next[threadIndex] = {
        ...thread,
        showCompare: true,
        comparedVersionIndex: comparedIndex,
        showEvaluation: false,
        showDiff: false,
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
    setParameters(prev => {
      const next = { ...prev, [paramKey]: value };
      setParamChangeDirty(Object.values(next).some(p => p !== ""));
      return next;
    });
  };

  const handleReset = () => {
    setFullReset(true);
    setParameters({ specificity: "", style: "", context: "", bias: "" });
    setParamChangeDirty(false);
  };

  // Derive the currently-active trigger category, with precedence:
  // manual edit > param change > file/web-search change.
  // When no trigger is active, the button is disabled but keeps the last mode's label.
  const activeMode: 'submit' | 'optimize' | null = hasManualEdit
    ? 'submit'
    : paramChangeDirty
      ? 'optimize'
      : fileOrSearchDirty
        ? 'submit'
        : null;
  const buttonMode: 'submit' | 'optimize' = activeMode ?? lastButtonMode;
  const promptHasText = !!editingText.trim();
  const sendButtonDisabled = !activeMode || !promptHasText || waitingforOptimization;

  useEffect(() => {
    if (activeMode) setLastButtonMode(activeMode);
  }, [activeMode]);



  const submitAnswerForThreadVersion = useCallback(
    async (threadIndex: number, versionIndex: number, promptText: string) => {

      // ── Web Search RAG branch ──────────────────────────────────────────
      if (webSearchEnabled && uploadedFiles.length === 0) {
        // Initialize the version in the thread
        setThreads(prev => {
          const copy = [...prev];
          const thread = copy[threadIndex];
          if (!thread?.versions[versionIndex]) return prev;
          const versions = [...thread.versions];
          versions[versionIndex] = { ...versions[versionIndex], answer: "", searchStatus: "searching", webSearchSources: [] };
          const evaluations = [...(thread.evaluations || [])];
          evaluations[versionIndex] = { loading: false, error: false, data: null };
          copy[threadIndex] = { ...thread, versions, evaluations, showEvaluation: false };
          return copy;
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120_000);

        try {
          const { answer, sources } = await runWebSearchRAG(promptText, {
            chatUrl: NETLIFY_CHAT_URL,
            model: "meta-llama/Llama-3.3-70B-Instruct:ovhcloud",
            temperature: 0.3,
            abortSignal: controller.signal,

            onSearchStart: () => {
              setThreads(prev => {
                const copy = [...prev];
                const thread = copy[threadIndex];
                if (!thread?.versions[versionIndex]) return prev;
                const versions = [...thread.versions];
                versions[versionIndex] = { ...versions[versionIndex], searchStatus: "searching" };
                copy[threadIndex] = { ...thread, versions };
                return copy;
              });
            },

            onSearchComplete: (results) => {
              setThreads(prev => {
                const copy = [...prev];
                const thread = copy[threadIndex];
                if (!thread?.versions[versionIndex]) return prev;
                const versions = [...thread.versions];
                versions[versionIndex] = { ...versions[versionIndex], searchStatus: "streaming", webSearchSources: results };
                copy[threadIndex] = { ...thread, versions };
                return copy;
              });
            },

            onSearchError: () => {
              setThreads(prev => {
                const copy = [...prev];
                const thread = copy[threadIndex];
                if (!thread?.versions[versionIndex]) return prev;
                const versions = [...thread.versions];
                versions[versionIndex] = { ...versions[versionIndex], searchStatus: "error" };
                copy[threadIndex] = { ...thread, versions };
                return copy;
              });
            },

            onStreamDelta: (_delta, accumulated) => {
              setThreads(prev => {
                const copy = [...prev];
                const thread = copy[threadIndex];
                if (!thread?.versions[versionIndex]) return prev;
                const versions = [...thread.versions];
                versions[versionIndex] = { ...versions[versionIndex], answer: accumulated };
                copy[threadIndex] = { ...thread, versions };
                return copy;
              });
            },

            onStreamComplete: (fullAnswer) => {
              setThreads(prev => {
                const copy = [...prev];
                const thread = copy[threadIndex];
                if (!thread?.versions[versionIndex]) return prev;
                const versions = [...thread.versions];
                versions[versionIndex] = { ...versions[versionIndex], answer: fullAnswer, searchStatus: "complete", streamComplete: true };
                copy[threadIndex] = { ...thread, versions };
                return copy;
              });
            },

            onStreamError: (err) => {
              console.error("[WebSearchRAG] Stream error in playground:", err);
              setThreads(prev => {
                const copy = [...prev];
                const thread = copy[threadIndex];
                if (!thread?.versions[versionIndex]) return prev;
                const versions = [...thread.versions];
                const current = versions[versionIndex];
                const errorMsg = current.answer
                  ? `${current.answer}\n\n[[ERROR: [STREAM_FAILED - ${err.message}]]]`
                  : `[[ERROR: [CONNECTION_FAILED - ${err.message}]]]`;
                versions[versionIndex] = { ...versions[versionIndex], answer: errorMsg, searchStatus: "complete", streamComplete: true };
                copy[threadIndex] = { ...thread, versions };
                return copy;
              });
            },
          });

          // Run evaluations on the final answer
          if (answer) {
            // Set loading state now that the stream is complete
            setThreads(prev => {
              const copy = [...prev];
              const thread = copy[threadIndex];
              if (!thread?.evaluations) return prev;
              const evaluations = [...thread.evaluations];
              evaluations[versionIndex] = { loading: true, error: false, data: null };
              copy[threadIndex] = { ...thread, evaluations };
              return copy;
            });
            try {
              await runAllEvaluations(answer, (partialResult) => {
                setThreads(prev => {
                  const copy = [...prev];
                  const thread = copy[threadIndex];
                  if (!thread?.evaluations) return prev;
                  const evaluations = [...thread.evaluations];
                  evaluations[versionIndex] = { loading: false, error: false, data: partialResult };
                  copy[threadIndex] = { ...thread, evaluations };
                  return copy;
                });
              });
            } catch (evalErr) {
              console.error("Evaluation failed but answer is visible:", evalErr);
              setThreads(prev => {
                const copy = [...prev];
                const thread = copy[threadIndex];
                if (!thread?.evaluations) return prev;
                const evaluations = [...thread.evaluations];
                evaluations[versionIndex] = { loading: false, error: true, data: null };
                copy[threadIndex] = { ...thread, evaluations };
                return copy;
              });
            }
          }
        } catch (err) {
          console.error("Web search RAG outer error:", err);
          const message = err instanceof Error ? err.message : String(err);
          setThreads(prev => {
            const copy = [...prev];
            const thread = copy[threadIndex];
            if (!thread?.versions[versionIndex]) return prev;
            const versions = [...thread.versions];
            if (!versions[versionIndex].answer || versions[versionIndex].answer!.length < 5) {
              versions[versionIndex] = { ...versions[versionIndex], answer: `[[ERROR: [CONNECTION_FAILED - ${message}]]]`, searchStatus: "error", streamComplete: true };
            } else {
              versions[versionIndex] = { ...versions[versionIndex], streamComplete: true };
            }
            const evaluations = [...(thread.evaluations || [])];
            evaluations[versionIndex] = { loading: false, error: true, data: null };
            copy[threadIndex] = { ...thread, versions, evaluations };
            return copy;
          });
        } finally {
          clearTimeout(timeoutId);
        }
        return;
      }

      // ── Standard / PDF-grounded flow ───────────────────────────────────
      // --- Grounding system prompt (conditional on PDF uploads) ---
      const groundingPrompt = uploadedFiles.length > 0
        ? `You are a document analysis assistant. You have been provided with one or more reference documents. Follow these rules strictly:

1. BASE YOUR ANSWERS ON THE PROVIDED DOCUMENTS. When the user's question relates to topics covered in the documents, your answer must be drawn from the document content. Do not supplement with outside knowledge unless the document is insufficient to answer the question.

2. SEQUENTIAL CITATION NUMBERING (SHARED ACROSS ALL SOURCES). Every distinct source you cite — internal (from the provided documents) or external (from outside knowledge) — gets its own UNIQUE number in a SINGLE shared sequence, in the order each source first appears in your answer. Examples of correct numbering: [1], [2*], [3], [4*]. Examples of INCORRECT numbering: [1], [1*] (an internal and external source must NEVER share the same number); [1], [2], [1] (do not reuse a number for what is later treated as a different source).

3. INTERNAL vs EXTERNAL MARKER. Internal citations have NO suffix: [1], [2]. External citations have an asterisk after the number: [3*], [4*]. The asterisk is the ONLY thing that distinguishes them — they share the same numbering sequence (see rule 2).

4. EVERY IN-LINE CITATION MUST INCLUDE A TITLE. The format is [N, Title] for internal and [N*, Title] for external. The title goes after the comma and before the closing bracket. For internal sources, use the title shown in the document header you were given (e.g. "Annual Report 2024"); if the document header only contains a file name, use that file name as the title. For external sources, use the publication / paper / page name. Examples: [1, Annual Report 2024], [2*, NIH Clinical Guidelines], [3, MyDoc.pdf]. NEVER omit the title.

5. REFERENCES SECTION. If your answer contains any in-line citations, include a numbered "References" section at the end listing every cited source. Each reference should match its in-line number and title exactly. Don't use brackets: start each reference with e.g. "1. Reference", NOT "[1]. Reference".

6. NEVER FABRICATE DOCUMENT CONTENT. If you cannot find specific information in the provided documents, say so. Do not guess or paraphrase loosely — accuracy is more important than completeness.

7. PRESERVE PRECISION. Reproduce names, dates, numbers, and statistics exactly as they appear in the documents. Do not round, approximate, or restate figures unless asked.

8. WHEN IN DOUBT, QUOTE. If uncertain whether your recollection of a document detail is exact, quote the relevant passage directly rather than paraphrasing.`
        : "You are a helpful assistant.";

      // Build documents array — the edge function injects these into the
      // system message as numbered references for the model to cite.
      // We pass the PDF's metadata title (if available) alongside the file name
      // so the model has a citable, human-readable title.
      const documents = uploadedFiles.length > 0
        ? uploadedFiles.map((file, idx) => {
          const useSum = useSummaryForOutput && !!file.summary;
          const text = getFileContent(file, useSummaryForOutput);
          const titleSuffix = useSum
            ? ` [summary of ~${file.originalTokenCount} tokens]`
            : "";
          const baseTitle = file.documentTitle
            ? `${file.documentTitle} (${file.name})`
            : file.name;
          return {
            id: `doc-${idx + 1}`,
            data: { title: `${baseTitle}${titleSuffix}`, text },
          };
        })
        : undefined;

      const payload: Record<string, unknown> = {
        model: "meta-llama/Llama-3.3-70B-Instruct:ovhcloud",
        temperature: uploadedFiles.length > 0 ? 0.3 : 0.7,
        stream: true,
        messages: [
          { role: "system", content: groundingPrompt },
          { role: "user", content: promptText },
        ],
        ...(documents ? { documents } : {}),
      };

      // Payload size verification (6MB limit)
      const payloadSize = new Blob([JSON.stringify(payload)]).size;
      if (payloadSize > 6 * 1024 * 1024) {
        alert(`Payload size (${(payloadSize / 1024 / 1024).toFixed(2)}MB) exceeds the 6MB Netlify limit.`);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("Client-side timeout: Aborting request after 120s.");
        controller.abort();
      }, 120000);

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
        const sseParser = new SSEContentParser();
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
          evaluations[versionIndex] = { loading: false, error: false, data: null };

          copy[threadIndex] = { ...thread, versions, evaluations, showEvaluation: false };
          return copy;
        });

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

        console.info("Stream reading started...");

        const applyDeltas = (deltas: string[]) => {
          if (deltas.length === 0) return;
          accumulatedAnswer += deltas.join("");
          setThreads(prev => {
            const copy = [...prev];
            const thread = copy[threadIndex];
            if (!thread?.versions[versionIndex]) return prev;
            const versions = [...thread.versions];
            versions[versionIndex] = { ...versions[versionIndex], answer: accumulatedAnswer };
            copy[threadIndex] = { ...thread, versions };
            return copy;
          });
        };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              applyDeltas(sseParser.flush());
              break;
            }
            const text = decoder.decode(value, { stream: true });
            applyDeltas(sseParser.feed(text));
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            const timeoutMsg = `\n\n[[ERROR: [TIMEOUT - Generator stopped after 120s]]]`;
            accumulatedAnswer += timeoutMsg;
            console.error("Stream aborted due to 120s timeout.");
          } else {
            console.error("Stream interrupted unexpectedly.", err);
          }
        } finally {
          clearTimeout(timeoutId);
          // If the stream was interrupted OR it never received content, show an error
          if (!isStreamComplete || !accumulatedAnswer) {
            const timeoutFlag = controller.signal.aborted ? "Timeout" : "Connection Interrupted";
            const emptyFlag = !accumulatedAnswer ? "Empty Response / API Error" : null;
            const finalFlag = emptyFlag || timeoutFlag;

            const errorMarker = `\n\n[[ERROR: [PARTIAL_RESULT - ${finalFlag}]]]`;

            if (!accumulatedAnswer.includes("[ERROR:")) {
              accumulatedAnswer += errorMarker;
            }

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

        // Trigger all evaluation pipelines with progressive updates.
        // Phase 1 (fallacy + claim_match) enables the toggle immediately.
        // Phase 2 (web_search) streams in results as they arrive.
        // Set loading state now that the stream is complete
        setThreads(prev => {
          const copy = [...prev];
          const thread = copy[threadIndex];
          if (!thread?.evaluations) return prev;
          const evaluations = [...thread.evaluations];
          evaluations[versionIndex] = { loading: true, error: false, data: null };
          const versions = [...thread.versions];
          if (versions[versionIndex]) {
            versions[versionIndex] = { ...versions[versionIndex], streamComplete: true };
          }
          copy[threadIndex] = { ...thread, evaluations, versions };
          return copy;
        });
        try {
          await runAllEvaluations(accumulatedAnswer, (partialResult) => {
            setThreads(prev => {
              const copy = [...prev];
              const thread = copy[threadIndex];
              if (!thread?.evaluations) return prev;
              const evaluations = [...thread.evaluations];
              evaluations[versionIndex] = {
                loading: false,
                error: false,
                data: partialResult,
              };
              copy[threadIndex] = { ...thread, evaluations };
              return copy;
            });
          });
        } catch (evalErr) {
          console.error("Evaluation failed but answer is visible:", evalErr);
          setThreads(prev => {
            const copy = [...prev];
            const thread = copy[threadIndex];
            if (!thread?.evaluations) return prev;
            const evaluations = [...thread.evaluations];
            evaluations[versionIndex] = { loading: false, error: true, data: null };
            copy[threadIndex] = { ...thread, evaluations };
            return copy;
          });
        }

      } catch (err) {
        clearTimeout(timeoutId);
        const isAbort = err instanceof Error && err.name === 'AbortError';
        const message = err instanceof Error ? err.message : String(err);
        const errorMessage = isAbort
          ? "[[ERROR: [REQUEST_TIMEOUT - Connection took too long to establish]]]"
          : `[[ERROR: [CONNECTION_FAILED - ${message}]]]`;

        console.error("Outer catch error:", err);

        setThreads(prev => {
          const copy = [...prev];
          const thread = copy[threadIndex];
          if (!thread?.versions[versionIndex]) return prev;

          const versions = [...thread.versions];
          if (!versions[versionIndex].answer || versions[versionIndex].answer.length < 5) {
            versions[versionIndex] = { ...versions[versionIndex], answer: errorMessage, streamComplete: true };
          } else {
            versions[versionIndex] = { ...versions[versionIndex], streamComplete: true };
          }

          const evaluations = [...(thread.evaluations || [])];
          evaluations[versionIndex] = { loading: false, error: true, data: null };

          copy[threadIndex] = { ...thread, versions, evaluations };
          return copy;
        });
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [uploadedFiles, useSummaryForOutput, webSearchEnabled]
  );

  const handlePromptOptimize = useCallback(async (prompt: string, specificity: string, style: string, context: string, bias: string) => {
    if (!prompt.trim()) return;

    // Abort previous optimization request to free up concurrent slots
    if (optimizeAbortControllerRef.current) {
      optimizeAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    optimizeAbortControllerRef.current = controller;

    setWaitingForOptimization(true);
    setPreviousPrompt(prompt);
    try {
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

      // Append document context so the optimizer can incorporate uploaded content
      const documentContext = uploadedFiles
        .filter(f => !f.isUploading && f.rawContent)
        .map(f => `[Document: ${f.name}]\n${getFileContent(f, useSummaryForOptimization)}`)
        .join('\n\n');
      const fullOptimizePrompt = documentContext
        ? `${optimizeUserPrompt}\n\nThe user has provided the following document(s) for reference. Consider this content when rewriting the prompt:\n\n${documentContext}`
        : optimizeUserPrompt;

      const response = await fetch(NETLIFY_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b:ovhcloud",
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: t('promptPlayground.optimization.systemPrompt')
            },
            { role: "user", content: fullOptimizePrompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`optimize request failed: ${response.status} - ${errorText}`);
      }

      const hfResult = await response.json();
      const rawOptimizedPrompt = hfResult.choices[0].message.content || "";
      const optimizedPrompt = rawOptimizedPrompt.trim().replace(/^["'](.+)["']$/, '$1');

      if (optimizedPrompt) {
        // Cache the result
        const cacheKey = buildCacheKey(prompt, { specificity, style, context, bias }, uploadedFiles);
        optimizationCacheRef.current.set(cacheKey, optimizedPrompt);

        setEditingText(optimizedPrompt);
        setHasManualEdit(false);
        setOptimizePulse(prev => prev + 1);
      } else {
        throw new Error("handlePromptOptimize: optimized_prompt missing or empty");
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log("Optimization request aborted (likely newer request started).");
        return;
      }
      console.error("handlePromptOptimize failed:", err);
    } finally {
      // Only clear waiting state if this was the latest request
      if (optimizeAbortControllerRef.current === controller) {
        setWaitingForOptimization(false);
      }
    }
  }, [pageLanguage, uploadedFiles, useSummaryForOptimization]);

  const handleUploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const pdfs = fileList.filter(f => f.type === 'application/pdf');

    if (pdfs.length === 0) return;

    // Web search and PDF attachments are mutually exclusive — turn web search off
    // if it happened to be enabled when a PDF arrives.
    setWebSearchEnabled(false);

    const { extractTextFromPDF } = await import('@/lib/pdfParser');

    console.log(`Starting upload/parse for ${pdfs.length} PDF(s)`);
    let cumulativeNewTokens = 0;

    for (const file of pdfs) {
      console.log(`Parsing file: ${file.name}`);
      setUploadedFiles(prev => [...prev, { name: file.name, content: '', rawContent: '', size: 0, isUploading: true }]);

      try {
        const { text, title: pdfTitle } = await extractTextFromPDF(file);
        console.log(`Successfully parsed ${file.name}, extracted ${text.length} characters${pdfTitle ? `; PDF title: "${pdfTitle}"` : ''}.`);

        const rawTokens = Math.ceil(text.length / 3.5);
        console.log(`Estimated tokens for "${file.name}": ${rawTokens} (Chars: ${text.length}).`);

        // Only run map-reduce summarization if at least one summary flag is enabled
        const needsSummarization = (useSummaryForOptimization || useSummaryForOutput);
        let summaryText: string | undefined;
        let isSummarized = false;
        const SHORT_DOC_TOKEN_THRESHOLD = 6000;

        if (needsSummarization && rawTokens > SHORT_DOC_TOKEN_THRESHOLD) {
          console.log(`[pdfSummarizer] Document "${file.name}" has ${rawTokens} tokens — starting summarization...`);
          setSummarizationProgress({ isActive: true, fileName: file.name, phase: 'starting', current: 0, total: 0 });
          try {
            const { summarizeDocument } = await import('@/lib/pdfSummarizer');
            const result = await summarizeDocument(text, NETLIFY_CHAT_URL, (phase, current, total) => {
              console.log(`[pdfSummarizer] ${file.name}: ${phase} ${current}/${total}`);
              setSummarizationProgress({ isActive: true, fileName: file.name, phase, current, total });
            });
            summaryText = result.summary;
            isSummarized = true;
            console.log(`[pdfSummarizer] Summarized "${file.name}": ${result.originalTokenCount} → ${result.summaryTokenCount} tokens`);
          } catch (sumErr) {
            console.warn(`[pdfSummarizer] Summarization failed for "${file.name}", using raw text:`, sumErr);
          } finally {
            setSummarizationProgress({ isActive: false, fileName: '', phase: '', current: 0, total: 0 });
          }
        }

        // content = whichever is active right now; rawContent always stores the full text
        const activeContent = (isSummarized && summaryText) ? summaryText : text;
        const newFileTokens = Math.ceil(activeContent.length / 3.5);
        const currentFilesTokens = uploadedFiles
          .filter(f => !f.isUploading)
          .reduce((acc, f) => acc + Math.ceil(f.content.length / 3.5), 0);

        const totalBatchTokensProcessed = cumulativeNewTokens + newFileTokens;

        if (currentFilesTokens + totalBatchTokensProcessed > CONTEXT_WINDOW_LIMIT_TOKENS) {
          alert(`File "${file.name}" exceeds the ${CONTEXT_WINDOW_LIMIT_TOKENS} token context window limit.`);
          setUploadedFiles(prev => prev.filter(f => f.name !== file.name || f.isUploading !== true));
          continue;
        }

        cumulativeNewTokens += newFileTokens;

        setUploadedFiles(prev => prev.map(f =>
          (f.name === file.name && f.isUploading)
            ? {
              name: file.name,
              content: activeContent,
              rawContent: text,
              summary: summaryText,
              size: activeContent.length,
              isUploading: false,
              isSummarized,
              originalTokenCount: isSummarized ? rawTokens : undefined,
              documentTitle: pdfTitle,
            }
            : f
        ));

        setFileOrSearchDirty(true);

      } catch (err) {
        console.error(`Failed to parse PDF ${file.name}:`, err);
        setUploadedFiles(prev => prev.filter(f => f.name !== file.name || f.isUploading !== true));
      }
    }
  }, [uploadedFiles, useSummaryForOptimization, useSummaryForOutput]);

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFileOrSearchDirty(true);
  }, []);

  // Hold the latest handlePromptOptimize in a ref so the parameters-driven
  // optimization effect only fires on actual parameter changes — not when the
  // callback's identity changes (e.g. on file upload, which updates its deps).
  const handlePromptOptimizeRef = useRef(handlePromptOptimize);
  useEffect(() => {
    handlePromptOptimizeRef.current = handlePromptOptimize;
  }, [handlePromptOptimize]);

  useEffect(() => {
    if (!currentPrompt.trim() && !editingText.trim()) return;
    if (Object.values(parameters).every(p => p === "")) {
      if (!fullReset) {
        setEditingText(currentPrompt);
        setOptimizePulse(prev => prev + 1);
      }
      setFullReset(false);
      return;
    }
    if (Object.values(parameters).some(p => p !== "")) {
      const promptToOptimize = currentPrompt.trim() ? currentPrompt : editingText;
      if (promptToOptimize) {
        // Check cache first
        const cacheKey = buildCacheKey(promptToOptimize, parameters, uploadedFiles);
        const cached = optimizationCacheRef.current.get(cacheKey);
        if (cached) {
          setEditingText(cached);
          setOptimizePulse(prev => prev + 1);
          return;
        }
        handlePromptOptimizeRef.current(promptToOptimize, parameters.specificity, parameters.style, parameters.context, parameters.bias);
      }
    }
    // Intentionally fires only on `parameters` changes. currentPrompt /
    // editingText / uploadedFiles / fullReset are read from latest state but
    // adding them would re-run optimization on every keystroke or file change.
    // The handlePromptOptimize callback is held via ref above for the same reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameters]);

  const handleUndo = () => {
    if (!previousPrompt) return;
    setCurrentPrompt(previousPrompt);
    setEditingText(previousPrompt);
    setPreviousPrompt("");
  };

  const createNewThreadAndFetch = async (submittedText: string) => {
    const newThreadIndex = threads.length;
    const currentFileNames = uploadedFiles.filter(f => !f.isUploading).map(f => f.name);
    setThreads(prev => [...prev, { versions: [{ prompt: submittedText, webSearchEnabled, fileNames: currentFileNames }], currentIndex: 0, showDiff: false }]);
    await submitAnswerForThreadVersion(newThreadIndex, 0, submittedText);
  };

  const submitAnswerForLatestVersion = async (promptText: string) => {
    if (threads.length === 0) return;
    const threadIndex = threads.length - 1;
    const lastVersion = threads[threadIndex].versions[threads[threadIndex].versions.length - 1];
    const currentFileNames = uploadedFiles.filter(f => !f.isUploading).map(f => f.name);
    const lastFileNames = lastVersion?.fileNames || [];
    const contextChanged =
      promptText !== lastVersion?.prompt ||
      webSearchEnabled !== (lastVersion?.webSearchEnabled ?? false) ||
      JSON.stringify(currentFileNames) !== JSON.stringify(lastFileNames);
    if (contextChanged) {
      const newVersionIndex = threads[threadIndex].versions.length;
      setThreads(prev => {
        const copy = [...prev];
        const targetThread = copy[threadIndex];
        if (!targetThread) {
          return prev;
        }
        copy[threadIndex] = {
          ...targetThread,
          versions: [...targetThread.versions, { prompt: promptText, answer: undefined, parameters, webSearchEnabled, fileNames: currentFileNames }],
          currentIndex: newVersionIndex,
        };
        return copy;
      });
      await submitAnswerForThreadVersion(threadIndex, newVersionIndex, promptText);
    }
  };

  // Branch between new-thread and new-version based on whether the user manually
  // edited the prompt since the last send — manual edit always starts a new thread.
  // `isSubmitMode` updates currentPrompt (the user's typed baseline); optimize mode
  // preserves it so undo/restore still reference the original prompt.
  const handleSubmit = async (submittedText: string, isSubmitMode: boolean) => {
    if (!submittedText.trim()) return;
    if (isSubmitMode) {
      setCurrentPrompt(submittedText);
    }
    const wasManualEdit = hasManualEdit;
    setHasManualEdit(false);
    setParamChangeDirty(false);
    setFileOrSearchDirty(false);
    if (threads.length === 0 || wasManualEdit) {
      await createNewThreadAndFetch(submittedText);
    } else {
      await submitAnswerForLatestVersion(submittedText);
    }
  };

  // Unified action for the primary button. Accepts an optional arg so it matches
  // the Chatbox onSubmit signature (ignored — we use editingText state).
  const handlePrimaryAction = (_submittedText?: string) => {
    if (sendButtonDisabled) return;
    if (!editingText.trim()) return;
    void handleSubmit(editingText, buttonMode === 'submit');
  };

  const handleRegenerate = useCallback(() => {
    const promptToOptimize = currentPrompt.trim() ? currentPrompt : editingText;
    if (!promptToOptimize?.trim()) return;
    if (Object.values(parameters).every(p => p === "")) return;
    // Delete the cached entry so a fresh optimization is forced
    const cacheKey = buildCacheKey(promptToOptimize, parameters, uploadedFiles);
    optimizationCacheRef.current.delete(cacheKey);
    handlePromptOptimize(promptToOptimize, parameters.specificity, parameters.style, parameters.context, parameters.bias);
  }, [currentPrompt, editingText, parameters, handlePromptOptimize]);

  // Show regenerate button when there's an active optimization result for the current parameter set
  const showRegenerate = paramChangeDirty && !waitingforOptimization && Object.values(parameters).some(p => p !== "");
  const handleInputChange = (input: string) => {
    setHasManualEdit(true);
    handleReset();
    setEditingText(input);
    setCurrentPrompt(input);
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
    <div className="h-[100dvh] overflow-hidden bg-background flex flex-col">
      <Header onLanguageChange={setPageLanguage} />
      <main className="flex-1 min-h-0 flex flex-col">
        <div className="flex flex-1 min-h-0 max-w-[clamp(600px,95vw,1800px)] mx-auto w-full gap-[clamp(0px,1vw,1rem)]">
          <aside className="w-[clamp(16rem,22vw,20rem)] flex-shrink-0 bg-surface-200 2xl:bg-transparent flex items-stretch justify-center overflow-hidden 2xl:py-[clamp(0.5rem,1vh,1rem)]">
            <div className="w-[264px] 2xl:bg-card 2xl:border 2xl:border-border 2xl:rounded-lg 2xl:shadow-sm 2xl:overflow-hidden 2xl:w-72 flex flex-col min-h-0 flex-1">
              <PromptControls {...{
                parameters,
                onParameterChange: handleParameterChange,
                onReset: handleReset,
                onOptimize: handlePrimaryAction,
                buttonMode,
                onRegenerate: handleRegenerate,
                showRegenerate,
                onUndo: handleUndo,
                chatValue: editingText,
                onChatChange: handleInputChange,
                onChatSubmit: handlePrimaryAction,
                chatSubmitButtonId: "prompt-playground-submit",
                disableSend: sendButtonDisabled,
                disableOptimize: sendButtonDisabled,
                enableBias: promptHasText,
                enableSpecificity: promptHasText,
                enableContext: promptHasText,
                enableStyle: promptHasText,
                chatAnimationKey: optimizePulse,
                waitingforOptimization,
                files: uploadedFiles,
                onUploadFiles: handleUploadFiles,
                onRemoveFile: handleRemoveFile,
                webSearchEnabled,
                onToggleWebSearch: () => {
                  setWebSearchEnabled(prev => !prev);
                  setFileOrSearchDirty(true);
                },
              }} />
            </div>
          </aside>
          <div className="flex-1 min-w-0 min-h-0 px-[clamp(0.75rem,1vw,1.5rem)] py-[clamp(0.5rem,1.5vh,1rem)] flex flex-col overflow-hidden">
            <ChatBody
              threads={threads}
              uploadedFiles={uploadedFiles}
              onPrevVersion={handlePrevVersion}
              onNextVersion={handleNextVersion}
              onToggleThreadDiff={handleThreadDiffToggle}
              onToggleThreadEvaluation={handleThreadEvaluationToggle}
              onToggleThreadCompare={handleThreadCompareToggle}
              onChangeThreadCompareBase={handleThreadCompareBaseChange}
              onRequestControlPanelHelp={() => setShowControlPanelPopover(true)}
            />
          </div>
        </div>
      </main>
      {summarizationProgress.isActive && (
        <Dialog open={true}>
          <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{t('promptPlayground.summarization.inProgress')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Large documents are summarized before use. This may take a moment.
              </p>
              <p className="text-sm font-medium truncate">
                {summarizationProgress.fileName}
              </p>
              <div className="space-y-2">
                <Progress
                  value={
                    summarizationProgress.phase === 'map' && summarizationProgress.total > 0
                      ? (summarizationProgress.current / summarizationProgress.total) * 80
                      : summarizationProgress.phase === 'reduce'
                        ? 90
                        : summarizationProgress.phase === 'summarize'
                          ? 50
                          : 5
                  }
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {summarizationProgress.phase === 'map'
                    ? `Analyzing section ${summarizationProgress.current} of ${summarizationProgress.total}...`
                    : summarizationProgress.phase === 'reduce'
                      ? 'Combining summaries...'
                      : summarizationProgress.phase === 'summarize'
                        ? 'Summarizing document...'
                        : 'Preparing...'}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
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