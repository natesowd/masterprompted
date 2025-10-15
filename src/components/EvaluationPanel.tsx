import { CheckCircle, Target, Mic, Scale, Copy, ChevronDown, ListChevronsUpDown, ListChevronsDownUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const evaluationCriteria = [
  {
    id: "factual-accuracy",
    label: "Factual Accuracy",
    icon: CheckCircle,
    description: "Factual accuracy in an LLM output ensures that information provided is correct and aligns with real-world knowledge, which is crucial for reliable, trustworthy results. A part of this are hallucinations, when the AI generates information that appears plausible but is factually incorrect or entirely fabricated; often because it extrapolates from incorrect training data, lacks real-world context, or misunderstands the user's query."
  },
  {
    id: "relevance",
    label: "Relevance",
    icon: Target,
    description: "Relevance measures how well the response matches the topic or intent of the prompt. If the prompt is not specific enough, the LLM output may leave out key information that affects a journalist's pool of information to draw from."
  },
  {
    id: "voice",
    label: "Voice",
    icon: Mic,
    description: "Voice refers to the tone, style, or 'personality' conveyed in the response, which can be shaped by specifying so in the prompt. When the voice of a prompt is human-like, LLM outputs are made to seem more plausible and knowledgeable, effectively disguising other aspects discussed."
  },
  {
    id: "bias",
    label: "Bias",
    icon: Scale,
    description: "Bias refers to prejudices and unbalanced narratives outputted by LLMs due to biased training data, model architecture or prompt instructions. LLMs will always have a degree of bias in its representation of different topics and therefore can bias the journalist's piece of work."
  },
  {
    id: "plagiarism",
    label: "Plagiarism",
    icon: Copy,
    description: "LLMs can plagiarise by directly taking content from training data. While some LLMs are able to attribute pieces of information, all LLMs have the ability to lose connection to data sources, making them vulnerable to reproducing substantial portions of text from data. User should be wary of this, even when the output has sources cited."
  }
];

// Define props for the component, including the optional initialIsOpen prop
interface EvaluationPanelProps {
  initialIsOpen?: boolean;
}

// Update the component signature to accept the props
export default function EvaluationPanel({ initialIsOpen = true }: EvaluationPanelProps) {
  // Use state to manage the main panel open state, defaulting to initialIsOpen prop
  const [isPanelOpen, setIsPanelOpen] = useState(initialIsOpen);
  // State for managing which criteria item is open
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem(prev => prev === id ? null : id);
  };

  return (
    <div className="relative">
      {/* When closed, only render a small floating button. When open, render the full panel. */}
      {isPanelOpen ? (
        <div className="w-[20rem] bg-card border border-border rounded-lg shadow-sm px-4 py-4 relative absolute top-0 right-0 z-10">
          {/* Expand/Minimize button in top-right */}
          <button
            aria-label={isPanelOpen ? 'Minimize evaluation panel' : 'Expand evaluation panel'}
            className="absolute top-1 right-1 p-1 rounded-full hover:bg-muted/50"
            onClick={() => setIsPanelOpen(false)}
          >
            <ListChevronsDownUp className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="w-full flex items-center justify-between text-lg font-semibold text-card-foreground mb-2">
            <span>Journalistic Evaluation</span>
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
            aria-label="Open evaluation panel"
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