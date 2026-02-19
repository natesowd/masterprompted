/**
 * EvaluationPanel Component
 * 
 * Collapsible panel displaying journalistic evaluation criteria with expandable details.
 * Features criterion highlighting, icon indicators, and localized descriptions.
 * 
 * @example
 * ```tsx
 * <EvaluationPanel
 *   initialIsOpen={true}
 *   canClose={true}
 * />
 * ```
 */

import { ListChecks, Target, Mic, Scale, Copy, ChevronDown, ListChevronsUpDown, ListChevronsDownUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const panelVariants = cva(
  "bg-transparent px-4 py-4",
  {
    variants: {
      size: {
        default: "w-[20rem]",
        compact: "w-[16rem]",
        expanded: "w-[24rem]"
      },
      state: {
        open: "opacity-100",
        minimized: "opacity-0 pointer-events-none"
      }
    },
    defaultVariants: {
      size: "default",
      state: "open"
    }
  }
);

const criterionVariants = cva(
  "flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-transparent border border-border hover:bg-muted/40",
        highlighted: "bg-background ring-1 ring-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface EvaluationPanelProps extends VariantProps<typeof panelVariants> {
  /** Whether the panel starts open */
  initialIsOpen?: boolean;
  /** Whether the panel can be minimized */
  canClose?: boolean;
}

export default function EvaluationPanel({ initialIsOpen = true, canClose = false, size }: EvaluationPanelProps) {
  const { t } = useLanguage();

  const evaluationCriteria = [
    {
      id: "factual_accuracy",
      label: t('components.evaluationPanel.criteria.factualAccuracy.label'),
      icon: ListChecks,
      description: t('components.evaluationPanel.criteria.factualAccuracy.description')
    },
    {
      id: "relevance",
      label: t('components.evaluationPanel.criteria.relevance.label'),
      icon: Target,
      description: t('components.evaluationPanel.criteria.relevance.description')
    },
    {
      id: "voice",
      label: t('components.evaluationPanel.criteria.voice.label'),
      icon: Mic,
      description: t('components.evaluationPanel.criteria.voice.description')
    },
    {
      id: "bias",
      label: t('components.evaluationPanel.criteria.bias.label'),
      icon: Scale,
      description: t('components.evaluationPanel.criteria.bias.description')
    },
    {
      id: "plagiarism",
      label: t('components.evaluationPanel.criteria.plagiarism.label'),
      icon: Copy,
      description: t('components.evaluationPanel.criteria.plagiarism.description')
    }
  ];

  // Use state to manage the main panel open state
  const [isPanelOpen, setIsPanelOpen] = useState(initialIsOpen);

  // If the parent updates `initialIsOpen` at any time, reflect that change in local state
  useEffect(() => {
    setIsPanelOpen(initialIsOpen);
  }, [initialIsOpen]);

  // Expand panel when a new factor signals via context
  const { activeEvaluationFactors, panelOpenSignal } = useEvaluation();
  useEffect(() => {
    if (panelOpenSignal > 0) {
      setIsPanelOpen(true);
    }
  }, [panelOpenSignal]);

  // State for managing which criteria item is open
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem(prev => prev === id ? null : id);
  };

  return (
    <div className="z-10 [&_*]:!font-heading">
      <div className={cn(isPanelOpen ? panelVariants({ size, state: "open" }) : "")}>
        {isPanelOpen ? (
          <>
            {/* Header with title and minimize toggle */}
            <div className="w-full flex items-center justify-between text-lg font-semibold font-heading text-card-foreground mb-2">
              <span>{t('components.evaluationPanel.title')}</span>
              {canClose && (
                <button
                  aria-label={t('components.evaluationPanel.minimize')}
                  className="p-1 rounded-full hover:bg-muted/50"
                  onClick={() => setIsPanelOpen(false)}
                >
                  <ListChevronsDownUp className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="space-y-3 mt-4">
            {evaluationCriteria.map((criterion) => (
              <Collapsible
                key={criterion.id}
                open={openItem === criterion.id}
                onOpenChange={() => toggleItem(criterion.id)}
                data-criterion-id={criterion.id}
              >
                <CollapsibleTrigger className="w-full">
                  <div className={cn(criterionVariants({
                    variant: activeEvaluationFactors.has(criterion.id) ? "highlighted" : "default"
                  }))}>
                    <div className="flex items-center gap-3 mr-20">
                      {activeEvaluationFactors.has(criterion.id) ? (
                        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-destructive">
                          <criterion.icon className="h-4 w-4 text-white" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-muted-foreground/10">
                          <criterion.icon className="h-4 w-4 text-muted-foreground" />
                        </span>
                      )}
                      <span className="text-sm font-medium text-foreground">{criterion.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        openItem === criterion.id && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2 whitespace-normal">
                    {criterion.description}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          </>
        ) : (
          <button
            aria-label={t('components.evaluationPanel.expand')}
            className="p-2 rounded-full hover:bg-muted/50"
            onClick={() => setIsPanelOpen(true)}
          >
            <ListChevronsUpDown className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
