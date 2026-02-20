import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { useRef } from "react";

type ChatBoxDummyProps = {
  value: string;
  onSubmit?: (value: string) => void;
  submitButtonId?: string;
  id?: string;
};

const ChatBoxDummy = ({ value, onSubmit, submitButtonId, id = "chatbox-dummy" }: ChatBoxDummyProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    textareaRef.current?.blur();
    if (onSubmit) onSubmit(value);
  };

  return (
    <div
      id={id}
      className="relative bg-card border border-border rounded-2xl shadow-lg max-w-3xl"
    >
      <div className="absolute top-4 right-4 z-10">
        <Button
          id={submitButtonId}
          onClick={handleSubmit}
          variant="default"
          size="icon"
          className="rounded-full h-10 w-10"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <Textarea
        value={value}
        readOnly
        disabled
        ref={textareaRef}
        placeholder="Type your message here..."
        className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-6 py-4 mb-4 pr-16 leading-relaxed text-card-foreground font-['Manrope'] text-lg min-h-0 resize-none"
      />
    </div>
  );
};

export default ChatBoxDummy;

