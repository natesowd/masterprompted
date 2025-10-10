// ChatAnswer.tsx

import { Plus, Minus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import * as jsdiff from "diff";
// ⭐️ FIX: Import the simplified and more powerful RichText component.
import RichText from "@/components/RichText.tsx";

type ChatAnswerProps = {
  text: string;
  answerArray?: string[];
  currentIndex?: number;
};

const ChatAnswer = ({ text, answerArray = [], currentIndex = 0 }: ChatAnswerProps) => {
  const [showDiff, setShowDiff] = useState(false);

  const formattedText = text.replace(/\\n/g, '\n');

  const canShowDiff = answerArray.length > 1 && currentIndex > 0;
  const previousAnswer = canShowDiff ? answerArray[currentIndex - 1].replace(/\\n/g, '\n') : "";
  const diffResult = showDiff && canShowDiff ? jsdiff.diffWords(previousAnswer, formattedText) : [];
  
  const [collapsedParts, setCollapsedParts] = useState<Record<number, boolean>>({});

  const togglePart = (index: number, defaultCollapsed: boolean) => {
    setCollapsedParts(prev => ({ ...prev, [index]: !(prev[index] ?? defaultCollapsed) }));
  };

  const renderDiff = () => {
    return (
      <>
        {diffResult.map((part, index) => {
          if (part.added) {
            const defaultCollapsed = false;
            const isCollapsed = collapsedParts[index] ?? defaultCollapsed;
            return isCollapsed ? (
              <button
                key={index}
                onClick={() => togglePart(index, defaultCollapsed)}
                className="inline-flex items-center justify-center align-middle h-[1.25em] w-[1.25em] mx-0.5 border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                aria-label="Expand added text"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            ) : (
              // ⭐️ FIX: Wrap the RichText component for styling and interaction.
              <span
                key={index}
                onClick={() => togglePart(index, defaultCollapsed)}
                className="bg-green-200 text-green-800 px-1 rounded cursor-pointer align-middle"
                aria-label="Collapse added text"
              >
                <RichText text={part.value} inline />
              </span>
            );
          } else if (part.removed) {
            const defaultCollapsed = true;
            const isCollapsed = collapsedParts[index] ?? defaultCollapsed;
            return isCollapsed ? (
              <button
                key={index}
                onClick={() => togglePart(index, defaultCollapsed)}
                className="inline-flex items-center justify-center align-middle h-[1.25em] w-[1.25em] mx-0.5 border-2
                 border-red-600 text-red-700 hover:bg-red-600 hover:text-white"
                aria-label="Expand removed text"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span
                key={index}
                onClick={() => togglePart(index, defaultCollapsed)}
                className="bg-red-200 text-red-800 px-1 rounded line-through cursor-pointer align-middle"
                aria-label="Collapse removed text"
              >
                <RichText text={part.value + " "} inline />
              </span>
            );
          } else {
            // ⭐️ FIX: Render unchanged parts directly with the RichText component.
            return <RichText key={index} text={part.value} inline />;
          }
        })}
      </>
    );
  };

  return (
    <div className="mb-20 w-full">
      {/* Show Diff Toggle */}
      {canShowDiff && (
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-border">
          <Switch
            id="show-diff"
            checked={showDiff}
            onCheckedChange={setShowDiff}
          />
          <Label htmlFor="show-diff" className="text-sm text-muted-foreground">
            Show Changes
          </Label>
        </div>
      )}
      
      {/* Main message text */}
      <div className="prose max-w-none text-foreground leading-relaxed">
        {showDiff && canShowDiff ? (
          renderDiff()
        ) : (
          // The RichText component is used here without the 'inline' prop
          // to render full paragraphs correctly.
          <RichText text={formattedText} />
        )}
      </div>
    </div>
  );
};

export default ChatAnswer;