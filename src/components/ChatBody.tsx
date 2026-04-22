import ChatPrompt from "@/components/ChatPrompt";
import ChatAnswer from "@/components/ChatAnswer";
import RemovedTextSidebar from "@/components/RemovedTextSidebar";
import EvaluationPanel from "@/components/EvaluationPanel";
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { CircleQuestionMark, Minus } from "lucide-react";
import { PopoverSeries } from "@/components/PopoverSeries";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Thread, ParsedFile } from "@/pages/PromptPlayground";
import { diffWordsWithNewlineProtection } from "@/lib/diff";
import WebSearchStatus from "@/components/WebSearchStatus";
import WebSearchReferences from "@/components/WebSearchReferences";
import type { WebSearchResult } from "@/services/webSearch/webSearchClient";

// Helper to process citations: renumber and filter sources to match only what appears in text
function processCitations(text: string, sources?: WebSearchResult[]) {
  if (!text || !sources || sources.length === 0) return { enriched: text, activeSources: sources || [] };
  
  let enriched = text;
  const activeSources: WebSearchResult[] = [];
  const sourceMap = new Map(sources.map(s => [s.position, s]));
  
  // Match any digits that appear inside square brackets.
  // This correctly isolates '1', '2', '3', '6' from strings like "[1, 2, 3, 6]" or "[1][2]".
  const matches = Array.from(text.matchAll(/\[(.*?)\]/g));
  const usedPositions = new Set<number>();
  
  for (const match of matches) {
    const bracketContent = match[1];
    // Skip if it's already an enriched format
    if (bracketContent.includes('|||')) continue;
    
    // Find all numbers within this bracket
    const numbers = bracketContent.match(/\d+/g);
    if (numbers) {
      for (const numStr of numbers) {
        const num = parseInt(numStr, 10);
        if (sourceMap.has(num)) usedPositions.add(num);
      }
    }
  }

  // If we didn't find any valid citations, return the original data untouched
  if (usedPositions.size === 0) {
    return { enriched: text, activeSources: sources };
  }

  const usedArray = Array.from(usedPositions).sort((a, b) => a - b);
  const remapping = new Map<number, number>();
  
  usedArray.forEach((oldNum, idx) => {
    const newNum = idx + 1;
    remapping.set(oldNum, newNum);
    const s = sourceMap.get(oldNum)!;
    activeSources.push({ ...s, position: newNum });
  });

  // We need to carefully replace the old numbers with the new numbers inside the brackets.
  // Using a replacer function ensures we only rewrite the exact valid citations.
  // Importantly, if we find `[1, 2]`, we need to expand it into `[1|||...][2|||...]`
  // so that RichText properly maps each to an individual button.
  enriched = enriched.replace(/\[((?:\d+(?:,\s*)?)+)\]/g, (fullMatch, innerContent) => {
    // If it's already enriched, skip
    if (innerContent.includes('|||')) return fullMatch;
    
    let isModified = false;
    let rewrittenTags = '';
    
    // Process each number and build individual enriched tags
    const numbers = innerContent.match(/\d+/g);
    if (!numbers) return fullMatch;

    for (const numStr of numbers) {
      const oldNum = parseInt(numStr, 10);
      if (remapping.has(oldNum)) {
        isModified = true;
        const newNum = remapping.get(oldNum)!;
        const s = sourceMap.get(oldNum)!;
        const name = s.title.replace(/\|/g, '-').replace(/\]/g, '');
        const url = (s.url || '').replace(/\|/g, '-').replace(/\]/g, '');
        rewrittenTags += `[${newNum}|||${name}|||${url}]`;
      } else {
        // If it wasn't mapped (e.g., an invalid citation number), keep it plain
        rewrittenTags += `[${numStr}]`;
      }
    }

    return isModified ? rewrittenTags : fullMatch;
  });

  return { enriched, activeSources };
}

type RemovedComment = { id: string; value: string };

const isElementInView = (container: HTMLElement, target: HTMLElement): boolean => {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const isTopInView = targetRect.top >= containerRect.top;
  const isBottomInView = targetRect.bottom <= containerRect.bottom;
  return isTopInView && isBottomInView;
};

// Memoizing ChatBody to prevent unnecessary re-renders
const ChatBody = memo(function ChatBody({
  threads,
  onPrevVersion,
  onNextVersion,
  onToggleThreadDiff,
  onToggleThreadEvaluation,
  onRequestControlPanelHelp,
  uploadedFiles = [],
}: {
  threads: Thread[];
  onPrevVersion: (threadIndex: number) => void;
  onNextVersion: (threadIndex: number) => void;
  onToggleThreadDiff: (threadIndex: number, checked: boolean) => void;
  onToggleThreadEvaluation: (threadIndex: number, checked: boolean) => void;
  onRequestControlPanelHelp: () => void;
  uploadedFiles?: ParsedFile[];
}) {
  const { t } = useLanguage();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const lastHoveredId = useRef<string | null>(null);
  const sidebarScrollTarget = useRef(0);
  const isFrameScheduled = useRef(false);
  const animationFrameId = useRef<number | null>(null);

  const [commentPositions, setCommentPositions] = useState<Record<string, number>>({});
  const [inlineCommentIds, setInlineCommentIds] = useState<Set<string>>(() => new Set());
  const [showDiffPopover, setShowDiffPopover] = useState(false);

  // New state to track the scrollHeight of the main chat
  const [chatHeight, setChatHeight] = useState(0);

  const activeComments = useMemo<RemovedComment[]>(() => {
    const comments: RemovedComment[] = [];
    threads.forEach((thread, threadIndex) => {
      if (!thread.showDiff || thread.currentIndex === 0) return;
      const vCurrent = thread.versions[thread.currentIndex];
      const vOriginal = thread.versions[0];
      
      const currentAnswerRaw = vCurrent.answer?.replace(/\\n/g, "\n") ?? "";
      const originalAnswerRaw = vOriginal.answer?.replace(/\\n/g, "\n") ?? "";
      
      const currentAnswer = processCitations(currentAnswerRaw, vCurrent.webSearchSources).enriched;
      const originalAnswer = processCitations(originalAnswerRaw, vOriginal.webSearchSources).enriched;
      
      const diffResult = diffWordsWithNewlineProtection(originalAnswer, currentAnswer);
      diffResult.forEach((part, index) => {
        if (part.removed) {
          comments.push({
            id: `comment-${threadIndex}-${thread.currentIndex}-${index}`,
            value: part.value,
          });
        }
      });
    });
    return comments;
  }, [threads]);

  useEffect(() => {
    setInlineCommentIds(prev => {
      const activeIds = new Set(activeComments.map(comment => comment.id));
      let removed = false;
      const next = new Set<string>();
      prev.forEach(id => {
        if (activeIds.has(id)) {
          next.add(id);
        } else {
          removed = true;
        }
      });
      if (!removed && next.size === prev.size) {
        return prev;
      }
      return next;
    });
  }, [activeComments]);

  useEffect(() => {
    setCommentPositions(prev => {
      const activeIds = new Set(activeComments.map(comment => comment.id));
      let removed = false;
      const next: Record<string, number> = {};
      Object.entries(prev).forEach(([id, position]) => {
        if (activeIds.has(id)) {
          next[id] = position;
        } else {
          removed = true;
        }
      });
      return removed ? next : prev;
    });
  }, [activeComments]);

  useEffect(() => {
    if (threads.length > 0) {
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        const lastThreadIndex = threads.length - 1;
        const lastThreadElement = document.getElementById(`thread-${lastThreadIndex}`);
        const container = chatContainerRef.current;

        if (lastThreadElement && container) {
          // Calculate the position relative to the container
          const elementTop = lastThreadElement.offsetTop;
          const containerTop = container.offsetTop;
          const targetScrollTop = elementTop - containerTop;

          container.scrollTo({
            top: targetScrollTop,
            behavior: "smooth"
          });
        }
      });
    }
  }, [threads.length]);

  // Sync chat height changes to state so sidebar can match height
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    // We observe the first child (the content wrapper) to detect height changes
    const content = container.firstElementChild;
    if (!content) return;

    const observer = new ResizeObserver(() => {
      setChatHeight(container.scrollHeight);
    });

    observer.observe(content);

    // Initial set
    setChatHeight(container.scrollHeight);

    return () => observer.disconnect();
  }, [threads]); // Re-bind if threads structure significantly changes

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const updateSidebarScroll = () => {
      if (sidebarRef.current) {
        sidebarRef.current.scrollTop = sidebarScrollTarget.current;
      }
      isFrameScheduled.current = false;
      animationFrameId.current = null;
    };

    const handleScroll = () => {
      const sidebar = sidebarRef.current;
      if (!sidebar) return;

      const { scrollTop } = chatContainer;

      // CHANGED: Use direct 1:1 mapping instead of ratio calculation.
      // This ensures the sidebar stays geometrically aligned with the text.
      sidebarScrollTarget.current = scrollTop;

      if (!isFrameScheduled.current) {
        isFrameScheduled.current = true;
        animationFrameId.current = requestAnimationFrame(updateSidebarScroll);
      }
    };

    chatContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      chatContainer.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [threads.length]); // Re-bind if threads change

  const handleUpdateCommentPosition = useCallback((id: string, top: number) => {
    requestAnimationFrame(() => {
      setCommentPositions(prev => {
        const normalizedTop = Math.round(top);
        if (prev[id] === normalizedTop) return prev;
        return { ...prev, [id]: normalizedTop };
      });
    });
  }, []);

  const handleCommentClick = useCallback((id: string) => {
    setInlineCommentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleHoverComment = useCallback((id: string | null) => {
    const HIGHLIGHT_COMMENT_CLASSES = ["bg-red-200"];
    const HIGHLIGHT_ICON_CLASSES = ["bg-red-600", "text-white"];

    if (lastHoveredId.current) {
      const lastIconEl = document.getElementById(lastHoveredId.current);
      const lastSidebarEl = document.getElementById(`sidebar-${lastHoveredId.current}`);
      lastIconEl?.classList.remove(...HIGHLIGHT_ICON_CLASSES);
      lastSidebarEl?.classList.remove(...HIGHLIGHT_COMMENT_CLASSES);
    }

    if (id) {
      const chatIconEl = document.getElementById(id);
      const sidebarCommentEl = document.getElementById(`sidebar-${id}`);
      chatIconEl?.classList.add(...HIGHLIGHT_ICON_CLASSES);
      sidebarCommentEl?.classList.add(...HIGHLIGHT_COMMENT_CLASSES);
      lastHoveredId.current = id;

      if (sidebarRef.current && sidebarCommentEl && !isElementInView(sidebarRef.current, sidebarCommentEl)) {
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const commentRect = sidebarCommentEl.getBoundingClientRect();

        let targetScrollTop = sidebarCommentEl.offsetTop;
        if (commentRect.bottom > sidebarRect.bottom) {
          targetScrollTop = sidebarCommentEl.offsetTop + commentRect.height - sidebarRect.height;
        }

        sidebarRef.current.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      }
    } else {
      lastHoveredId.current = null;
    }
  }, []);

  const handleToggleDiffHelp = useCallback(() => setShowDiffPopover(true), []);

  return (
    <div className="w-full max-w-6xl min-w-0 flex flex-col flex-1 min-h-0 relative">
      <div className="flex h-full">
        <div className="flex-1 min-w-0 flex flex-col h-full relative">
          <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
            <div className="mt-6 space-y-4 2xl:max-w-[700px]">
              {threads.length === 0 && (
                <div className="space-y-4 select-none pointer-events-none opacity-40">
                  {/* Faint prompt placeholder */}
                  <div className="flex justify-end">
                    <div className="bg-surface-400 p-5 max-w-[80%] mx-2" style={{ borderRadius: '20px' }}>
                      <p className="text-foreground leading-relaxed text-sm italic">
                        {t('components.chatBody.promptPlaceholder')}
                      </p>
                    </div>
                  </div>
                  {/* Faint answer placeholder with toggles and line */}
                  <div className="mb-20 w-full">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch disabled />
                          <Label className="text-sm text-muted-foreground opacity-50">
                            {t('components.chatAnswer.showChanges')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch disabled />
                          <Label className="text-sm text-muted-foreground opacity-50">
                            {t('components.chatAnswer.showEvaluation')}
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-foreground leading-relaxed text-sm italic">
                        {t('components.chatBody.outputPlaceholder')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {threads.map((thread, threadIndex) => {
                const current = thread.versions[thread.currentIndex];
                return (
                  <div key={threadIndex} id={`thread-${threadIndex}`}>
                    <ChatPrompt
                      text={current.prompt}
                      parameters={current.parameters}
                      fileNames={current.fileNames || uploadedFiles.map(f => f.name)}
                      versionIndex={thread.currentIndex}
                      versionCount={thread.versions.length}
                      onPrevVersion={() => onPrevVersion(threadIndex)}
                      onNextVersion={() => onNextVersion(threadIndex)}
                      webSearchEnabled={current.webSearchEnabled}
                    />
                    {current.searchStatus === "searching" && (
                      <WebSearchStatus status="searching" />
                    )}
                    {current.searchStatus === "streaming" && !current.answer && (
                      <WebSearchStatus status="complete" resultCount={current.webSearchSources?.length ?? 0} />
                    )}
                    {current.searchStatus === "error" && !current.answer && (
                      <WebSearchStatus status="error" />
                    )}
                    {!current.answer && !current.searchStatus && (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[500px]" />
                        <Skeleton className="h-4 w-[300px]" />
                      </div>
                    )}
                    {(() => {
                      const processedCurrent = processCitations(current.answer ?? "", current.webSearchSources);
                      return (
                        <>
                          {current.answer && (
                            <ChatAnswer
                              text={processedCurrent.enriched}
                              answerArray={thread.versions.map(v => processCitations(v.answer ?? "", v.webSearchSources).enriched)}
                              currentIndex={thread.currentIndex}
                              threadIndex={threadIndex}
                              showDiff={Boolean(thread.showDiff)}
                              onToggleDiff={checked => onToggleThreadDiff(threadIndex, checked)}
                              showEvaluation={Boolean(thread.showEvaluation)}
                              onToggleEvaluation={checked => onToggleThreadEvaluation(threadIndex, checked)}
                              currentEvaluation={thread.evaluations?.[thread.currentIndex]}
                              onHoverComment={handleHoverComment}
                              scrollContainerRef={chatContainerRef}
                              onUpdateCommentPosition={handleUpdateCommentPosition}
                              inlineCommentIds={inlineCommentIds}
                              onCommentClick={handleCommentClick}
                              toggleDiffHelp={handleToggleDiffHelp}
                            />
                          )}
                          {processedCurrent.enriched && processedCurrent.activeSources.length > 0 && (
                            <WebSearchReferences sources={processedCurrent.activeSources} />
                          )}
                        </>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
            {/* Spacer to allow scrolling the last item to the top */}
            <div className="h-[60vh] flex-none" />
          </div>
        </div>
        <div className="flex-none w-[calc(18rem+2.5rem)] h-full flex">
          <div id="removed-text-sidebar" className="flex-1 h-full overflow-y-hidden" ref={sidebarRef}>
            {activeComments.length > 0 && (
              <RemovedTextSidebar
                comments={activeComments}
                positions={commentPositions}
                onHover={handleHoverComment}
                inlineCommentIds={inlineCommentIds}
                onCommentClick={handleCommentClick}
                // Pass the tracked height to the sidebar
                minHeight={chatHeight}
              />
            )}
          </div>
          <div className="w-[2.5rem] flex-none flex flex-col items-end gap-4 relative">
            <button className="p-2 rounded-full hover:bg-muted/50" onClick={onRequestControlPanelHelp}>
              <CircleQuestionMark className="h-6 w-6 text-muted-foreground" />
            </button>
            <EvaluationPanel initialIsOpen={false} canClose={true} />
          </div>
        </div>
      </div>
      {showDiffPopover && (
        <PopoverSeries
          steps={[
            { id: "diff-hint", trigger: `#show-diff-switch`, content: t("components.popoverSeries.diff.step1") },
            {
              id: "diff-hint-2",
              trigger: "#chat-body",
              content: (
                <span>
                  <span className="bg-green-200 text-green-900 px-1.5 py-0.5 rounded-md">
                    {t("components.popoverSeries.diff.greenText")}
                  </span>
                  {` ${t("components.popoverSeries.diff.addedNote")} `}
                  <button
                    className="inline-flex items-center justify-center align-middle h-[1.25em] w-[1.25em] mx-0.5 border-2 rounded-sm border-red-600 text-red-700 hover:bg-red-600 hover:text-white transition-colors"
                    aria-label={t("components.popoverSeries.diff.showRemovedAria")}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  {` ${t("components.popoverSeries.diff.removedNote")}`}
                </span>
              ),
            },
            {
              id: "controls-hint",
              trigger: "#removed-text-sidebar",
              side: "left",
              content: (
                <span>
                  <span className="text-red-900 line-through px-1.5 py-0.5 rounded-md border border-red-200">
                    {t("components.popoverSeries.diff.removedTextLabel")}
                  </span>
                  {` ${t("components.popoverSeries.diff.removedTextNote")}`}
                </span>
              ),
            },
          ]}
          initialStep={0}
          onClose={() => setShowDiffPopover(false)}
        />
      )}
    </div>
  );
});

export default ChatBody;