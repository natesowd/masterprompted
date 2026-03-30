/**
 * TextFlag Component
 *
 * Inline text annotation with evaluation criteria icons and hover explanations.
 * Automatically syncs highlighting with evaluation panel criteria.
 * Supports paginated explanations when multiple evaluations overlap.
 */

import { useEffect, useState } from "react";
import { ListChecks, Target, Mic, Scale, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import RichText from "@/components/RichText.tsx";

const textFlagVariants = cva(
  "inline cursor-pointer",
  {
    variants: {
      severity: {
        error: "[&>a]:decoration-destructive [&>span]:decoration-destructive",
        warning: "[&>a]:decoration-yellow-600 [&>span]:decoration-yellow-600",
        info: "[&>a]:decoration-blue-500 [&>span]:decoration-blue-500"
      },
      noUnderline: {
        true: "[&>span]:no-underline [&>a]:no-underline",
        false: ""
      }
    },
    defaultVariants: {
      severity: "error",
      noUnderline: false
    }
  }
);

const iconMap = {
  "factual_accuracy": ListChecks,
  "relevance": Target,
  "voice": Mic,
  "bias": Scale,
  "plagiarism": Copy,
};

const labelMap = {
  "factual_accuracy": "Factual Accuracy",
  "relevance": "Relevance",
  "voice": "Voice",
  "bias": "Bias",
  "plagiarism": "Plagiarism",
};

export interface ExplanationEntry {
  explanation: string;
  href?: string;
  source: string;
}

interface TextFlagProps extends VariantProps<typeof textFlagVariants> {
  /** The text to display with the flag */
  text: string;
  /** Whether the text contains HTML that should be rendered */
  isHtml?: boolean;
  /** The evaluation criterion this flag represents */
  evaluationFactor: "factual_accuracy" | "relevance" | "voice" | "bias" | "plagiarism";
  /** Single explanation (backward compat) */
  explanation?: React.ReactNode;
  /** Multiple explanations for paginated display */
  explanations?: ExplanationEntry[];
  /** Additional CSS classes */
  className?: string;
  /** Optional external link URL (used when single explanation) */
  href?: string;
}

export default function TextFlag({
  text,
  isHtml = false,
  evaluationFactor,
  explanation,
  explanations,
  className = "",
  href,
  severity,
  noUnderline
}: TextFlagProps) {
  const Icon = iconMap[evaluationFactor];
  const [hoverCardOpen, setHoverCardOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const { t } = useLanguage();
  const { registerFactor, deregisterFactor } = useEvaluation();

  // Build the list of pages from either explanations array or single explanation
  const pages: ExplanationEntry[] = explanations && explanations.length > 0
    ? explanations
    : explanation != null
      ? [{ explanation: typeof explanation === 'string' ? explanation : '', href, source: '' }]
      : [];

  const totalPages = pages.length;
  const currentPage = pages[Math.min(pageIndex, totalPages - 1)] ?? pages[0];
  const hasMultiplePages = totalPages > 1;

  // Reset page index when hover card closes
  useEffect(() => {
    if (!hoverCardOpen) setPageIndex(0);
  }, [hoverCardOpen]);

  useEffect(() => {
    registerFactor(evaluationFactor);
    return () => {
      deregisterFactor(evaluationFactor);
    };
  }, [evaluationFactor, registerFactor, deregisterFactor]);

  const activeHref = currentPage?.href ?? href;

  return (
    <HoverCard open={hoverCardOpen} onOpenChange={setHoverCardOpen}>
      <HoverCardTrigger asChild>
        <span
          className={cn(textFlagVariants({ severity, noUnderline }), "inline whitespace-normal", className)}
          onClick={(e) => {
            e.stopPropagation();
            setHoverCardOpen(!hoverCardOpen);
          }}
        >
          <Icon className="inline-block h-4 w-4 text-destructive align-middle mr-1" />
          {activeHref ? (
            <a
              href={activeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-2 underline-offset-2 text-current hover:opacity-80"
              onClick={(e) => e.stopPropagation()}
              {...(isHtml ? { dangerouslySetInnerHTML: { __html: text } } : { children: <RichText text={text} inline /> })}
            />
          ) : (
            <span
              className="underline decoration-2 underline-offset-2 decoration-destructive text-current"
              {...(isHtml ? { dangerouslySetInnerHTML: { __html: text } } : { children: <RichText text={text} inline /> })}
            />
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-72 max-w-[85vw] bg-card border-destructive/20 shadow-lg rounded-lg p-3 overflow-hidden"
        sideOffset={5}
      >
        <div className="space-y-2 overflow-hidden">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Icon className="h-4 w-4 text-destructive flex-shrink-0" />
            <h4 className="font-semibold text-destructive text-sm">{t(`components.textFlag.type.${evaluationFactor}`)}</h4>
            {hasMultiplePages && (
              <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setPageIndex(Math.max(0, pageIndex - 1)); }}
                  disabled={pageIndex === 0}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous explanation"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {pageIndex + 1}/{totalPages}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setPageIndex(Math.min(totalPages - 1, pageIndex + 1)); }}
                  disabled={pageIndex >= totalPages - 1}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next explanation"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="text-sm text-foreground font-normal leading-relaxed break-words whitespace-normal overflow-wrap-anywhere text-left">
            {currentPage && typeof currentPage.explanation === 'string' && currentPage.explanation
              ? <RichText text={currentPage.explanation} prose={false} />
              : (typeof explanation !== 'string' && explanation != null)
                ? explanation
                : null
            }
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
