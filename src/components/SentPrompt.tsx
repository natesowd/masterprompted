import { Paperclip } from "lucide-react";

type SentPromptProps = {
  text: string;
  fileName?: string;
};

const SentPrompt = ({ text, fileName }: SentPromptProps) => {
  return (
    <div 
      className="relative mb-8 max-w-fit ml-auto"
      style={{
        background: '#F5F5F5',
        borderRadius: '20px',
        padding: '20px 24px',
        maxWidth: '80%'
      }}
    >
      {/* Main message text */}
      <p 
        className="text-gray-900 leading-relaxed"
        style={{
          fontFamily: 'Manrope',
          fontSize: '16px',
          lineHeight: '24px',
          margin: 0
        }}
      >
        {text}
      </p>

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

export default SentPrompt;