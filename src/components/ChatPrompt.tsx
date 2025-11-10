import { Paperclip, ChevronLeft, ChevronRight } from "lucide-react";
import RichText from "./RichText";
import type { Parameters } from "@/pages/PromptPlayground";

type ChatPromptProps = {
  text: string;
  fileName?: string;
  parameters?: Parameters;
  // Version navigation
  versionIndex?: number;
  versionCount?: number;
  onPrevVersion?: () => void;
  onNextVersion?: () => void;
};

const ChatPrompt = ({ text, fileName, parameters, versionIndex = 0, versionCount = 1, onPrevVersion, onNextVersion }: ChatPromptProps) => {
  const paramString = parameters && Object.entries(parameters)
    .filter(([, value]) => value)
    .map(([key, value]) => `${value}`)
    .join(', ');

  return (
    <div
      className="mb-6 mx-2 max-w-fit ml-auto bg-secondary relative"
      style={{
        borderRadius: '20px',
        padding: '20px 24px',
        maxWidth: '80%'
      }}
    >
      {/* Main message text */}
      <RichText
        text={text}
        className="text-foreground leading-relaxed"
      />
      {(fileName || versionCount > 1) && (
        <div className="flex justify-between items-center mt-2">
          {/* Left side: Parameters and Attachments */}
          <div className="flex flex-col items-start gap-1">
            {versionIndex > 0 && paramString && (
              <p className="text-xs text-muted-foreground italic">
                {paramString}
              </p>
            )}
            {fileName && (
              <div className="inline-flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">
                  {fileName}
                </span>
              </div>
            )}
          </div>

          {/* Right side: Version navigation - only if more than one version */}
          {versionCount > 1 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end col-start-2">
              <button
                type="button"
                onClick={onPrevVersion}
                disabled={versionIndex <= 0}
                className="inline-flex items-center justify-center h-6 w-6 rounded-full disabled:opacity-50"
                aria-label="Previous version"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>{versionIndex + 1} / {versionCount}</span>
              <button
                type="button"
                onClick={onNextVersion}
                disabled={versionIndex >= versionCount - 1}
                className="inline-flex items-center justify-center h-6 w-6 rounded-full disabled:opacity-50"
                aria-label="Next version"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPrompt;