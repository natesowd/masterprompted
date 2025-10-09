import { CheckCircle, Target, Mic, Scale, Copy, ChevronDown } from "lucide-react";
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
    // Use isPanelOpen state for the main Collapsible component
    <Collapsible 
      open={isPanelOpen} 
      onOpenChange={setIsPanelOpen}
      className="w-[20rem] bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-4"
    > 
      {/* Update the main trigger to include the chevron and occupy full width */}
      <CollapsibleTrigger className="w-full flex items-center justify-between text-lg font-semibold text-gray-900">
        Journalistic Evaluation
        {/* Add the Chevron icon and apply rotation based on isPanelOpen state */}
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
            isPanelOpen ? 'rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 mt-4">
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
                  <criterion.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{criterion.label}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${openItem === criterion.id ? 'rotate-180' : ''
                    }`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <p className="text-sm text-gray-600 leading-relaxed mt-2 whitespace-normal">
                {criterion.description}
              </p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
