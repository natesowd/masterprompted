/**
 * ChatPrompt Component
 * 
 * Displays user prompts with version navigation, file attachments, and parameter displays.
 * Supports rich text formatting and version history browsing.
 * 
 * @example
 * ```tsx
 * <ChatPrompt
 *   text="User's question here"
 *   versionIndex={0}
 *   versionCount={3}
 *   onPrevVersion={goToPrev}
 *   onNextVersion={goToNext}
 * />
 * ```
 */

import { Paperclip, ChevronLeft, ChevronRight } from "lucide-react";
import RichText from "./RichText";
import type { Parameters } from "@/pages/PromptPlayground";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const promptVariants = cva(
  "mb-6 mx-2 max-w-fit ml-auto bg-muted relative",
  {
    variants: {
      variant: {
        default: "bg-muted",
        highlighted: "bg-muted/80 ring-2 ring-primary"
      },
      size: {
        default: "p-5 max-w-[80%]",
        compact: "p-3 max-w-[70%]",
        full: "p-6 max-w-[90%]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

type ChatPromptProps = VariantProps<typeof promptVariants> & {
  /** The prompt text to display */
  text: string;
  /** Optional attached file name */
  fileName?: string;
  /** System parameters used for this prompt */
  parameters?: Parameters;
  /** Current version index (0-based) */
  versionIndex?: number;
  /** Total number of versions */
  versionCount?: number;
  /** Callback to navigate to previous version */
  onPrevVersion?: () => void;
  /** Callback to navigate to next version */
  onNextVersion?: () => void;
};

const ChatPrompt = ({ 
  text, 
  fileName, 
  parameters, 
  versionIndex = 0, 
  versionCount = 1, 
  onPrevVersion, 
  onNextVersion,
  variant,
  size 
}: ChatPromptProps) => {
  const paramString = parameters && Object.entries(parameters)
    .filter(([, value]) => value)
    .map(([key, value]) => `${value}`)
    .join(', ');

  return (
    <div
      className={cn(promptVariants({ variant, size }))}
      style={{ borderRadius: '20px' }}
    >
      {/* Main message text */}
      <RichText
        text={text}
        className="text-foreground leading-relaxed"
      />
      {(fileName || versionCount > 1) && (
        <div className="flex justify-between items-center mt-2">
          {/* Left side: Parameters and Attachments */}
          <div className="flex flex-col items-start gap-1">
            {versionIndex > 0 && paramString && (
              <p className="text-xs text-muted-foreground italic">
                {paramString}
              </p>
            )}
            {fileName && (
              <div className="inline-flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">
                  {fileName}
                </span>
              </div>
            )}
          </div>

          {/* Right side: Version navigation - only if more than one version */}
          {versionCount > 1 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end col-start-2">
              <button
                type="button"
                onClick={onPrevVersion}
                disabled={versionIndex <= 0}
                className="inline-flex items-center justify-center h-6 w-6 rounded-full disabled:opacity-50"
                aria-label="Previous version"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>{versionIndex + 1} / {versionCount}</span>
              <button
                type="button"
                onClick={onNextVersion}
                disabled={versionIndex >= versionCount - 1}
                className="inline-flex items-center justify-center h-6 w-6 rounded-full disabled:opacity-50"
                aria-label="Next version"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPrompt;