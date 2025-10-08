import { Paperclip } from "lucide-react";
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
  const [showDiff, setShowDiff] = useState(false);
  
  // Show diff toggle only if there's a previous answer to compare against
  const canShowDiff = answerArray.length > 1 && currentIndex > 0;
  
  // Get the previous answer for comparison
  const previousAnswer = canShowDiff ? answerArray[currentIndex - 1] : "";
  
  // Generate diff when needed
  const diffResult = showDiff && canShowDiff ? jsdiff.diffWords(previousAnswer, text) : [];
  
  const renderDiff = () => {
    return (
      <span>
        {diffResult.map((part, index) => {
          if (part.added) {
            return (
              <span
                key={index}
                className="bg-green-200 text-green-800 px-1 rounded"
              >
                {part.value}
              </span>
            );
          } else if (part.removed) {
            return (
              <span
                key={index}
                className="bg-red-200 text-red-800 px-1 rounded line-through"
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
    <div 
      className="mb-8 max-w-fit mr-auto, bg-gray-100"
      style={{
        borderRadius: '20px',
        padding: '20px 24px',
        maxWidth: '80%'
      }}
    >
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
        <div 
          className="text-gray-900 leading-relaxed"
          style={{
            fontFamily: 'Manrope',
            fontSize: '16px',
            lineHeight: '24px',
            margin: 0
          }}
        >
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