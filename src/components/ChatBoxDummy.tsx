import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { useRef, useEffect } from "react";

type ChatBoxDummyProps = {
  value: string;
  onSubmit?: (value: string) => void;
  submitButtonId?: string;
  id?: string;
  className?: string;
};

const ChatBoxDummy = ({ value, onSubmit, submitButtonId, id = "chatbox-dummy", className }: ChatBoxDummyProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [value]);

  const handleSubmit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    textareaRef.current?.blur();
    if (onSubmit) onSubmit(value);
  };

  return (
    <div
      id={id}
      className={cn("relative bg-card border border-border rounded-2xl shadow-lg max-w-3xl", className)}
    >
      <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10">
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
        className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-6 py-3 pr-16 leading-relaxed text-card-foreground font-['Manrope'] text-lg min-h-0 h-auto resize-none overflow-hidden"
        style={{ height: 'auto' }}
        onInput={(e) => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }}
      />
    </div>
  );
};

export default ChatBoxDummy;

