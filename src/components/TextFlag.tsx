/**
 * TextFlag Component
 *
 * Inline text annotation with evaluation criteria icons and hover explanations.
 * Automatically syncs highlighting with evaluation panel criteria.
 * Supports paginated explanations when multiple evaluations overlap.
 */

import { useEffect, useRef, useState } from "react";
import { ListChecks, Target, Mic, Scale, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import RichText from "@/components/RichText.tsx";
import FeatureHighlight from "@/components/FeatureHighlight";

/* ------------------------------------------------------------------ */
/*  First-in-session intro highlight                                   */
/* ------------------------------------------------------------------ */
// Module-level singleton: only the first TextFlag to become visible in a
// session claims the intro highlight. Resets on full page reload.
const INTRO_SESSION_KEY = "textflag-intro-shown";
let introHighlightClaimed = false;

const textFlagVariants = cva(
  "inline cursor-pointer",
  {
    variants: {
      severity: {
        error: "[&>a]:decoration-red-500 [&>span]:decoration-red-500",
        warning: "[&>a]:decoration-yellow-600 [&>span]:decoration-yellow-600",
        info: "[&>a]:decoration-blue-500 [&>span]:decoration-blue-500",
        success: "[&>a]:decoration-green-600 [&>span]:decoration-green-600"
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

const severityIconColor: Record<string, string> = {
  error: "text-red-500",
  warning: "text-yellow-600",
  info: "text-blue-500",
  success: "text-green-600",
};

const severityHeadingColor: Record<string, string> = {
  error: "text-red-600",
  warning: "text-yellow-700",
  info: "text-blue-600",
  success: "text-green-700",
};

const severityBorderColor: Record<string, string> = {
  error: "border-red-200",
  warning: "border-yellow-200",
  info: "border-blue-200",
  success: "border-green-200",
};

const severityUnderline: Record<string, string> = {
  error: "decoration-red-500",
  warning: "decoration-yellow-600",
  info: "decoration-blue-500",
  success: "decoration-green-600",
};

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
  /** Whether to show the flag icon. Defaults to true. Set false for continuation chunks of the same region. */
  showIcon?: boolean;
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
  noUnderline,
  showIcon = true
}: TextFlagProps) {
  const Icon = iconMap[evaluationFactor];
  const [hoverCardOpen, setHoverCardOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const { t } = useLanguage();
  const { registerFactor, deregisterFactor } = useEvaluation();

  // Intro FeatureHighlight — shown once per session, on the first
  // TextFlag that becomes visible in the viewport.
  const [showIntroHighlight, setShowIntroHighlight] = useState(false);
  const introIdRef = useRef(`textflag-intro-${Math.random().toString(36).slice(2, 9)}`);
  const introId = introIdRef.current;

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

  // Claim the intro highlight the first time this flag intersects the viewport
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(INTRO_SESSION_KEY)) return;
    } catch {
      /* ignore */
    }
    if (introHighlightClaimed) return;

    const el = document.getElementById(introId);
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !introHighlightClaimed) {
            introHighlightClaimed = true;
            observer.disconnect();
            // Small delay so FeatureHighlight measurement is stable
            window.setTimeout(() => setShowIntroHighlight(true), 350);
            return;
          }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [introId]);

  const handleCloseIntroHighlight = () => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowIntroHighlight(false);
  };

  const activeHref = currentPage?.href ?? href;
  const sev = severity ?? "error";
  const iconColor = severityIconColor[sev];
  const headingColor = severityHeadingColor[sev];
  const borderColor = severityBorderColor[sev];
  const underlineColor = severityUnderline[sev];

  return (
    <>
    <HoverCard open={hoverCardOpen} onOpenChange={setHoverCardOpen}>
      <HoverCardTrigger asChild>
        <span
          id={introId}
          className={cn(textFlagVariants({ severity, noUnderline }), "inline whitespace-normal", className)}
          onClick={(e) => {
            e.stopPropagation();
            setHoverCardOpen(!hoverCardOpen);
          }}
        >
          {showIcon && <Icon className={cn("inline-block h-4 w-4 align-middle mr-1", iconColor)} />}
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
              className={cn("underline decoration-2 underline-offset-2 text-current", underlineColor)}
              {...(isHtml ? { dangerouslySetInnerHTML: { __html: text } } : { children: <RichText text={text} inline /> })}
            />
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        className={cn("w-80 max-w-[85vw] bg-card shadow-lg rounded-lg p-3 overflow-hidden", borderColor)}
        sideOffset={5}
      >
        <div className="space-y-2 overflow-hidden">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Icon className={cn("h-4 w-4 flex-shrink-0", iconColor)} />
            <h4 className={cn("font-semibold text-sm", headingColor)}>{t(`components.textFlag.type.${evaluationFactor}`)}</h4>
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
          <div className="text-sm text-foreground font-normal leading-relaxed break-words whitespace-normal overflow-wrap-anywhere text-left max-h-48 overflow-y-auto">
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

    {showIntroHighlight && (
      <FeatureHighlight
        target={`#${introId}`}
        open={showIntroHighlight}
        onClose={handleCloseIntroHighlight}
        side="bottom"
        closeLabel="Got it"
      >
        <div className="space-y-3">
          <p className="font-semibold text-base">Highlighted text</p>
          <p>
            Whenever you see an <span className="underline decoration-white/80 decoration-2 underline-offset-2">underlined phrase</span>, hover over it or click it to read an explanation of why it&apos;s been flagged.
          </p>
          <div className="pt-1">
            <p className="font-semibold text-sm mb-2">Underline colour shows severity:</p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
                <span><strong>Red</strong> — a big problem (e.g. fabricated quote, factual error)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-yellow-300 flex-shrink-0" />
                <span><strong>Yellow</strong> — potentially dangerous (e.g. misleading tone)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-green-300 flex-shrink-0" />
                <span><strong>Green</strong> — something the model did well</span>
              </li>
            </ul>
          </div>
        </div>
      </FeatureHighlight>
    )}
    </>
  );
}
