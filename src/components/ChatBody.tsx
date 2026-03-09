import ChatPrompt from "@/components/ChatPrompt";
import ChatAnswer from "@/components/ChatAnswer";
import RemovedTextSidebar from "@/components/RemovedTextSidebar";
import EvaluationPanel from "@/components/EvaluationPanel";
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { CircleQuestionMark, Minus } from "lucide-react";
import { PopoverSeries } from "@/components/PopoverSeries";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Thread } from "@/pages/PromptPlayground";
import { diffWordsWithNewlineProtection } from "@/lib/diff";

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
}: {
  threads: Thread[];
  onPrevVersion: (threadIndex: number) => void;
  onNextVersion: (threadIndex: number) => void;
  onToggleThreadDiff: (threadIndex: number, checked: boolean) => void;
  onToggleThreadEvaluation: (threadIndex: number, checked: boolean) => void;
  onRequestControlPanelHelp: () => void;
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
      const currentAnswer = thread.versions[thread.currentIndex].answer?.replace(/\\n/g, "\n") ?? "";
      const originalAnswer = thread.versions[0].answer?.replace(/\\n/g, "\n") ?? "";
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
    <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-8rem)] relative">
      <div className="flex h-full">
        <div className="flex-1 min-w-0 flex flex-col h-full relative">
          <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
            <div className="mt-6 space-y-4">
              {threads.length === 0 && (
                <div className="space-y-4 select-none pointer-events-none">
                  {/* Faint prompt placeholder */}
                  <div className="flex justify-end">
                    <div className="w-3/4 rounded-2xl p-6">
                      <div className="h-3 w-2/3 rounded bg-muted-foreground/8 mb-3" />
                      <div className="h-3 w-1/2 rounded bg-muted-foreground/8" />
                    </div>
                  </div>
                  {/* Faint answer placeholder */}
                  <div className="flex justify-start">
                    <div className="w-full rounded-2xl p-6">
                      <div className="h-3 w-full rounded bg-muted-foreground/8 mb-3" />
                      <div className="h-3 w-5/6 rounded bg-muted-foreground/8 mb-3" />
                      <div className="h-3 w-4/6 rounded bg-muted-foreground/8 mb-3" />
                      <div className="h-3 w-3/4 rounded bg-muted-foreground/8" />
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