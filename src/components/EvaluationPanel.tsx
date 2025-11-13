import { ListChecks, Target, Mic, Scale, Copy, ChevronDown, ListChevronsUpDown, ListChevronsDownUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";


// Define props for the component, including the optional initialIsOpen prop
interface EvaluationPanelProps {
  initialIsOpen?: boolean;
  canClose?: boolean;
}

// Update the component signature to accept the props
export default function EvaluationPanel({ initialIsOpen = true, canClose = false }: EvaluationPanelProps) {
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
  
  // Use state to manage the main panel open state. Keep it in sync whenever the prop changes
  const [isPanelOpen, setIsPanelOpen] = useState(initialIsOpen);

  // If the parent updates `initialIsOpen` at any time, reflect that change in local state.
  useEffect(() => {
    setIsPanelOpen(initialIsOpen);
  }, [initialIsOpen]);
  // State for managing which criteria item is open
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem(prev => prev === id ? null : id);
  };

  return (
    <div className="relative">
      {/* When closed, only render a small floating button. When open, render the full panel. */}
      {isPanelOpen ? (
  <div className="w-[20rem] bg-card border border-border rounded-lg shadow-sm px-4 py-4 absolute top-0 right-0 z-10">
          {/* Expand/Minimize button in top-right */}
          <button
            aria-label={isPanelOpen ? t('components.evaluationPanel.minimize') : t('components.evaluationPanel.expand')}
            className={
              `absolute top-1 right-1 p-1 rounded-full hover:bg-muted/50 ${!canClose ? 'opacity-50 cursor-not-allowed' : ''}`
            }
            onClick={() => { if (canClose) setIsPanelOpen(false); }}
            aria-disabled={!canClose}
            title={!canClose ? t('components.evaluationPanel.cannotMinimize') : undefined}
          >
            <ListChevronsDownUp className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="w-full flex items-center justify-between text-lg font-semibold text-card-foreground mb-2">
            <span>{t('components.evaluationPanel.title')}</span>
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
                  <div className="flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex items-center gap-3 mr-20">
                      <criterion.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{criterion.label}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${openItem === criterion.id ? 'rotate-180' : ''
                        }`}
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
        </div>
      ) : (
        <div className="w-10 h-10">
          <button
            aria-label={t('components.evaluationPanel.expand')}
            className="p-2 rounded-full hover:bg-muted/50"
            onClick={() => setIsPanelOpen(true)}
          >
            <ListChevronsUpDown className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}