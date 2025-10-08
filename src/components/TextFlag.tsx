import { useEffect } from "react";
import { CheckCircle, Target, Mic, Scale, Copy } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface TextFlagProps {
  text: string;
  evaluationFactor: "factual-accuracy" | "relevance" | "voice" | "bias" | "plagiarism";
  explanation: string;
  className?: string;
}

const iconMap = {
  "factual-accuracy": CheckCircle,
  "relevance": Target,
  "voice": Mic,
  "bias": Scale,
  "plagiarism": Copy,
};

const labelMap = {
  "factual-accuracy": "Factual Accuracy",
  "relevance": "Relevance", 
  "voice": "Voice",
  "bias": "Bias",
  "plagiarism": "Plagiarism",
};

export default function TextFlag({ text, evaluationFactor, explanation, className = "" }: TextFlagProps) {
  const Icon = iconMap[evaluationFactor];
  const label = labelMap[evaluationFactor];

  // Highlight the corresponding evaluation criterion when component is mounted
  useEffect(() => {
    const criterionElement = document.querySelector(`[data-criterion-id="${evaluationFactor}"]`);
    if (criterionElement) {
      const triggerElement = criterionElement.querySelector('[data-radix-collection-item]') || 
                            criterionElement.querySelector('.flex.items-center.justify-between');
      if (triggerElement) {
        triggerElement.classList.add('ring-2', 'ring-destructive', 'bg-destructive/10');
        triggerElement.classList.remove('bg-muted', 'hover:bg-muted/80');
      }
    }

    // Cleanup: remove highlighting when component unmounts
    return () => {
      if (criterionElement) {
        const triggerElement = criterionElement.querySelector('[data-radix-collection-item]') || 
                              criterionElement.querySelector('.flex.items-center.justify-between');
        if (triggerElement) {
          triggerElement.classList.remove('ring-2', 'ring-destructive', 'bg-destructive/10');
          triggerElement.classList.add('bg-muted', 'hover:bg-muted/80');
        }
      }
    };
  }, [evaluationFactor]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className={`inline-flex items-center gap-0.5 cursor-pointer ${className}`}>
          <Icon className="h-4 w-4 text-destructive flex-shrink-0" />
          <span className="underline decoration-destructive decoration-2 underline-offset-2 text-current ml-0.5">
            {text}
          </span>
        </span>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 bg-card border-destructive/20 shadow-lg rounded-lg p-4"
        sideOffset={5}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-destructive" />
            <h4 className="font-semibold text-destructive text-sm">{label}</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}