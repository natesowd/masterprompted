// src/pages/PromptPlaygroundV2.tsx

import Header from "@/components/Header";
import PromptControls from "@/components/PromptControlsPromptPlaygroundV2";
import { useState, useEffect, useCallback, useRef } from "react";
import { PopoverSeries } from "@/components/PopoverSeries";
import { useLanguage } from '@/contexts/LanguageContext';
import ChatBody from "@/components/ChatBodyV2";
import { SSEContentParser } from "@/lib/sseStream";
import { runAllEvaluations } from "@/services/evaluations";
import type { EvaluationResult } from "@/services/evaluations/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Chatbox from "@/components/ChatBoxPromptPlaygroundV2";
const NO_CHANGE_VALUE = "no-change";
// const NETLIFY_CHAT_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
//   ? "/api/chat"
//   : "https://luxury-blini-3336bb.netlify.app/api/chat";
// const NETLIFY_CHAT_URL = "https://luxury-blini-3336bb.netlify.app/api/chat";
const NETLIFY_CHAT_URL = "https://69d76b0a4a68e272bd584118--luxury-blini-3336bb.netlify.app/api/chat"

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
  content: string;         // active content used by consumers (raw or summary)
  rawContent: string;      // always the full extracted PDF text
  summary?: string;        // map-reduced summary, if summarization was performed
  size: number;
  isUploading?: boolean;
  isSummarized?: boolean;
  originalTokenCount?: number;
};
const PromptPlaygroundV2 = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [parameters, setParameters] = useState<Parameters>({ specificity: "", style: "", context: "", bias: "" });
  const [disableSend, setDisableSend] = useState(true);
  const [disableOptimize, setDisableOptimize] = useState(true);
  const [optimizePulse, setOptimizePulse] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [editingText, setEditingText] = useState<string>("");
  const [previousPrompt, setPreviousPrompt] = useState<string>("");
  const [hasManualEdit, setHasManualEdit] = useState<boolean>(false);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [enableBias, setEnableBias] = useState<boolean>(false);
  const [enableSpecificity, setEnableSpecificity] = useState<boolean>(false);
  const [enableStyle, setEnableStyle] = useState<boolean>(false);
  const [enableContext, setEnableContext] = useState<boolean>(false);
  const [fullReset, setFullReset] = useState<boolean>(false);
  const LOCALSTORAGE_POPKEY = "promptPlayground.popoverSeen";
  const [showControlPanelPopover, setShowControlPanelPopover] = useState<boolean>(false);
  const { t } = useLanguage();
  const [waitingforOptimization, setWaitingForOptimization] = useState<boolean>(false);
  const optimizeAbortControllerRef = useRef<AbortController | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<ParsedFile[]>([]);
  const CONTEXT_WINDOW_LIMIT_TOKENS = 125000;

  // Controls whether map-reduced summaries are used instead of raw PDF text.
  // Both default to false — when both are false, summarization is skipped entirely.
  const [useSummaryForOptimization, setUseSummaryForOptimization] = useState<boolean>(false);
  const [useSummaryForOutput, setUseSummaryForOutput] = useState<boolean>(false);

  /* ------------------------------------------------------------------ */
  /*  Learning mode state                                                */
  /* ------------------------------------------------------------------ */
  // User / System tab
  const [controlTab, setControlTab] = useState<"user" | "system">("user");

  // System-tab state
  const TEMPERATURE_STEPS = [0.0, 0.2, 0.5, 0.8, 1.0];
  const [tempStepIndex, setTempStepIndex] = useState(3); // default 0.8

  // Inject a context block into the system prompt with a colored tag
  const injectContextBlock = (type: "instruction" | "knowledge" | "persona") => {
    const templates: Record<string, string> = {
      instruction: "[INSTRUCTION]\nSummarize the key points, cite all sources, and use a neutral journalistic tone.\n[/INSTRUCTION]",
      knowledge: "[KNOWLEDGE]\nPaste your reference text, data, or article content here.\n[/KNOWLEDGE]",
      persona: "[PERSONA]\nYou are an experienced investigative journalist at DW.\n[/PERSONA]",
    };
    const block = templates[type];
    setSysPromptText((prev) => prev ? `${prev}\n\n${block}` : block);
  };

  // System prompt
  const [sysPromptText, setSysPromptText] = useState("");

  // Multiple Sources / Context Engineering mode
  type ContextBlock = {
    id: string;
    type: "instruction" | "knowledge" | "persona";
    label: string;
    content: string;
    enabled: boolean;
  };
  const [contextBlocks, setContextBlocks] = useState<ContextBlock[]>([
    { id: "ctx-1", type: "instruction", label: "Task instruction", content: "", enabled: true },
  ]);
  const addContextBlock = (type: ContextBlock["type"]) => {
    const labels: Record<ContextBlock["type"], string> = {
      instruction: "Task instruction",
      knowledge: "Knowledge source",
      persona: "Persona / role",
    };
    setContextBlocks((prev) => [
      ...prev,
      { id: `ctx-${Date.now()}`, type, label: labels[type], content: "", enabled: true },
    ]);
  };
  const removeContextBlock = (id: string) => setContextBlocks((prev) => prev.filter((b) => b.id !== id));
  const updateContextBlock = (id: string, field: keyof ContextBlock, value: string | boolean) =>
    setContextBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  type FewShotExample = { input: string; output: string };
  const [fewShotExamples, setFewShotExamples] = useState<FewShotExample[]>([{ input: "", output: "" }]);

  const addFewShotExample = () => setFewShotExamples((prev) => [...prev, { input: "", output: "" }]);
  const removeFewShotExample = (idx: number) => setFewShotExamples((prev) => prev.filter((_, i) => i !== idx));
  const updateFewShotExample = (idx: number, field: "input" | "output", value: string) =>
    setFewShotExamples((prev) => prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)));

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
      // --- Grounding system prompt (conditional on PDF uploads + learning/unified mode) ---
      // Resolve which features are active based on view mode
      const useSysPrompt = !!sysPromptText.trim();
      const useContextPipeline = contextBlocks.some(b => b.enabled && b.content.trim());
      const useFewShot = fewShotExamples.some(e => e.input.trim());

      let groundingPrompt: string;
      const parts: string[] = [];

      // System prompt
      if (useSysPrompt && sysPromptText.trim()) {
        parts.push(sysPromptText.trim());
      }

      // Context pipeline blocks
      if (useContextPipeline) {
        const enabledBlocks = contextBlocks.filter((b) => b.enabled && b.content.trim());
        for (const b of enabledBlocks) {
          const header = b.type === "persona" ? "ROLE" : b.type === "knowledge" ? "REFERENCE" : "INSTRUCTION";
          parts.push(`[${header}: ${b.label}]\n${b.content.trim()}`);
        }
      }

      if (parts.length > 0) {
        groundingPrompt = parts.join("\n\n");
      } else if (uploadedFiles.length > 0) {
        groundingPrompt = `You are a document analysis assistant. You have been provided with one or more reference documents. Follow these rules strictly:

1. BASE YOUR ANSWERS ON THE PROVIDED DOCUMENTS. When the user's question relates to topics covered in the documents, your answer must be drawn from the document content. Do not supplement with outside knowledge unless the document is insufficient to answer the question.
2. CITE WITH NUMBERED REFERENCES. When referencing specific facts, statistics, names, or claims from a document, place an inline citation immediately after the claim using the format [1], [2], etc., where the number corresponds to the document index. If citing a specific section, use [1, p.X] or [1, Section Y].
3. DISTINGUISH SOURCES. If you must use knowledge beyond the documents (because the documents do not address the question), mark the claim with [External] and briefly note the source if known.
4. NEVER FABRICATE DOCUMENT CONTENT. If you cannot find specific information in the provided documents, say so. Do not guess or paraphrase loosely — accuracy is more important than completeness.
5. PRESERVE PRECISION. Reproduce names, dates, numbers, and statistics exactly as they appear in the documents. Do not round, approximate, or restate figures unless asked.
6. WHEN IN DOUBT, QUOTE. If uncertain whether your recollection of a document detail is exact, quote the relevant passage directly rather than paraphrasing.`;
      } else {
        groundingPrompt = "You are a helpful assistant.";
      }

      // --- Build documents array in Cohere's native format ---
      // The edge function sends this directly to Cohere's `documents` parameter
      // for native citations, and stringifies it into the system prompt for
      // the Qwen fallback path.
      const documents = uploadedFiles.length > 0
        ? uploadedFiles.map((file, idx) => {
            const useSum = useSummaryForOutput && !!file.summary;
            const text = getFileContent(file, useSummaryForOutput);
            const titleSuffix = useSum
              ? ` [summary of ~${file.originalTokenCount} tokens]`
              : "";
            return {
              id: `doc-${idx + 1}`,
              data: { title: `${file.name}${titleSuffix}`, text },
            };
          })
        : undefined;

      // Build messages array — inject few-shot examples when in that mode
      const messages: { role: string; content: string }[] = [
        { role: "system", content: groundingPrompt },
      ];
      if (useFewShot) {
        for (const ex of fewShotExamples) {
          if (ex.input.trim()) {
            messages.push({ role: "user", content: ex.input.trim() });
            if (ex.output.trim()) messages.push({ role: "assistant", content: ex.output.trim() });
          }
        }
      }
      messages.push({ role: "user", content: promptText });

      // Resolve temperature
      const resolvedTemp = TEMPERATURE_STEPS[tempStepIndex];

      const payload: Record<string, unknown> = {
        model: "command-r-08-2024",
        provider: "cohere",
        temperature: resolvedTemp,
        stream: true,
        messages,
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
          evaluations[versionIndex] = { loading: true, error: false, data: null };

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
        } catch (err: any) {
          if (err.name === 'AbortError') {
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

      } catch (err: any) {
        clearTimeout(timeoutId);
        const errorMessage = err.name === 'AbortError'
          ? "[[ERROR: [REQUEST_TIMEOUT - Connection took too long to establish]]]"
          : `[[ERROR: [CONNECTION_FAILED - ${err.message}]]]`;

        console.error("Outer catch error:", err);

        setThreads(prev => {
          const copy = [...prev];
          const thread = copy[threadIndex];
          if (!thread?.versions[versionIndex]) return prev;

          const versions = [...thread.versions];
          if (!versions[versionIndex].answer || versions[versionIndex].answer.length < 5) {
            versions[versionIndex] = { ...versions[versionIndex], answer: errorMessage };
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
    [uploadedFiles, useSummaryForOutput, sysPromptText, tempStepIndex, fewShotExamples, contextBlocks]
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
        setDisableOptimize(false);
        setOptimizePulse(prev => prev + 1);
      } else {
        throw new Error("handlePromptOptimize: optimized_prompt missing or empty");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
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

    const { extractTextFromPDF } = await import('@/lib/pdfParser');

    console.log(`Starting upload/parse for ${pdfs.length} PDF(s)`);
    let cumulativeNewTokens = 0;

    for (const file of pdfs) {
      console.log(`Parsing file: ${file.name}`);
      setUploadedFiles(prev => [...prev, { name: file.name, content: '', rawContent: '', size: 0, isUploading: true }]);

      try {
        const text = await extractTextFromPDF(file);
        console.log(`Successfully parsed ${file.name}, extracted ${text.length} characters.`);

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
            }
            : f
        ));

        setHasManualEdit(true);
        // console.log(isEmpty);
        setDisableSend(isEmpty);

      } catch (err) {
        console.error(`Failed to parse PDF ${file.name}:`, err);
        setUploadedFiles(prev => prev.filter(f => f.name !== file.name || f.isUploading !== true));
      }
    }
  }, [uploadedFiles, isEmpty, useSummaryForOptimization, useSummaryForOutput]);

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
      const promptToOptimize = currentPrompt.trim() ? currentPrompt : editingText;
      if (promptToOptimize) {
        // Check cache first
        const cacheKey = buildCacheKey(promptToOptimize, parameters, uploadedFiles);
        const cached = optimizationCacheRef.current.get(cacheKey);
        if (cached) {
          setEditingText(cached);
          setDisableOptimize(false);
          setOptimizePulse(prev => prev + 1);
          return;
        }
        setDisableSend(true);
        handlePromptOptimize(promptToOptimize, parameters.specificity, parameters.style, parameters.context, parameters.bias);
      }
    }
  }, [parameters, handlePromptOptimize]);

  const handleUndo = () => {
    if (!previousPrompt) return;
    setCurrentPrompt(previousPrompt);
    setEditingText(previousPrompt);
    setPreviousPrompt("");
    const empty = !previousPrompt.trim();
    setIsEmpty(empty);
    setDisableSend(empty);
  };

  const createNewThreadAndFetch = async (submittedText: string) => {
    const newThreadIndex = threads.length;
    setThreads(prev => [...prev, { versions: [{ prompt: submittedText }], currentIndex: 0, showDiff: false }]);
    await submitAnswerForThreadVersion(newThreadIndex, 0, submittedText);
  };

  const submitAnswerForLatestVersion = async (promptText: string) => {
    if (threads.length === 0) return;
    const threadIndex = threads.length - 1;
    const lastVersionPrompt = threads[threadIndex].versions[threads[threadIndex].versions.length - 1]?.prompt;
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

  const handleRegenerate = useCallback(() => {
    const promptToOptimize = currentPrompt.trim() ? currentPrompt : editingText;
    if (!promptToOptimize?.trim()) return;
    if (Object.values(parameters).every(p => p === "")) return;
    // Delete the cached entry so a fresh optimization is forced
    const cacheKey = buildCacheKey(promptToOptimize, parameters, uploadedFiles);
    optimizationCacheRef.current.delete(cacheKey);
    setDisableSend(true);
    handlePromptOptimize(promptToOptimize, parameters.specificity, parameters.style, parameters.context, parameters.bias);
  }, [currentPrompt, editingText, parameters, handlePromptOptimize]);

  // Show regenerate button when there's an active optimization result for the current parameter set
  const showRegenerate = !disableOptimize && !waitingforOptimization && Object.values(parameters).some(p => p !== "");
  const handleInputChange = (input: string) => {
    setHasManualEdit(true);
    handleReset();
    setEditingText(input);
    setCurrentPrompt(input);
    const empty = !input.trim();
    setIsEmpty(empty);
    setDisableSend(empty);
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
        <div className="flex flex-1 h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full items-center">
          <div className="w-80 flex-shrink-0 bg-surface-200 2xl:bg-transparent 2xl:pb-4 flex items-start justify-center overflow-y-auto h-full">
            <div className="w-[264px] pt-6 pb-4 2xl:pt-0 2xl:pb-0 2xl:bg-card 2xl:border 2xl:border-border 2xl:rounded-lg 2xl:shadow-sm 2xl:overflow-hidden 2xl:w-72 flex flex-col h-full">

              {/* ── User / System tabs ── */}
              <div className="px-4 pt-3 pb-1 [&_*]:!font-heading">
                <ToggleGroup
                  type="single"
                  value={controlTab}
                  onValueChange={(v) => v && setControlTab(v as "user" | "system")}
                  className="w-full"
                >
                  <ToggleGroupItem value="user" className="flex-1 text-[11px]">
                    User
                  </ToggleGroupItem>
                  <ToggleGroupItem value="system" className="flex-1 text-[11px]">
                    System
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* ============================================ */}
              {/* USER tab                                      */}
              {/* ============================================ */}
              {controlTab === "user" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Chatbox + few-shot */}
                  <div className="px-4 pt-2 pb-2 [&_*]:!font-heading [&_textarea]:!font-['Manrope']">
                    <Chatbox
                      value={editingText}
                      onChange={handleInputChange}
                      onSubmit={handleChatSubmit}
                      submitButtonId="prompt-playground-submit"
                      disableSend={disableSend}
                      animationKey={optimizePulse}
                      waitingforOptimization={waitingforOptimization}
                      files={uploadedFiles}
                      onUploadFiles={handleUploadFiles}
                      onRemoveFile={handleRemoveFile}
                      onAddExample={addFewShotExample}
                      exampleCount={fewShotExamples.filter(e => e.input.trim() || e.output.trim()).length}
                      className="z-50 w-full flex-auto min-h-0"
                    />
                  </div>

                  {/* Few-shot examples */}
                  {fewShotExamples.length > 0 && (
                    <div className="px-4 pb-2 [&_*]:!font-heading [&_textarea]:!font-['Manrope']">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Examples ({fewShotExamples.length})
                      </label>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto">
                        {fewShotExamples.map((ex, idx) => (
                          <div key={idx} className="rounded-lg border border-border p-2 space-y-1.5 relative">
                            <button type="button" onClick={() => removeFewShotExample(idx)} className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground">
                              <X className="h-3 w-3" />
                            </button>
                            <span className="text-[10px] text-muted-foreground font-semibold">Example {idx + 1}</span>
                            <Textarea placeholder="Input..." value={ex.input} onChange={(e) => updateFewShotExample(idx, "input", e.target.value)} className="text-xs min-h-[32px] resize-y !font-['Manrope']" />
                            <Textarea placeholder="Expected output..." value={ex.output} onChange={(e) => updateFewShotExample(idx, "output", e.target.value)} className="text-xs min-h-[32px] resize-y !font-['Manrope']" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompt parameters */}
                  <PromptControls {...{
                    parameters,
                    onParameterChange: handleParameterChange,
                    onReset: handleReset,
                    onOptimize: handleOptimizeSubmit,
                    onRegenerate: handleRegenerate,
                    showRegenerate,
                    onUndo: handleUndo,
                    chatValue: editingText,
                    onChatChange: handleInputChange,
                    onChatSubmit: handleChatSubmit,
                    chatSubmitButtonId: "prompt-playground-submit-2",
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
              )}

              {/* ============================================ */}
              {/* SYSTEM tab                                    */}
              {/* ============================================ */}
              {controlTab === "system" && (
                <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-4 pt-2 gap-3 [&_*]:!font-heading [&_textarea]:!font-['Manrope']">

                  {/* System Prompt */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">System Prompt</label>
                    <Textarea
                      placeholder="You are a helpful journalist assistant..."
                      value={sysPromptText}
                      onChange={(e) => setSysPromptText(e.target.value)}
                      className="text-sm min-h-[100px] resize-y !font-['Manrope']"
                    />
                  </div>

                  {/* Context injection buttons */}
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Add to system prompt
                    </label>
                    <div className="flex gap-1.5">
                      <Button type="button" variant="outline" size="sm" className="flex-1 text-[10px] gap-1 px-1 border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => injectContextBlock("instruction")}>
                        <Plus className="h-3 w-3" /> Instruction
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="flex-1 text-[10px] gap-1 px-1 border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => injectContextBlock("knowledge")}>
                        <Plus className="h-3 w-3" /> Knowledge
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="flex-1 text-[10px] gap-1 px-1 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => injectContextBlock("persona")}>
                        <Plus className="h-3 w-3" /> Persona
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Temperature — guided simulator style */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block">Temperature</label>
                    <div className="relative">
                      <div className="relative h-10 flex items-center">
                        {/* Track background */}
                        <div className="absolute inset-x-0 h-4 rounded bg-surface-600" />
                        {/* Filled range */}
                        <div
                          className="absolute left-0 h-4 rounded-l bg-brand-tertiary-500"
                          style={{ width: `${(tempStepIndex / (TEMPERATURE_STEPS.length - 1)) * 100}%` }}
                        />
                        {/* Thumb */}
                        <div
                          className="absolute h-7 -translate-x-1/2 cursor-pointer flex items-center"
                          style={{ left: `${(tempStepIndex / (TEMPERATURE_STEPS.length - 1)) * 100}%` }}
                        >
                          <div className="h-full w-[4px] bg-background" />
                          <div className="h-full w-1 rounded-sm bg-brand-tertiary-500" />
                          <div className="h-full w-[4px] bg-background" />
                        </div>
                        {/* Invisible slider */}
                        <input
                          type="range"
                          min={0}
                          max={TEMPERATURE_STEPS.length - 1}
                          step={1}
                          value={tempStepIndex}
                          onChange={(e) => setTempStepIndex(Number(e.target.value))}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        />
                      </div>
                      {/* Value label */}
                      <div
                        className="text-xs font-semibold text-foreground mt-1 absolute -translate-x-1/2"
                        style={{ left: `${(tempStepIndex / (TEMPERATURE_STEPS.length - 1)) * 100}%` }}
                      >
                        {TEMPERATURE_STEPS[tempStepIndex].toFixed(1)}
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground pt-5">
                      <span>More Stable</span>
                      <span>More Random</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 px-6 py-4 overflow-auto">
            <ChatBody
              threads={threads}
              uploadedFiles={uploadedFiles}
              onPrevVersion={handlePrevVersion}
              onNextVersion={handleNextVersion}
              onToggleThreadDiff={handleThreadDiffToggle}
              onToggleThreadEvaluation={handleThreadEvaluationToggle}
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

export default PromptPlaygroundV2;