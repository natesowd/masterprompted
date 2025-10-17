// src/components/ChatAnswer.tsx

import { Minus, CircleQuestionMark } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLayoutEffect, useRef } from "react";
import RichText from "@/components/RichText.tsx";
import { diffWordsWithNewlineProtection, DiffPart } from "@/lib/diff";

type ChatAnswerProps = {
  text: string;
  answerArray?: string[];
  currentIndex?: number;
  threadIndex: number;
  showDiff: boolean;
  onToggleDiff: (checked: boolean) => void;
  onHoverComment: (id: string | null) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onUpdateCommentPosition: (id: string, top: number) => void;
  inlineCommentIds: Set<string>;
  onCommentClick: (id: string) => void;
  toggleDiffHelp: () => void;
};

const ChatAnswer = ({
  text,
  answerArray = [],
  currentIndex = 0,
  threadIndex,
  showDiff,
  onToggleDiff,
  onHoverComment,
  scrollContainerRef,
  onUpdateCommentPosition,
  inlineCommentIds,
  onCommentClick,
  toggleDiffHelp
}: ChatAnswerProps) => {
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
              <span key={index} className="bg-green-200 text-green-800 px-1 rounded align-middle">
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
                  className="bg-red-200/60 text-red-800 px-1 rounded line-through cursor-pointer align-middle"
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
                // className is now static, highlighting is controlled by a CSS class from the parent
                className="inline-flex items-center justify-center align-middle h-[1.25em] w-[1.25em] mx-0.5 border-2 rounded-sm border-red-600 text-red-700 hover:bg-red-600 hover:text-white transition-colors"
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

  return (
    <div className="mb-20 w-full">
      {canShowDiff && (
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-border">
          <Switch
            id={`show-diff-${threadIndex}`}
            checked={showDiff}
            onCheckedChange={onToggleDiff}
          />
          <Label htmlFor={`show-diff-${threadIndex}`} className="text-sm text-muted-foreground">
            Show Changes
          </Label>
          <button onClick={() => toggleDiffHelp()}>
          <CircleQuestionMark className="-ml-1 h-4 w-4 text-muted-foreground"  />
          </button>
        </div>
      )}
      
      <div id="chat-body" className="prose max-w-none text-foreground leading-relaxed">
        {showDiff && canShowDiff ? renderDiff() : <RichText text={formattedText}/>}
      </div>
    </div>
  );
};

export default ChatAnswer;
