import { CheckCircle, Target, Mic, Scale, Copy, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    description: "Identifies potential prejudice, unfair representation, or one-sided perspectives in the content. Evaluates balance, objectivity, and fair presentation of different viewpoints."
  },
  {
    id: "plagiarism",
    label: "Plagiarism",
    icon: Copy,
    description: "Checks for originality and proper attribution of sources. Identifies any instances of copied content, inadequate citations, or failure to credit original authors and publications."
  }
];

export default function EvaluationPanel() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Journalistic Evaluation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {evaluationCriteria.map((criterion) => (
          <Collapsible 
            key={criterion.id} 
            open={openItems.includes(criterion.id)}
            onOpenChange={() => toggleItem(criterion.id)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <criterion.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{criterion.label}</span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    openItems.includes(criterion.id) ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <p className="text-sm text-gray-600 leading-relaxed mt-2">
                {criterion.description}
              </p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}