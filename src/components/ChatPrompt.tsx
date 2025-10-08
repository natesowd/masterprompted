import { Paperclip } from "lucide-react";
import RichText from "./RichText";

type ChatPromptProps = {
  text: string;
  fileName?: string;
};

const ChatPrompt = ({ text, fileName }: ChatPromptProps) => {
  return (
    <div 
      className="mb-8 max-w-fit ml-auto bg-secondary"
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

      {/* Attachment section */}
      {fileName && (
        <div className="flex items-center gap-2 mt-3">
          <Paperclip className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-700 font-medium">
            {fileName}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatPrompt;