// src/components/ChatBox.tsx

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, SendHorizontal } from "lucide-react";

// SubmitButton component
function SubmitButton({ onClick, id }: { onClick?: (e?: React.MouseEvent) => void; id?: string }) {
  return (
    <Button
      id={id}
      onClick={onClick}
      variant="default"
      size="icon"
      className="rounded-full h-10 w-10"
    >
      <SendHorizontal className="h-5 w-5" />
    </Button>
  );
};

// UploadFile component
function UploadFile({ onClick, fileName }: { onClick?: () => void; fileName?: string }) {
  return (
    <div className="flex items-center gap-2">
      {/* **temporarily disabled** */}
      <Button variant="ghost" size="icon" className="rounded-full h-6 w-6" onClick={onClick} disabled={true}> 
        <Paperclip className="h-4 w-4 text-gray-600" />
      </Button>
      {fileName && (
        <span className="text-sm text-gray-600 overflow-hidden text-ellipsis max-w-[100px]">
          {fileName}
        </span>
      )}
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
  // When true, the chatbox will expand to fill its parent's height
  fullHeight?: boolean;
};

const Chatbox = ({ canType = true, value, onChange, onSubmit, onUpload, fileName, submitButtonId, fullHeight = false }: ChatboxProps) => {
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
    <div className={`relative bg-white border border-gray-200 rounded-2xl px-3 py-3 ${fullHeight ? 'h-full flex flex-col min-h-0' : 'max-w-3xl'}`}>
      {/* Submit button - positioned in top right */}

      {/* Text area - takes up most of the space */}
      <Textarea
        placeholder="Type your message here..."
        className={`mb-6 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base leading-6 text-gray-900 font-['Manrope'] ${fullHeight ? 'flex-1 min-h-0 resize-none overflow-y-auto' : 'min-h-[100px] resize-none'}`}
        disabled={!canType}
        value={value}
        onChange={handleInputChange}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex justify-between align-middle">

        <UploadFile onClick={onUpload} fileName={fileName} />

        <SubmitButton onClick={handleSubmit} id={submitButtonId} />
      </div>
    </div>
  );
};

export default Chatbox;