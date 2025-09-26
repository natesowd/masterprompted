import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUp } from "lucide-react";
import { forwardRef, useState, useEffect, useRef } from 'react';

// Accept an 'id' prop
function SubmitButton({ onClick, id, shouldPulse }: { onClick?: () => void; id?: string; shouldPulse?: boolean }) {
  return (
    <Button
      id={id}
      onClick={onClick}
      variant="secondary"
      size="icon"
      className={`absolute top-4 right-4 rounded-full p-3 h-10 w-10 transition-all duration-200 ${shouldPulse ? 'animate-pulse-size' : ''}`}
      style={{
        background: '#1F1F1F',
        border: 'none'
      }}
    >
      <ArrowUp className="h-5 w-5 text-white" />
    </Button>
  );
};

function UploadFile({ onClick, fileName }: { onClick?: () => void; fileName?: string }) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full p-1 h-6 w-6"
        onClick={onClick}
      >
        <Paperclip className="h-4 w-4 text-gray-600" />
      </Button>
      {fileName && (
        <span className="text-sm text-gray-600 overflow-hidden text-ellipsis max-w-[200px]">
          {fileName}
        </span>
      )}
    </div>
  );
}

type ChatboxProps = {
  canType?: boolean;
  text?: string;
  onSubmit?: () => void;
  onUpload?: () => void;
  fileName?: string;
  submitButtonId?: string; // Add a new prop for the button ID
};

// No need for forwardRef on Chatbox itself anymore
const Chatbox = ({ canType = true, text = "", onSubmit, onUpload, fileName, submitButtonId }: ChatboxProps) => {
  const [clickCount, setClickCount] = useState(0);
  const [shouldPulse, setShouldPulse] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  useEffect(() => {
    // Start 10-second timer
    const startTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShouldPulse(true);
      }, 10000);
    };

    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTextareaClick = () => {
    setClickCount(prev => prev + 1);
    lastInteractionRef.current = Date.now();
    
    // Reset pulse animation
    setShouldPulse(false);
    
    // Start pulse after 3 clicks
    if (clickCount >= 2) {
      setShouldPulse(true);
    }
    
    // Reset timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShouldPulse(true);
    }, 10000);
  };

  const handleSubmit = () => {
    setShouldPulse(false);
    setClickCount(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    onSubmit?.();
  };

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
      <Textarea
        placeholder="Type your message here..."
        className="border-none bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[60px]"
        disabled={!canType}
        defaultValue={text}
        onClick={handleTextareaClick}
        style={{
          fontFamily: 'Manrope',
          fontSize: '16px',
          lineHeight: '24px',
          color: '#1F1F1F'
        }}
      />
      
      <SubmitButton onClick={handleSubmit} id={submitButtonId} shouldPulse={shouldPulse} />
      <UploadFile onClick={onUpload} fileName={fileName} />
    </div>
  );
};

export default Chatbox;