import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUp } from "lucide-react";

type SentPromptProps = {
  text: string;
  fileName?: string;
  onResend?: () => void;
};

const SentPrompt = ({ text, fileName, onResend }: SentPromptProps) => {
  return (
    <div 
      className="relative mb-8"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: '20px',
        padding: '24px',
        maxWidth: '100%'
      }}
    >
      {/* Main message text */}
      <p 
        className="text-gray-900 leading-relaxed pr-12"
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
        <div className="flex items-center gap-2 mt-4">
          <Paperclip className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">
            {fileName}
          </span>
        </div>
      )}

      {/* Resend/Edit button */}
      <Button
        onClick={onResend}
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 rounded-full h-10 w-10"
        style={{
          background: '#1F1F1F',
          border: 'none'
        }}
      >
        <ArrowUp className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
};

export default SentPrompt;