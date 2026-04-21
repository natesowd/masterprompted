/**
 * ChatBox Component
 * 
 * A controlled, resizable chatbox with file upload support and animated feedback.
 * Features include keyboard shortcuts, submit button, and loading states.
 * 
 * @example
 * ```tsx
 * <ChatBox
 *   value={message}
 *   onChange={setMessage}
 *   onSubmit={handleSubmit}
 *   files={attachments}
 * />
 * ```
 */

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, Paperclip, RefreshCcw, SendHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const chatboxVariants = cva(
  "relative bg-card border border-border rounded-2xl shadow-lg w-full flex flex-col",
  {
    variants: {
      size: {
        default: "min-w-0 min-h-[190px] max-h-[460px]",
        compact: "min-w-0 min-h-[120px] max-h-[300px]",
        expanded: "min-w-0 min-h-[240px] max-h-[540px]"
      },
      state: {
        default: "",
        bouncing: "bounce-once",
        disabled: "opacity-60 cursor-not-allowed"
      }
    },
    defaultVariants: {
      size: "default",
      state: "default"
    }
  }
);

/**
 * Submit button for the chatbox
 */
function SubmitButton({ onClick, id, disableSend }: { onClick?: (e?: React.MouseEvent) => void; id?: string; disableSend?: boolean; }) {
  return (
    <Button
      id={id}
      onClick={onClick}
      variant="default"
      size="icon"
      className="rounded-full h-10 w-10"
      disabled={disableSend}>

      <SendHorizontal className="h-5 w-5" />
    </Button>);

}

type ChatboxProps = VariantProps<typeof chatboxVariants> & {
  /** Controlled value for the textarea */
  value: string;
  /** Callback when textarea content changes */
  onChange: (value: string) => void;
  /** Callback when form is submitted */
  onSubmit?: (value: string) => void;
  /** ID for the submit button element */
  submitButtonId?: string;
  /** Disables the submit button */
  disableSend?: boolean;
  /** Numeric key that triggers bounce animation when changed */
  animationKey?: number;
  /** ID for the chatbox container */
  id?: string;
  /** Shows loading skeleton instead of textarea */
  waitingforOptimization?: boolean;
  /** Callback when files are uploaded */
  onUploadFiles?: (files: FileList | File[]) => void;
  /** Array of attached files */
  files?: { name: string; isUploading?: boolean; }[];
  /** Callback to remove a file by index */
  onRemoveFile?: (index: number) => void;
  /** Makes the textarea read-only */
  readOnly?: boolean;
  /** Hides the submit button */
  hideSubmitButton?: boolean;
  /** Auto-resize textarea height to fit content */
  autoResize?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback to regenerate the current optimization */
  onRegenerate?: () => void;
  /** Whether to show the regenerate button */
  showRegenerate?: boolean;
  /** Whether web search mode is enabled */
  webSearchEnabled?: boolean;
  /** Callback to toggle web search mode */
  onToggleWebSearch?: () => void;
};

const Chatbox = ({
  value,
  onChange,
  onSubmit,
  submitButtonId,
  id = 'chatbox',
  disableSend = false,
  animationKey,
  waitingforOptimization,
  onUploadFiles,
  files = [],
  onRemoveFile,
  readOnly = false,
  hideSubmitButton = false,
  autoResize = false,
  className = "",
  size,
  state,
  onRegenerate,
  showRegenerate = false,
  webSearchEnabled = false,
  onToggleWebSearch,
}: ChatboxProps) => {
  // Controlled-only component: `value` drives the textarea and `onChange` must be provided.

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [value, autoResize]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Local state to trigger a one-shot bounce animation when an external "animationKey" changes
  const [isBouncing, setIsBouncing] = useState(false);

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
    } if (onSubmit) onSubmit(value); // Do not clear `value` here; parent controls the value and should decide what to show after submit.
  }; // Play animation when parent bumps the animationKey prop (increments).
  // Attach listeners per-trigger and use a fallback in case the animation doesn't run
  useEffect(() => {
    if (typeof animationKey !== "number") return; // Respect user preference for reduced motion
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('prefers-reduced-motion is set; skipping bounce');
      return;
    }

    const el = containerRef.current;
    if (!el) {
      console.warn('Chatbox container not mounted; cannot play bounce');
      return;
    }

    // console.log('Chatbox: triggering bounce animation (animationKey=', animationKey, ')');
    // Try Web Animations API first for reliable control
    const keyframes: Keyframe[] = [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-6px)' },
      { transform: 'translateY(2px)' },
      { transform: 'translateY(0)' }];

    const options: KeyframeAnimationOptions = { duration: 350, easing: 'cubic-bezier(.25,.8,.25,1)', fill: 'both' };

    let wa: Animation | null = null;
    try {
      if ((el as any).animate) {
        setIsBouncing(true);
        wa = (el as any).animate(keyframes, options);
        wa.addEventListener('finish', () => {
          // console.log('Chatbox WA finished');
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

  const UploadFile = () =>
    <div className="flex items-center gap-2 w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && onUploadFiles) {
            onUploadFiles(e.target.files);
          }
          e.target.value = "";
        }} />

      {onRegenerate && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-4 w-4 flex-shrink-0"
              type="button"
              disabled={!showRegenerate}
              onClick={() => onRegenerate?.()}
            >
              <RefreshCcw className={cn("h-4 w-4", !showRegenerate ? "text-muted-foreground/30" : "text-muted-foreground")} />
            </Button>
          </TooltipTrigger>
          {showRegenerate && (
            <TooltipContent className="px-3 py-1.5 text-xs">
              Regenerate optimization
            </TooltipContent>
          )}
        </Tooltip>
      )}
      {onToggleWebSearch && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full h-4 w-4 flex-shrink-0",
                webSearchEnabled && "bg-blue-100"
              )}
              type="button"
              onClick={onToggleWebSearch}
            >
              <Globe className={cn("h-4 w-4", webSearchEnabled ? "text-blue-600" : "text-muted-foreground")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="px-3 py-1.5 text-xs">
            {webSearchEnabled ? "Disable web search" : "Enable web search"}
          </TooltipContent>
        </Tooltip>
      )}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-4 w-4 flex-shrink-0"
            type="button"
            disabled={webSearchEnabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className={cn("h-4 w-4", webSearchEnabled ? "text-muted-foreground/30" : "text-muted-foreground")} />
          </Button>
        </TooltipTrigger>
        {!webSearchEnabled && (
          <TooltipContent className="px-3 py-1.5 text-xs">
            Upload PDF
          </TooltipContent>
        )}
      </Tooltip>
      <div className="flex-1 flex flex-wrap items-center gap-1 max-w-[250px] max-h-[1.75rem] overflow-y-auto">
        {files.map((file, index) =>
          <div
            key={`${file.name}-${index}`}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground max-w-[100%] overflow-hidden">

            <span className="truncate">{file.name}</span>
            {file.isUploading ?
              <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" /> :

              <button
                type="button"
                className="ml-0.5 text-[10px] leading-none text-muted-foreground/80 hover:text-foreground"
                onClick={() => onRemoveFile?.(index)}
              >
                x
              </button>
            }
          </div>
        )}
      </div>
    </div>;


  return (
    <div
      ref={containerRef}
      id={id}
      className={cn(
        chatboxVariants({
          size,
          state: isBouncing ? "bouncing" : state
        }),
        autoResize && "max-h-none min-h-0",
        className
      )}
      style={{
        resize: autoResize ? 'none' : 'both',
        overflow: autoResize ? 'visible' : 'auto',
        maxWidth: '100%'
      }}
      aria-roledescription="Resizable chatbox">

      {/* Submit button - positioned in top right */}
      {!hideSubmitButton &&
        <div className="absolute top-3 right-3 z-10">
          <SubmitButton onClick={handleSubmit} id={submitButtonId} disableSend={disableSend} />
        </div>
      }
      {/* Text area - takes up most of the space */}
      {!waitingforOptimization &&
        <Textarea
          placeholder="Type your message here..."
          className={cn("border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 mt-2 mb-2 pl-4 leading-relaxed text-card-foreground font-['Manrope'] text-md resize-none mx-0",
            hideSubmitButton ? "pr-4" : "pr-16",
            autoResize ? "h-auto overflow-hidden" : "flex-1 h-full min-h-0 overflow-y-auto"
          )}
          value={value}
          onChange={handleInputChange}
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (!e.shiftKey) {
                e.preventDefault();
                if (!disableSend) {
                  handleSubmit();
                }
              }
            }
          }}
          readOnly={readOnly} />

      }
      {waitingforOptimization &&
        <div
          className={cn(
            "border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-4 py-4 text-lg leading-relaxed text-card-foreground font-['Manrope'] flex-1 h-full min-h-[140px] resize-none overflow-y-auto",
            hideSubmitButton ? "pr-4" : "pr-16"
          )}>
          <Skeleton className="mt-2 h-4 w-[180px]" />
          <Skeleton className="mt-2 h-4 w-[150px]" />
        </div>
      }
      <div className="px-2 pb-2">
        <UploadFile />
      </div>
    </div>);

};

export default Chatbox;