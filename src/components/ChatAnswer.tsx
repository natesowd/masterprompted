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

import { Minus, CircleQuestionMark, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLayoutEffect, useRef } from "react";
import RichText from "@/components/RichText.tsx";
import { diffWordsWithNewlineProtection, DiffPart } from "@/lib/diff";
import { useLanguage } from "@/contexts/LanguageContext";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { VersionEvaluation } from "@/pages/PromptPlayground";
import { renderTextWithFlags } from "@/lib/evaluationRenderer";

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
  /** Whether to show diff visualization */
  showDiff: boolean;
  /** Callback when diff toggle is changed */
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
  /** Callback to toggle diff help */
  toggleDiffHelp: () => void;
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
  variant
}: ChatAnswerProps) => {
  const { t } = useLanguage();
  const markerRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const formattedText = text.replace(/\\n/g, '\n');

  const canShowDiff = answerArray.length > 1 && currentIndex > 0;
  const originalAnswer = canShowDiff ? answerArray[0].replace(/\\n/g, '\n') : "";

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
    return (
      <>
        {diffResult.map((part, index) => {
          if (part.added) {
            return (
              <span key={index} className={cn(diffPartVariants({ type: "added" }))}>
                <RichText text={part.value} inline diff={true} />
              </span>
            );
          } else if (part.removed) {
            const commentId = `comment-${threadIndex}-${currentIndex}-${index}`;
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
      </>
    );
  };

  // Determine if evaluation toggle should be disabled
  const evaluationDisabled = !currentEvaluation || currentEvaluation.loading || currentEvaluation.error || !currentEvaluation.data;
  const evaluationLoading = currentEvaluation?.loading ?? false;

  // Render text with evaluation flags
  const renderEvaluation = () => {
    if (!currentEvaluation?.data) return <RichText text={formattedText} />;
    return renderTextWithFlags(formattedText, currentEvaluation.data);
  };

  return (
    <div className={cn(answerVariants({ variant }))}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2" id='show-diff-switch'>
            <Switch
              id={`show-diff-${threadIndex}`}
              checked={showDiff}
              onCheckedChange={onToggleDiff}
              disabled={!canShowDiff || showEvaluation}
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

          <div className="flex items-center space-x-2">
            <Switch
              id={`show-evaluation-${threadIndex}`}
              checked={showEvaluation}
              onCheckedChange={onToggleEvaluation}
              disabled={evaluationDisabled || showDiff}
            />
            <Label htmlFor={`show-evaluation-${threadIndex}`} className="text-sm text-muted-foreground flex items-center gap-1">
              {t('components.chatAnswer.showEvaluation')}
              {evaluationLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </Label>
          </div>
        </div>

        {showDiff && canShowDiff && (
          <div className="flex items-center gap-3 text-xs px-2">
            <div className="flex items-center gap-1">
              <span className={cn(diffPartVariants({ type: "added" }))}>{t('components.chatAnswer.added')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={cn(diffPartVariants({ type: "removed" }))}>{t('components.chatAnswer.removed')}</span>
            </div>
          </div>
        )}
      </div>

      <div id="chat-body" className="prose max-w-none text-foreground leading-relaxed break-words">
        {showEvaluation ? (
          renderEvaluation()
        ) : showDiff && canShowDiff ? (
          renderDiff()
        ) : (
          <RichText text={formattedText} />
        )}
      </div>
    </div>
  );
};

export default ChatAnswer;
