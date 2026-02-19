import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock } from "lucide-react";

/**
 * A single entry in the prompt history log.
 */
export interface PromptHistoryEntry {
  /** The prompt text that was sent */
  prompt: string;
  /** Timestamp when the prompt was sent */
  timestamp: Date;
  /** Optional list of parameter labels that were active */
  activeParameters?: string[];
}

interface PromptHistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: PromptHistoryEntry[];
  className?: string;
}

/**
 * Slide-out panel displaying a chronological list of previously sent prompts.
 */
export default function PromptHistoryPanel({
  open,
  onOpenChange,
  history,
  className,
}: PromptHistoryPanelProps) {
  const { t } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className={`w-[360px] sm:w-[400px] ${className ?? ""}`}>
        <SheetHeader>
          <SheetTitle className="text-lg font-bold text-foreground">
            {t("components.promptControls.promptHistory")}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Clock className="w-8 h-8" />
              <p className="text-sm">{t("components.promptControls.noHistory")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pr-4">
              {[...history].reverse().map((entry, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-card p-3 space-y-2"
                >
                  <p className="text-sm text-foreground leading-relaxed">
                    {entry.prompt}
                  </p>
                  {entry.activeParameters && entry.activeParameters.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.activeParameters.map((param) => (
                        <span
                          key={param}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-brand-secondary-50 text-brand-secondary-700 font-medium"
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {entry.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
