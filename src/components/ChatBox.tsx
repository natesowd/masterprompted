import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type ChatboxProps = {
  canType?: boolean;
  text?: string;
};

export default function Chatbox({ canType = true, text = "" }: ChatboxProps) {
  const renderTextarea = () => (
    <div className="relative">
      <Textarea 
        placeholder="Type your message here..." 
        className="pr-24" 
        disabled={!canType} 
        defaultValue={text}
      />
      <Button 
        className="absolute bottom-2 right-2"
        size="sm"
      >
        Send
      </Button>
    </div>
  );

  return renderTextarea();
}
