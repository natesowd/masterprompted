/**
 * TextFlag Component
 * 
 * Inline text annotation with evaluation criteria icons and hover explanations.
 * Automatically syncs highlighting with evaluation panel criteria.
 * 
 * @example
 * ```tsx
 * <TextFlag
 *   text="disputed claim"
 *   evaluationFactor="factual_accuracy"
 *   explanation="This claim lacks verification"
 *   href="https://source.com"
 * />
 * ```
 */

import { useEffect, useState } from "react";
import { ListChecks, Target, Mic, Scale, Copy } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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

interface TextFlagProps extends VariantProps<typeof textFlagVariants> {
  /** The text to display with the flag */
  text: string;
  /** The evaluation criterion this flag represents */
  evaluationFactor: "factual_accuracy" | "relevance" | "voice" | "bias" | "plagiarism";
  /** Explanation shown in hover card */
  explanation: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Optional external link URL */
  href?: string;
}

export default function TextFlag({ 
  text, 
  evaluationFactor, 
  explanation, 
  className = "", 
  href,
  severity,
  noUnderline
}: TextFlagProps) {
  const Icon = iconMap[evaluationFactor];
  const label = labelMap[evaluationFactor];
  const [hoverCardOpen, setHoverCardOpen] = useState(false);
  const { t } = useLanguage();
  
  // Highlight the corresponding evaluation criterion when component is mounted
  useEffect(() => {
    const criterionElement = document.querySelector(`[data-criterion-id="${evaluationFactor}"]`);
    if (criterionElement) {
      const triggerElement = criterionElement.querySelector('[data-radix-collection-item]') || 
                            criterionElement.querySelector('.flex.items-center.justify-between') ||
                            criterionElement.querySelector('button') ||
                            criterionElement.querySelector('[role="button"]');
      if (triggerElement) {
        triggerElement.classList.add('ring-2', 'ring-red-500', 'bg-red-50');
        triggerElement.classList.remove('bg-muted', 'hover:bg-muted/80');
      }
    }

    // Cleanup: remove highlighting when component unmounts
    return () => {
      if (criterionElement) {
        const triggerElement = criterionElement.querySelector('[data-radix-collection-item]') || 
                              criterionElement.querySelector('.flex.items-center.justify-between') ||
                              criterionElement.querySelector('button') ||
                              criterionElement.querySelector('[role="button"]');
        if (triggerElement) {
          triggerElement.classList.remove('ring-2', 'ring-red-500', 'bg-red-50');
          triggerElement.classList.add('bg-muted', 'hover:bg-muted/80');
        }
      }
    };
  }, [evaluationFactor]);

  return (
    <HoverCard open={hoverCardOpen} onOpenChange={setHoverCardOpen}>
      <HoverCardTrigger asChild>
        <span 
          className={cn(textFlagVariants({ severity, noUnderline }), "inline-flex items-center gap-0.5 whitespace-nowrap", className)}
          onClick={(e) => {
            e.stopPropagation();
            setHoverCardOpen(!hoverCardOpen);
          }}
        >
          <Icon className="inline-block h-3 w-3 text-destructive flex-shrink-0" />
          {href ? (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline decoration-2 underline-offset-2 text-current hover:opacity-80"
              onClick={(e) => e.stopPropagation()}
            >
              {text}
            </a>
          ) : (
            <span className="underline decoration-2 underline-offset-2 text-current">
              {text}
            </span>
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
          </div>
          <p className="text-sm text-foreground font-normal leading-relaxed break-words whitespace-normal overflow-wrap-anywhere text-left">
            {explanation}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
