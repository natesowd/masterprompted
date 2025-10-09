import { Paperclip, ChevronLeft, ChevronRight } from "lucide-react";
import RichText from "./RichText";

type ChatPromptProps = {
  text: string;
  fileName?: string;
  // Version navigation
  versionIndex?: number;
  versionCount?: number;
  onPrevVersion?: () => void;
  onNextVersion?: () => void;
};

const ChatPrompt = ({ text, fileName, versionIndex = 0, versionCount = 1, onPrevVersion, onNextVersion }: ChatPromptProps) => {
  return (
    <div
      className="mb-6 max-w-fit ml-auto bg-secondary relative"
      style={{
        borderRadius: '20px',
        padding: '20px 24px',
        maxWidth: '80%'
      }}
    >
      {/* Main message text */}
      <RichText
        text={text}
        className="text-gray-900 leading-relaxed"
        as="p"
      />
      {(fileName || versionCount > 1) && (
        <div className="grid grid-cols-2 items-between mt-2">

          {/* Attachment section */}
          {fileName && (
            <div className="inline-flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">
                {fileName}
              </span>
            </div>
          )}

          {/* Version navigation - only if more than one version */}
          {versionCount > 1 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 justify-end col-start-2">
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