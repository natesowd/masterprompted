// src/components/ChatBox.tsx

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, SendHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// SubmitButton component
function SubmitButton({ onClick, id, disableSend }: { onClick?: (e?: React.MouseEvent) => void; id?: string; disableSend?: boolean }) {
  return (
    <Button
      id={id}
      onClick={onClick}
      variant="default"
      size="icon"
      className="rounded-full h-10 w-10"
      disabled={disableSend}
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
        <Paperclip className="h-4 w-4 text-muted-foreground" />
      </Button>
      {fileName && (
        <span className="text-sm text-muted-foreground overflow-hidden text-ellipsis max-w-[100px]">
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
  disableSend?: boolean;
  // A numeric key that increments when an external event wants the chatbox to animate
  animationKey?: number;
  // When true, the chatbox will expand to fill its parent's height
  fullHeight?: boolean;
  id?: string;
};

const Chatbox = ({ canType = true, value, onChange, onSubmit, onUpload, fileName, submitButtonId, id='chatbox', fullHeight = false, disableSend = false, animationKey }: ChatboxProps) => {
  // Controlled-only component: `value` drives the textarea and `onChange` must be provided.

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Local state to trigger a one-shot bounce animation when an external "animationKey" changes
  const [isBouncing, setIsBouncing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    // remove focus from the textarea so the caret disappears
    if (textareaRef.current) {
      try {
        textareaRef.current.blur();
      } catch (err) {
        // ignore
      }
    }
    if (onSubmit) onSubmit(value);
    // Do not clear `value` here; parent controls the value and should decide what to show after submit.
  };

  // Play animation when parent bumps the animationKey prop (increments).
  // Attach listeners per-trigger and use a fallback in case the animation doesn't run
  useEffect(() => {
    if (typeof animationKey !== "number") return;

    // Respect user preference for reduced motion
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('prefers-reduced-motion is set; skipping bounce');
      return;
    }

    const el = containerRef.current;
    if (!el) {
      console.warn('Chatbox container not mounted; cannot play bounce');
      return;
    }

    console.log('Chatbox: triggering bounce animation (animationKey=', animationKey, ')');
    // Try Web Animations API first for reliable control
    const keyframes: Keyframe[] = [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-6px)' },
      { transform: 'translateY(2px)' },
      { transform: 'translateY(0)' },
    ];
    const options: KeyframeAnimationOptions = { duration: 350, easing: 'cubic-bezier(.25,.8,.25,1)', fill: 'both' };

    let wa: Animation | null = null;
    try {
      if ((el as any).animate) {
        setIsBouncing(true);
        wa = (el as any).animate(keyframes, options);
        wa.addEventListener('finish', () => {
          console.log('Chatbox WA finished');
          setIsBouncing(false);
        });
        // Safety: if the animation is cancelled or doesn't finish, clear after a timeout
        const durationNum = typeof options.duration === 'number' ? options.duration : Number(options.duration || 350);
        const safety = window.setTimeout(() => setIsBouncing(false), durationNum + 150);
        return () => {
          if (wa) wa.cancel();
          window.clearTimeout(safety);
        };
      }
    } catch (e) {
      console.warn('Web Animations API failed, falling back to CSS class', e);
    }

    // Fallback: use CSS class and timeout
    setIsBouncing(true);
    const fallback = window.setTimeout(() => {
      setIsBouncing(false);
    }, 500);
    return () => {
      window.clearTimeout(fallback);
    };
  }, [animationKey]);

  return (
  <div ref={containerRef} id={id} className={`relative bg-card border border-border rounded-lg shadow-md ${fullHeight ? 'h-full flex flex-col min-h-0' : 'max-w-3xl'} ${isBouncing ? 'bounce-once' : ''}`}>
      {/* Submit button - positioned in top right */}
      <div className="absolute top-4 right-4 z-10">
        <SubmitButton onClick={handleSubmit} id={submitButtonId} disableSend={disableSend} />
      </div>

      {/* Text area - takes up most of the space */}
      <Textarea
        placeholder="Type your message here..."
        className={`border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-6 py-4 pr-16 text-base leading-6 text-card-foreground font-['Manrope'] ${fullHeight ? 'flex-1 min-h-0 resize-none overflow-y-auto' : 'min-h-[100px] resize-none'}`}
        disabled={!canType}
        value={value}
        onChange={handleInputChange}
        ref={textareaRef}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
    </div>
  );
};

export default Chatbox;
