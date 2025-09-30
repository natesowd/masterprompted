// src/components/PromptControls.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

// 1. Update ParameterProps to use string-based current value and change handler
interface ParameterProps {
  parameterTitle: string;
  leftParameter: string;
  rightParameter: string;
  showParameter?: boolean;
  enabled?: boolean;
  currentValue: string;
  onParameterChange?: (param: string) => void;
}
function Parameter({
  parameterTitle,
  leftParameter,
  rightParameter,
  showParameter = true,
  enabled = true,
  currentValue,
  onParameterChange
}: ParameterProps) {
  if (!showParameter) {
    return null;
  }

  // Logic remains the same, driven by props
  const isLeftSelected = currentValue === leftParameter || currentValue === "";
  const isRightSelected = currentValue === rightParameter;
  const handleLeftClick = () => {
    if (enabled) {
      onParameterChange?.(leftParameter);
    }
  };
  const handleRightClick = () => {
    if (enabled) {
      onParameterChange?.(rightParameter);
    }
  };
  return <div className={`my-5`}>
            <h4 className="text-sm font-medium text-gray-700 mx-3">{parameterTitle}</h4>
            <div className={`flex justify-between bg-gray-100 rounded-full p-1 ${!enabled && 'cursor-not-allowed'} ${!enabled && 'opacity-60'}`}>
                <button onClick={handleLeftClick} className={`grow px-4 py-2 text-sm font-medium rounded-full transition-colors
                        ${isLeftSelected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
                        ${enabled ? 'hover:text-gray-800' : 'cursor-not-allowed'}
                    `}>
                    {leftParameter}
                </button>
                <button onClick={handleRightClick} className={`grow px-4 py-2 text-sm font-medium rounded-full transition-colors
                        ${isRightSelected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
                        ${enabled ? 'hover:text-gray-800' : 'cursor-not-allowed'}
                    `}>
                    {rightParameter}
                </button>
            </div>
        </div>;
}

// Props updated to accept state and handlers from the parent component
interface PromptControlsProps {
  showSpecificity?: boolean;
  showStyle?: boolean;
  showContext?: boolean;
  showBias?: boolean;
  enableSpecificity?: boolean;
  enableStyle?: boolean;
  enableContext?: boolean;
  enableBias?: boolean;

  // State values
  specificity?: string;
  style?: string;
  context?: string;
  bias?: string;

  // State change handlers (optional)
  onSpecificityChange?: (value: string) => void;
  onStyleChange?: (value: string) => void;
  onContextChange?: (value: string) => void;
  onBiasChange?: (value: string) => void;

  // Event handlers (optional)
  onReset?: () => void;
  onSubmit?: () => void;
}
export default function PromptControls({
  showSpecificity = true,
  showStyle = true,
  showContext = true,
  showBias = true,
  enableSpecificity = true,
  enableStyle = true,
  enableContext = true,
  enableBias = true,
  specificity,
  style,
  context,
  bias,
  onSpecificityChange,
  onStyleChange,
  onContextChange,
  onBiasChange,
  onReset,
  onSubmit
}: PromptControlsProps) {
  // If parent doesn't provide state/handlers, keep an internal editing state
  const [localSpecificity, setLocalSpecificity] = useState<string>(specificity ?? "General");
  const [localStyle, setLocalStyle] = useState<string>(style ?? "Conversational");
  const [localContext, setLocalContext] = useState<string>(context ?? "No Background");
  const [localBias, setLocalBias] = useState<string>(bias ?? "No Bias");

  // Helpers to call parent handlers when available, otherwise update local state
  const handleSpecificityChange = (val: string) => {
    if (onSpecificityChange) onSpecificityChange(val);else setLocalSpecificity(val);
  };
  const handleStyleChange = (val: string) => {
    if (onStyleChange) onStyleChange(val);else setLocalStyle(val);
  };
  const handleContextChange = (val: string) => {
    if (onContextChange) onContextChange(val);else setLocalContext(val);
  };
  const handleBiasChange = (val: string) => {
    if (onBiasChange) onBiasChange(val);else setLocalBias(val);
  };
  const handleResetClick = () => {
    // Reset parent state if handler provided, otherwise reset local state
    if (onReset) onReset();else {
      setLocalSpecificity("General");
      setLocalStyle("Conversational");
      setLocalContext("No Background");
      setLocalBias("No Bias");
    }
  };
  const handleSubmitClick = () => {
    if (onSubmit) onSubmit();
    // otherwise nothing — this is a demo control
  };
  return <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    
                    <h3 className="font-semibold text-gray-900">Prompt Controls</h3>
                </div>
                <div>
                    <div className="relative">
                        {/* Selectors are now controlled by props from the parent */}
                        <Parameter parameterTitle="Prompt Specificity" leftParameter="General" rightParameter="Specific" showParameter={showSpecificity} enabled={enableSpecificity} currentValue={specificity ?? localSpecificity} onParameterChange={handleSpecificityChange} />
                        <Parameter parameterTitle="Interaction Style" leftParameter="Conversational" rightParameter="Instructional" showParameter={showStyle} enabled={enableStyle} currentValue={style ?? localStyle} onParameterChange={handleStyleChange} />
                        <Parameter parameterTitle="Context" leftParameter="No Background" rightParameter="With Background" showParameter={showContext} enabled={enableContext} currentValue={context ?? localContext} onParameterChange={handleContextChange} />
                        <Parameter parameterTitle="Bias" leftParameter="No Bias" rightParameter="With Bias" showParameter={showBias} enabled={enableBias} currentValue={bias ?? localBias} onParameterChange={handleBiasChange} />
                    </div>

                    <div className="flex gap-2">
                        
                        <Button onClick={handleSubmitClick} variant="default" size="sm" className="flex-1">
                            Apply Changes
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>;
}