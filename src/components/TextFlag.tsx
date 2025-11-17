import { useEffect, useState } from "react";
import { ListChecks, Target, Mic, Scale, Copy } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useLanguage } from "@/contexts/LanguageContext";


interface TextFlagProps {
  text: string;
  evaluationFactor: "factual_accuracy" | "relevance" | "voice" | "bias" | "plagiarism";
  explanation: React.ReactNode;
  
  className?: string;
  href?: string;
}

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

export default function TextFlag({ text, evaluationFactor, explanation, className = "", href }: TextFlagProps) {
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
          className={`inline cursor-pointer ${className}`}
          onClick={(e) => {
            e.stopPropagation();
            setHoverCardOpen(!hoverCardOpen);
          }}
        >
          <Icon className="inline h-3.5 w-3.5 text-destructive -mt-0.5 mr-0.5" />
          {href ? (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline decoration-destructive decoration-2 underline-offset-2 text-current hover:opacity-80"
              onClick={(e) => e.stopPropagation()}
            >
              {text}
            </a>
          ) : (
            <span className="underline decoration-destructive decoration-2 underline-offset-2 text-current">
              {text}
            </span>
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 bg-card border-destructive/20 shadow-lg rounded-lg p-4"
        sideOffset={5}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-destructive" />
            <h4 className="font-semibold text-destructive text-sm">{t(`components.textFlag.type.${evaluationFactor}`)}</h4>
          </div>
          <p className="text-sm text-foreground font-normal leading-relaxed">
            {explanation}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}