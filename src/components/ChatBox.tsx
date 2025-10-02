// src/components/ChatBox.tsx

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUp } from "lucide-react";

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
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

// UploadFile component
function UploadFile({ onClick, fileName }: { onClick?: () => void; fileName?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="rounded-full h-6 w-6" onClick={onClick}>
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
    <div className="relative mb-4 max-w-3xl bg-white border border-gray-200 shadow-lg rounded-3xl pl-6 pr-16 py-4">
      {/* Submit button - positioned in top right */}
      <div className="absolute top-4 right-4">
        <SubmitButton onClick={handleSubmit} id={submitButtonId} />
      </div>
      
      {/* Text area - takes up most of the space */}
      <Textarea
        placeholder="Type your message here..."
        className="mb-6 border-none bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[120px] text-base leading-6 text-gray-900 font-['Manrope']"
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
      
      {/* Upload file button - positioned in bottom left */}
      <div className="absolute bottom-4 left-6">
        <UploadFile onClick={onUpload} fileName={fileName} />
      </div>
    </div>
  );
};

export default Chatbox;