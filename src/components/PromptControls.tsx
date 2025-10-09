// src/components/PromptControls.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Chatbox from "./ChatBox";

// 1. Updated ParameterProps for RadioGroup usage and added a middle option
interface ParameterProps {
    parameterTitle: string;
    leftParameter: string;
    rightParameter: string;
    showParameter?: boolean;
    enabled?: boolean;
    currentValue: string;
    // onParameterChange now expects a string that is one of the three radio values
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

    // The 'No Change' value is explicitly an empty string ""
    const NO_CHANGE_VALUE = "";
    
    // Determine the selected value for the RadioGroup
    let selectedValue = currentValue;
    if (selectedValue !== leftParameter && selectedValue !== rightParameter) {
        // If the current value doesn't match a parameter, treat it as "No Change"
        selectedValue = NO_CHANGE_VALUE;
    }

    // New handler for RadioGroup
    const handleValueChange = (value: string) => {
        if (enabled && onParameterChange) {
            onParameterChange(value);
        }
    };

    // Aggressive styling adjustments for fitting into w-sm:
    // 1. Fieldset padding reduced to minimum (p-0 px-1)
    // 2. RadioGroup forced to w-full and uses 'gap-0' for maximum compression.
    // 3. Each option is given flex-1 to distribute width evenly.
    return <fieldset 
        // Minimized padding and margin
        className={`my-3 p-0 px-1 border border-gray-200 rounded-lg ${!enabled && 'opacity-60 pointer-events-none'}`}
        disabled={!enabled}
    >
        {/* Title uses text-xs and a small margin/padding */}
        <legend className="text-xs font-medium text-gray-700 px-2 mx-auto">
            {parameterTitle}
        </legend>
        
        {/* Forced full width, minimal padding, and no gap for maximum space usage */}
        <RadioGroup 
            value={selectedValue} 
            onValueChange={handleValueChange} 
            orientation="horizontal" 
            className="relative flex w-full justify-between gap-0 p-1"
        >
            {/* spectrum lines between radios */}
            <div className="pointer-events-none absolute top-[12px] left-[calc(16.666%+14px)] w-[calc(33.333%-26px)] h-px bg-gray-300" />
            <div className="pointer-events-none absolute top-[12px] left-[calc(50%+12px)] w-[calc(33.333%-26px)] h-px bg-gray-300" />
            {/* Left Parameter - flex-1 makes it use 1/3 of the space */}
            <div className="flex flex-1 flex-col items-center gap-1 w-1/4">
                <RadioGroupItem value={leftParameter} id={`${parameterTitle}-r1`} />
                {/* Smallest font, nowrap, and reduced horizontal padding on the label itself */}
                <Label htmlFor={`${parameterTitle}-r1`} className="text-[10px] font-normal whitespace-nowrap px-1">{leftParameter}</Label>
            </div>
            
            {/* Middle "No Change" Parameter - flex-1 makes it use 1/3 of the space */}
            <div className="flex flex-1 flex-col items-center gap-1 w-1/4">
                <RadioGroupItem value={NO_CHANGE_VALUE} id={`${parameterTitle}-r2`} />
                <Label htmlFor={`${parameterTitle}-r2`} className="text-[10px] font-normal whitespace-nowrap px-1">No Change</Label>
            </div>
            
            {/* Right Parameter - flex-1 makes it use 1/3 of the space */}
            <div className="flex flex-1 flex-col items-center gap-1 w-1/4">
                <RadioGroupItem value={rightParameter} id={`${parameterTitle}-r3`} />
                <Label htmlFor={`${parameterTitle}-r3`} className="text-[10px] font-normal whitespace-nowrap px-1">{rightParameter}</Label>
            </div>
        </RadioGroup>
    </fieldset>;
}

// Props for PromptControls remain the same
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
    // Undo support
    undoEnabled?: boolean;
    onUndo?: () => void;

    // ChatBox control props from parent
    chatValue?: string;
    onChatChange?: (value: string) => void;
    onChatSubmit?: (value: string) => void;
    chatSubmitButtonId?: string;
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
    onSubmit,
    undoEnabled = false,
    onUndo,
    chatValue = "",
    onChatChange,
    onChatSubmit,
    chatSubmitButtonId
}: PromptControlsProps) {
    // Local state remains the same
    const [localSpecificity, setLocalSpecificity] = useState<string>(specificity ?? "");
    const [localStyle, setLocalStyle] = useState<string>(style ?? "");
    const [localContext, setLocalContext] = useState<string>(context ?? "");
    const [localBias, setLocalBias] = useState<string>(bias ?? "");

    // Helpers remain the same
    const handleSpecificityChange = (val: string) => {
        if (onSpecificityChange) onSpecificityChange(val); else setLocalSpecificity(val);
    };
    const handleStyleChange = (val: string) => {
        if (onStyleChange) onStyleChange(val); else setLocalStyle(val);
    };
    const handleContextChange = (val: string) => {
        if (onContextChange) onContextChange(val); else setLocalContext(val);
    };
    const handleBiasChange = (val: string) => {
        if (onBiasChange) onBiasChange(val); else setLocalBias(val);
    };
    const handleResetClick = () => {
        // Reset parent state if handler provided, otherwise reset local state to ""
        if (onReset) onReset(); else {
            setLocalSpecificity("");
            setLocalStyle("");
            setLocalContext("");
            setLocalBias("");
        }
    };
    const handleSubmitClick = () => {
        if (onSubmit) onSubmit();
        // otherwise nothing — this is a demo control
    };
    const handleUndoClick = () => {
        if (onUndo && undoEnabled) onUndo();
    };
    // The main PromptControls Card becomes a column that fills height
    return <Card className="bg-white border border-gray-200 rounded-lg max-w-sm h-full">
        <CardContent className="p-4 h-full flex flex-col gap-4">
            {/* Chatbox above the title, grows to fill */}
            <div className="flex-1 min-h-0">
                <Chatbox
                    value={chatValue}
                    onChange={onChatChange ?? (() => {})}
                    onSubmit={onChatSubmit}
                    submitButtonId={chatSubmitButtonId}
                    fullHeight
                />
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 text-center whitespace-nowrap">Prompt Controls</h3>
            <Separator/>
                <div className="relative">
                    {/* Selectors are now controlled by props from the parent */}
                    <Parameter parameterTitle="Prompt Specificity" leftParameter="General" rightParameter="Specific" showParameter={showSpecificity} enabled={enableSpecificity} currentValue={specificity ?? localSpecificity} onParameterChange={handleSpecificityChange} />
                    <Parameter parameterTitle="Interaction Style" leftParameter="Conversational" rightParameter="Instructional" showParameter={showStyle} enabled={enableStyle} currentValue={style ?? localStyle} onParameterChange={handleStyleChange} />
                    <Parameter parameterTitle="Context" leftParameter="No Background" rightParameter="With Background" showParameter={showContext} enabled={enableContext} currentValue={context ?? localContext} onParameterChange={handleContextChange} />
                    <Parameter parameterTitle="Bias" leftParameter="No Bias" rightParameter="With Bias" showParameter={showBias} enabled={enableBias} currentValue={bias ?? localBias} onParameterChange={handleBiasChange} />
                </div>

                <div className="flex gap-2 items-stretch mt-2">
                    <Button 
                    onClick={handleUndoClick} 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 min-h-[48px] leading-tight whitespace-normal text-center"
                    disabled={!undoEnabled}> 
                        Undo
                    </Button>
                    <Button 
                    onClick={handleSubmitClick} 
                    variant="default" 
                    size="sm" 
                    className="flex-1 min-h-[48px] leading-tight whitespace-normal text-center"
                    disabled={!(specificity || style || context || bias)}> 
                        Optimize Prompt
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>;
}