/**
 * SectionFlag Component
 * 
 * Highlights problematic sections with evaluation criteria badges and hover explanations.
 * Automatically syncs with evaluation panel highlighting.
 * 
 * @example
 * ```tsx
 * <SectionFlag
 *   evaluationFactor="factual_accuracy"
 *   explanation="This section contains unverified claims"
 * >
 *   <p>Content to be flagged...</p>
 * </SectionFlag>
 * ```
 */

import { useEffect, ReactNode } from "react";
import { ListChecks, Target, Mic, Scale, Copy } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useLanguage } from "@/contexts/LanguageContext";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionFlagVariants = cva(
  "relative border-2 rounded p-3 cursor-pointer",
  {
    variants: {
      severity: {
        error: "border-red-500",
        warning: "border-yellow-500",
        info: "border-blue-500"
      },
      size: {
        default: "p-3",
        compact: "p-2",
        spacious: "p-4"
      }
    },
    defaultVariants: {
      severity: "error",
      size: "default"
    }
  }
);

const iconBadgeVariants = cva(
  "absolute rounded-full p-1 shadow-md",
  {
    variants: {
      severity: {
        error: "bg-white text-red-500",
        warning: "bg-white text-yellow-600",
        info: "bg-white text-blue-500"
      },
      position: {
        topRight: "-top-3 -right-3",
        topLeft: "-top-3 -left-3",
        bottomRight: "-bottom-3 -right-3"
      }
    },
    defaultVariants: {
      severity: "error",
      position: "topRight"
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

interface SectionFlagProps extends VariantProps<typeof sectionFlagVariants> {
  /** Child elements to wrap with the flag */
  children: ReactNode;
  /** The evaluation criterion this flag represents */
  evaluationFactor: "factual_accuracy" | "relevance" | "voice" | "bias" | "plagiarism";
  /** Explanation text shown in hover card */
  explanation: string;
  /** Additional CSS classes */
  className?: string;
}

export default function SectionFlag({ 
  children, 
  evaluationFactor, 
  explanation, 
  className = "",
  severity,
  size 
}: SectionFlagProps) {
  const labelMap = {
    "factual_accuracy": "Factual Accuracy",
    "relevance": "Relevance",
    "voice": "Voice",
    "bias": "Bias",
    "plagiarism": "Plagiarism",
  };
  
  const Icon = iconMap[evaluationFactor];
  const label = labelMap[evaluationFactor];
  const { t } = useLanguage();

  // Highlight the corresponding evaluation criterion when component is mounted
  useEffect(() => {
    const criterionElement = document.querySelector(`[data-criterion-id="${evaluationFactor}"]`);
    if (criterionElement) {
      const triggerElement = criterionElement.querySelector('[data-radix-collection-item]') ||
        criterionElement.querySelector('.flex.items-center.justify-between');
      if (triggerElement) {
        triggerElement.classList.add('ring-2', 'ring-red-500', 'bg-red-50');
        triggerElement.classList.remove('bg-gray-50', 'hover:bg-gray-100');
      }
    }

    // Cleanup: remove highlighting when component unmounts
    return () => {
      if (criterionElement) {
        const triggerElement = criterionElement.querySelector('[data-radix-collection-item]') ||
          criterionElement.querySelector('.flex.items-center.justify-between');
        if (triggerElement) {
          triggerElement.classList.remove('ring-2', 'ring-red-500', 'bg-red-50');
          triggerElement.classList.add('bg-gray-50', 'hover:bg-gray-100');
        }
      }
    };
  }, [evaluationFactor]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={cn(sectionFlagVariants({ severity, size }), className)}>
          <div className={cn(iconBadgeVariants({ severity }))}>
            <Icon className="h-4 w-4" />
          </div>
          {children}
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80 bg-white border border-red-200 shadow-lg rounded-lg p-4"
        sideOffset={5}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-red-500" />
            <h4 className="font-semibold text-red-700 text-sm">{t(`components.textFlag.type.${evaluationFactor}`)}</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {explanation}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
