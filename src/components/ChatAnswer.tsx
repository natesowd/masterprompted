/**
 * ChatAnswer Component
 * 
 * Displays AI responses with diff visualization, inline comments, and change tracking.
 * Supports toggling between diff view and regular view, with removed text management.
 * 
 * @example
 * ```tsx
 * <ChatAnswer
 *   text={response}
 *   answerArray={versions}
 *   currentIndex={1}
 *   showDiff={true}
 *   onToggleDiff={setShowDiff}
 * />
 * ```
 */

import { Minus, CircleQuestionMark, Loader2, GitCompare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLayoutEffect, useRef, useState } from "react";
import RichText from "@/components/RichText.tsx";
import { diffWordsWithNewlineProtection, DiffPart } from "@/lib/diff";
import { useLanguage } from "@/contexts/LanguageContext";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { VersionEvaluation, ThreadVersion } from "@/pages/PromptPlayground";
import { renderTextWithFlags } from "@/lib/evaluationRenderer";
import CompareView from "@/components/CompareView";
import CompareBasePickerModal from "@/components/CompareBasePickerModal";

const answerVariants = cva(
  "mb-20 w-full",
  {
    variants: {
      variant: {
        default: "",
        compact: "mb-10"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const diffPartVariants = cva(
  "px-1 rounded align-middle",
  {
    variants: {
      type: {
        added: "bg-green-200 text-green-800",
        removed: "bg-red-200/60 text-red-800 line-through",
        removedButton: "inline-flex items-center justify-center align-middle h-[1.25em] w-[1.25em] mx-0.5 border-2 rounded-sm border-red-600 text-red-700 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
      }
    }
  }
);

type ChatAnswerProps = VariantProps<typeof answerVariants> & {
  /** The answer text to display */
  text: string;
  /** Array of all answer versions for diff comparison */
  answerArray?: string[];
  /** Current version index */
  currentIndex?: number;
  /** Thread index for unique IDs */
  threadIndex: number;
  /** @deprecated archived in favor of showCompare */
  showDiff: boolean;
  /** @deprecated archived in favor of onToggleCompare */
  onToggleDiff: (checked: boolean) => void;
  /** Whether to show evaluation flags */
  showEvaluation: boolean;
  /** Callback when evaluation toggle is changed */
  onToggleEvaluation: (checked: boolean) => void;
  /** Current evaluation state for this version */
  currentEvaluation?: VersionEvaluation;
  /** Callback when hovering over a comment marker */
  onHoverComment: (id: string | null) => void;
  /** Reference to scroll container */
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  /** Callback to update comment position */
  onUpdateCommentPosition: (id: string, top: number) => void;
  /** Set of comment IDs that are displayed inline */
  inlineCommentIds: Set<string>;
  /** Callback when comment is clicked */
  onCommentClick: (id: string) => void;
  /** @deprecated archived in favor of compare */
  toggleDiffHelp: () => void;
  /** Whether compare view is active */
  showCompare: boolean;
  /** Callback to toggle compare; pass comparedIndex to open with a specific base, undefined to close */
  onToggleCompare: (comparedIndex?: number) => void;
  /** Callback when user picks a different base version from the modal */
  onChangeCompareBase: (comparedIndex: number) => void;
  /** Versions of the thread — used for the base picker modal previews */
  versions: ThreadVersion[];
  /** Raw compared answer text to diff against current */
  comparedVersionIndex?: number;
  /** DOM element (sidebar container) to portal the compare sidebar into */
  compareSidebarContainer: HTMLElement | null;
};

const ChatAnswer = ({
  text,
  answerArray = [],
  currentIndex = 0,
  threadIndex,
  showDiff,
  onToggleDiff,
  showEvaluation,
  onToggleEvaluation,
  currentEvaluation,
  onHoverComment,
  scrollContainerRef,
  onUpdateCommentPosition,
  inlineCommentIds,
  onCommentClick,
  toggleDiffHelp,
  showCompare,
  onToggleCompare,
  onChangeCompareBase,
  versions,
  comparedVersionIndex,
  compareSidebarContainer,
  variant
}: ChatAnswerProps) => {
  const { t } = useLanguage();
  const markerRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const [showBasePicker, setShowBasePicker] = useState(false);
  const formattedText = text.replace(/\\n/g, '\n');

  const canShowDiff = answerArray.length > 1 && currentIndex > 0;
  const canCompare = versions.length > 1;
  const originalAnswer = canShowDiff ? answerArray[0].replace(/\\n/g, '\n') : "";

  const resolvedComparedIndex = (() => {
    if (comparedVersionIndex != null && comparedVersionIndex !== currentIndex) return comparedVersionIndex;
    // Default pick: the other version when there are exactly 2.
    if (versions.length === 2) return currentIndex === 0 ? 1 : 0;
    return null;
  })();
  const comparedText = resolvedComparedIndex != null
    ? (versions[resolvedComparedIndex]?.answer ?? "").replace(/\\n/g, '\n')
    : "";

  const handleCompareClick = () => {
    if (!canCompare) return;
    if (showCompare) {
      onToggleCompare(undefined);
      return;
    }
    if (versions.length === 2) {
      onToggleCompare(currentIndex === 0 ? 1 : 0);
    } else {
      setShowBasePicker(true);
    }
  };

  const handlePickBase = (idx: number) => {
    setShowBasePicker(false);
    if (showCompare) onChangeCompareBase(idx);
    else onToggleCompare(idx);
  };

  const diffResult: DiffPart[] = showDiff && canShowDiff
    ? diffWordsWithNewlineProtection(originalAnswer, formattedText)
    : [];

  useLayoutEffect(() => {
    if (showDiff && scrollContainerRef.current) {
      const scrollContainerTop = scrollContainerRef.current.getBoundingClientRect().top;
      markerRefs.current.forEach((el, id) => {
        if (el) {
          const markerTop = el.getBoundingClientRect().top;
          const relativeTop = markerTop - scrollContainerTop + scrollContainerRef.current!.scrollTop;
          onUpdateCommentPosition(id, relativeTop);
        }
      });
    }
  }, [diffResult, showDiff, onUpdateCommentPosition, scrollContainerRef, inlineCommentIds]);

  const renderDiff = () => {
    // Group diffResult into paragraphs to match standard block rendering
    const paragraphs: DiffPart[][] = [[]];
    let currentParagraphIndex = 0;

    diffResult.forEach((part) => {
      if (part.value.includes('\n\n')) {
        const splits = part.value.split(/\n\s*\n/);
        splits.forEach((split, i) => {
          if (split.trim()) {
            paragraphs[currentParagraphIndex].push({ ...part, value: split });
          }
          if (i < splits.length - 1) {
            currentParagraphIndex++;
            paragraphs[currentParagraphIndex] = [];
          }
        });
      } else {
        paragraphs[currentParagraphIndex].push(part);
      }
    });

    return (
      <div className="whitespace-pre-wrap break-words">
        {paragraphs.map((paraParts, pIndex) => (
          <p key={pIndex}>
            {paraParts.map((part, index) => {
              if (part.added) {
                return (
                  <span key={index} className={cn(diffPartVariants({ type: "added" }))}>
                    <RichText text={part.value} inline diff={true} />
                  </span>
                );
              } else if (part.removed) {
                const commentId = `comment-${threadIndex}-${currentIndex}-${pIndex}-${index}`;
                const isInline = inlineCommentIds.has(commentId);

                if (isInline) {
                  return (
                    <span
                      key={index}
                      ref={(el) => markerRefs.current.set(commentId, el)}
                      onClick={() => onCommentClick(commentId)}
                      className={cn(diffPartVariants({ type: "removed" }), "cursor-pointer")}
                      aria-label="Hide removed text"
                    >
                      <RichText text={part.value} inline diff={true} />
                    </span>
                  );
                }

                return (
                  <button
                    key={index}
                    ref={(el) => markerRefs.current.set(commentId, el as HTMLElement)}
                    onClick={() => onCommentClick(commentId)}
                    onMouseEnter={() => onHoverComment(commentId)}
                    onMouseLeave={() => onHoverComment(null)}
                    id={commentId}
                    className={cn(diffPartVariants({ type: "removedButton" }))}
                    aria-label="Show removed text"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                );
              } else {
                return <RichText key={index} text={part.value} inline diff={true} />;
              }
            })}
          </p>
        ))}
      </div>
    );
  };

  // Determine if evaluation toggle should be disabled
  const evaluationDisabled = !currentEvaluation || currentEvaluation.loading || currentEvaluation.error || !currentEvaluation.data;
  // Show spinner while initial evaluation is loading OR while web_search is still pending
  const evaluationLoading = (currentEvaluation?.loading ?? false)
    || (currentEvaluation?.data?.webSearchPending ?? false);
  // "Nothing detected" should only show when ALL evaluations are truly done:
  // - not loading, has data, no web searches pending, and zero spans found.
  // Note: we don't require every pipeline status to be "success" — a pipeline
  // that errored but produced no spans shouldn't block the clean badge.
  const evaluationClean = currentEvaluation
    && !currentEvaluation.loading
    && !currentEvaluation.error
    && currentEvaluation.data
    && currentEvaluation.data.spans.length === 0
    && !currentEvaluation.data.webSearchPending;

  // Render text with evaluation flags
  const renderEvaluation = () => {
    if (!currentEvaluation?.data?.spans) return <RichText text={formattedText} prose={false} />;
    return <div className="whitespace-pre-wrap break-words">{renderTextWithFlags(formattedText, currentEvaluation.data.spans)}</div>;
  };

  return (
    <div className={cn(answerVariants({ variant }))}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <div className="flex items-center gap-4">
          {/* LEGACY: "Show Changes" switch archived in favor of the Compare button below.
              Keep this block for rollback — reinstate by uncommenting and re-wiring the
              archived onToggleDiff path. Do not delete.
          <div className="flex items-center space-x-2" id='show-diff-switch'>
            <Switch
              id={`show-diff-${threadIndex}`}
              checked={showDiff}
              onCheckedChange={onToggleDiff}
              disabled={!canShowDiff}
            />
            <Label
              htmlFor={`show-diff-${threadIndex}`}
              className={cn("text-sm text-muted-foreground flex items-center gap-1", !canShowDiff && "opacity-50")}
            >
              {t('components.chatAnswer.showChanges')}
              {canShowDiff && (
                <button onClick={(e) => { e.preventDefault(); toggleDiffHelp(); }} className="flex-shrink-0">
                  <CircleQuestionMark className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </Label>
          </div>
          */}
          <div className="flex items-center space-x-2" id="compare-button">
            <Button
              size="sm"
              variant={showCompare ? "default" : "outline"}
              disabled={!canCompare}
              onClick={handleCompareClick}
              className="h-8"
            >
              <GitCompare className="h-4 w-4 mr-1.5" />
              {t('components.chatAnswer.compare')}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`show-evaluation-${threadIndex}`}
              checked={showEvaluation}
              onCheckedChange={onToggleEvaluation}
              disabled={evaluationDisabled}
            />
            <Label htmlFor={`show-evaluation-${threadIndex}`} className="text-sm text-muted-foreground flex items-center gap-1">
              {t('components.chatAnswer.showEvaluation')}
              {evaluationLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </Label>
            {showEvaluation && evaluationClean && (
              <span className="ml-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                Nothing detected at this moment
              </span>
            )}
          </div>
        </div>

        {showCompare && resolvedComparedIndex != null && (
          <div className="flex items-center gap-3 text-xs px-2">
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
                {t('components.compareView.currentLegend')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                {t('components.compareView.comparedLegend')} v{resolvedComparedIndex + 1}
              </span>
            </div>
            {versions.length > 2 && (
              <button
                onClick={() => setShowBasePicker(true)}
                className="underline text-muted-foreground hover:text-foreground"
              >
                {t('components.chatAnswer.changeBase')}
              </button>
            )}
          </div>
        )}
      </div>

      <div id="chat-body" className="prose max-w-none text-foreground leading-relaxed break-words">
        {showEvaluation ? (
          renderEvaluation()
        ) : showCompare && resolvedComparedIndex != null ? (
          <CompareView
            currentText={formattedText}
            comparedText={comparedText}
            threadIndex={threadIndex}
            scrollContainerRef={scrollContainerRef}
            sidebarContainer={compareSidebarContainer}
          />
        ) : showDiff && canShowDiff ? (
          renderDiff()
        ) : (
          <RichText text={formattedText} prose={false} />
        )}
      </div>

      <CompareBasePickerModal
        open={showBasePicker}
        versions={versions}
        currentIndex={currentIndex}
        onPick={handlePickBase}
        onClose={() => setShowBasePicker(false)}
      />
    </div>
  );
};

export default ChatAnswer;
