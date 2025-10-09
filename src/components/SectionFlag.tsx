import { useEffect, ReactNode } from "react";
import { CheckCircle, Target, Mic, Scale, Copy } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface SectionFlagProps {
  children: ReactNode;
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

export default function SectionFlag({ children, evaluationFactor, explanation, className = "" }: SectionFlagProps) {
  const Icon = iconMap[evaluationFactor];
  const label = labelMap[evaluationFactor];

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
        <div className={`relative border-2 border-red-500 rounded p-3 cursor-pointer ${className}`}>
          <div className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-md">
            <Icon className="h-4 w-4 text-red-500" />
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
            <h4 className="font-semibold text-red-700 text-sm">{label}</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {explanation}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
