import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paperclip, ArrowUp } from "lucide-react";

function SubmitButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      size="icon"
      className="absolute top-2 right-2 rounded-full p-3 ml-4"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}

function UploadFile({ onClick, fileName }: { onClick?: () => void; fileName?: string }) {
  return (
    <div className="absolute bottom-0 left-0 flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={onClick}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      {fileName && (
        <span className="text-xs opacity-70 overflow-hidden text-ellipsis max-w-[200px]">
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
};

export default function Chatbox({ canType = true, text = "", onSubmit, onUpload, fileName }: ChatboxProps) {
  const renderTextarea = () => (
    <div className="relative">
      <Textarea
        placeholder="Type your message here..."
        className="pr-24"
        disabled={!canType}
        defaultValue={text}
      />
      <SubmitButton onClick={onSubmit} />
      <UploadFile onClick={onUpload} fileName={fileName} />
    </div>
  );

  return renderTextarea();
}
