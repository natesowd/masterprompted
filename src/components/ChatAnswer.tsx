import { Paperclip, Plus, Minus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import * as jsdiff from "diff";
import RichText from "./RichText";

type ChatAnswerProps = {
  text: string;
  answerArray?: string[];
  currentIndex?: number;
};

const ChatAnswer = ({ text, answerArray = [], currentIndex = 0 }: ChatAnswerProps) => {
  const [showDiff, setShowDiff] = useState(true);
  
  // Show diff toggle only if there's a previous answer to compare against
  const canShowDiff = answerArray.length > 1 && currentIndex > 0;
  
  // Get the previous answer for comparison
  const previousAnswer = canShowDiff ? answerArray[currentIndex - 1] : "";
  
  // Generate diff when needed
  const diffResult = showDiff && canShowDiff ? jsdiff.diffWords(previousAnswer, text) : [];
  
  const [collapsedParts, setCollapsedParts] = useState<Record<number, boolean>>({});

  const togglePart = (index: number, defaultCollapsed: boolean) => {
    setCollapsedParts(prev => ({ ...prev, [index]: !(prev[index] ?? defaultCollapsed) }));
  };

  const renderDiff = () => {
    return (
      <span>
        {diffResult.map((part, index) => {
          if (part.added) {
            const defaultCollapsed = false; // added text expanded by default
            const isCollapsed = collapsedParts[index] ?? defaultCollapsed;
            return isCollapsed ? (
              <button
                key={index}
                onClick={() => togglePart(index, defaultCollapsed)}
                className="inline-flex items-center justify-center align-middle h-[1.25em] w-[1.25em] mx-0.5 rounded-full border-2 border-green-600 text-green-700 bg-green-50"
                aria-label="Expand added text"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span
                key={index}
                onClick={() => togglePart(index, defaultCollapsed)}
                className="bg-green-200 text-green-800 px-1 rounded cursor-pointer align-middle"
                aria-label="Collapse added text"
              >
                {part.value}
              </span>
            );
          } else if (part.removed) {
            const defaultCollapsed = true; // removed text collapsed by default
            const isCollapsed = collapsedParts[index] ?? defaultCollapsed;
            return isCollapsed ? (
              <button
                key={index}
                onClick={() => togglePart(index, defaultCollapsed)}
                className="inline-flex items-center justify-center align-middle h-[1.25em] w-[1.25em] mx-0.5 rounded-full border-2 border-red-600 text-red-700 bg-red-50"
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
                {part.value}
              </span>
            );
          } else {
            return <span key={index}>{part.value}</span>;
          }
        })}
      </span>
    );
  };

  return (
    <div className="mb-20 w-full">
      {/* Show Diff Toggle - only visible when there's a previous answer */}
      {canShowDiff && (
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200">
          <Switch
            id="show-diff"
            checked={showDiff}
            onCheckedChange={setShowDiff}
          />
          <Label htmlFor="show-diff" className="text-sm text-gray-600">
            Show Diff
          </Label>
        </div>
      )}
      
      {/* Main message text */}
      {showDiff && canShowDiff ? (
        <div className="text-gray-900 leading-relaxed" style={{ fontFamily: 'Manrope', fontSize: '16px', lineHeight: '24px', margin: 0 }}>
          {renderDiff()}
        </div>
      ) : (
        <RichText 
          text={text}
          className="text-gray-900 leading-relaxed"
          as="div"
        />
      )}
    </div>
  );
};

export default ChatAnswer;