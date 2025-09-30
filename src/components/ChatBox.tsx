// src/components/ChatBox.tsx

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUp } from "lucide-react";

// SubmitButton and UploadFile components remain the same...
function SubmitButton({ onClick, id }: { onClick?: (e?: React.MouseEvent) => void; id?: string }) {
  return (
    <Button
      id={id}
      onClick={onClick}
      variant="default"
      size="icon"
      className="absolute top-4 right-4 rounded-full p-3 h-10 w-10"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

function UploadFile({ onClick, fileName }: { onClick?: () => void; fileName?: string }) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <Button variant="ghost" size="icon" className="rounded-full p-1 h-6 w-6" onClick={onClick}>
        <Paperclip className="h-4 w-4 text-gray-600" />
      </Button>
      {fileName && ( <span className="text-sm text-gray-600 overflow-hidden text-ellipsis max-w-[200px]">{fileName}</span> )}
    </div>
  );
}


type ChatboxProps = {
  canType?: boolean;
  // Controlled-only API
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void; // Function to lift state up
  onUpload?: () => void;
  fileName?: string;
  submitButtonId?: string;
};
const Chatbox = ({ canType = true, value, onChange, onSubmit, onUpload, fileName, submitButtonId }: ChatboxProps) => {
  // Controlled-only component: `value` drives the textarea and `onChange` must be provided.

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSubmit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (onSubmit) onSubmit(value);
    // Do not clear `value` here; parent controls the value and should decide what to show after submit.
  };

  return (
    <div 
      className="relative mb-4"
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
        value={value}
        onChange={handleInputChange}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        style={{ fontFamily: 'Manrope', fontSize: '16px', lineHeight: '24px', color: '#1F1F1F' }}
      />
      
      <SubmitButton onClick={handleSubmit} id={submitButtonId} />
      <UploadFile onClick={onUpload} fileName={fileName} />
    </div>
  );
};

export default Chatbox;