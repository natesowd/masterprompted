import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatPrompt from "@/components/ChatPrompt";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type ParameterProps = {
  title: string;
  leftParameter: string;
  rightParameter: string;
  show?: boolean;
  enabled?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
};

const Parameter = ({ 
  title, 
  leftParameter, 
  rightParameter, 
  show = true,
  enabled = true,
  value,
  onValueChange
}: ParameterProps) => {
  if (!show) return null;

  return (
    <fieldset className="space-y-3" disabled={!enabled}>
      <legend className="text-sm font-medium text-gray-900 mb-2">{title}</legend>
      <RadioGroup 
        value={value} 
        onValueChange={onValueChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={leftParameter} id={`${title}-${leftParameter}`} />
          <Label 
            htmlFor={`${title}-${leftParameter}`}
            className="text-sm font-normal cursor-pointer"
          >
            {leftParameter}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={rightParameter} id={`${title}-${rightParameter}`} />
          <Label 
            htmlFor={`${title}-${rightParameter}`}
            className="text-sm font-normal cursor-pointer"
          >
            {rightParameter}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no-change" id={`${title}-no-change`} />
          <Label 
            htmlFor={`${title}-no-change`}
            className="text-sm font-normal cursor-pointer"
          >
            No Change
          </Label>
        </div>
      </RadioGroup>
    </fieldset>
  );
};

type GuidedPromptControlsProps = {
  promptText?: string;
  fileName?: string;
  showSpecificity?: boolean;
  showStyle?: boolean;
  showContext?: boolean;
  showBias?: boolean;
  enabledSpecificity?: boolean;
  enabledStyle?: boolean;
  enabledContext?: boolean;
  enabledBias?: boolean;
  specificityValue?: string;
  styleValue?: string;
  contextValue?: string;
  biasValue?: string;
  onSpecificityChange?: (value: string) => void;
  onStyleChange?: (value: string) => void;
  onContextChange?: (value: string) => void;
  onBiasChange?: (value: string) => void;
  onReset?: () => void;
  onSubmit?: () => void;
};

export default function GuidedPromptControls({
  promptText = "Give me a summary of the main points in the AI Act.",
  fileName = "EU_AI_Act.pdf",
  showSpecificity = false,
  showStyle = false,
  showContext = false,
  showBias = false,
  enabledSpecificity = true,
  enabledStyle = true,
  enabledContext = true,
  enabledBias = true,
  specificityValue,
  styleValue,
  contextValue,
  biasValue,
  onSpecificityChange,
  onStyleChange,
  onContextChange,
  onBiasChange,
  onReset,
  onSubmit
}: GuidedPromptControlsProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Prompt Specificity */}
        <Parameter
          title="Prompt Specificity"
          leftParameter="Broad"
          rightParameter="Specific"
          show={showSpecificity}
          enabled={enabledSpecificity}
          value={specificityValue}
          onValueChange={onSpecificityChange}
        />

        {/* Chat Prompt - placed between specificity and style */}
        <div className="pt-2 pb-2">
          <ChatPrompt text={promptText} fileName={fileName} />
        </div>

        {/* Interaction Style */}
        <Parameter
          title="Interaction Style"
          leftParameter="Formal"
          rightParameter="Conversational"
          show={showStyle}
          enabled={enabledStyle}
          value={styleValue}
          onValueChange={onStyleChange}
        />

        {/* Context */}
        <Parameter
          title="Context"
          leftParameter="No Context"
          rightParameter="With Context"
          show={showContext}
          enabled={enabledContext}
          value={contextValue}
          onValueChange={onContextChange}
        />

        {/* Bias */}
        <Parameter
          title="Bias"
          leftParameter="No Bias"
          rightParameter="With Bias"
          show={showBias}
          enabled={enabledBias}
          value={biasValue}
          onValueChange={onBiasChange}
        />

        {/* Action Buttons */}
        {(onSubmit || onReset) && (
          <div className="flex gap-3 pt-2">
            {onSubmit && (
              <Button 
                onClick={onSubmit}
                className="flex-1"
              >
                Apply Changes
              </Button>
            )}
            {onReset && (
              <Button 
                variant="outline"
                onClick={onReset}
                className="flex-1"
              >
                Reset
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
