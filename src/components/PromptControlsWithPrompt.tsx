import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

    const NO_CHANGE_VALUE = "";
    
    let selectedValue = currentValue;
    if (selectedValue !== leftParameter && selectedValue !== rightParameter) {
        selectedValue = NO_CHANGE_VALUE;
    }

    const handleValueChange = (value: string) => {
        if (enabled && onParameterChange) {
            onParameterChange(value);
        }
    };

    return <fieldset 
        className={`my-3 p-0 px-1 border border-gray-200 rounded-lg ${!enabled && 'opacity-60 pointer-events-none'}`}
        disabled={!enabled}
    >
        <legend className="text-xs font-medium text-gray-700 px-2 mx-auto">
            {parameterTitle}
        </legend>
        
        <RadioGroup 
            value={selectedValue} 
            onValueChange={handleValueChange} 
            orientation="horizontal" 
            className="flex w-full justify-between gap-0 p-1"
        >
            <div className="flex flex-1 flex-col items-center gap-1">
                <RadioGroupItem value={leftParameter} id={`${parameterTitle}-r1`} />
                <Label htmlFor={`${parameterTitle}-r1`} className="text-[10px] font-normal whitespace-nowrap px-1">{leftParameter}</Label>
            </div>
            
            <div className="flex flex-1 flex-col items-center gap-1">
                <RadioGroupItem value={NO_CHANGE_VALUE} id={`${parameterTitle}-r2`} />
                <Label htmlFor={`${parameterTitle}-r2`} className="text-[10px] font-normal whitespace-nowrap px-1">No Change</Label>
            </div>
            
            <div className="flex flex-1 flex-col items-center gap-1">
                <RadioGroupItem value={rightParameter} id={`${parameterTitle}-r3`} />
                <Label htmlFor={`${parameterTitle}-r3`} className="text-[10px] font-normal whitespace-nowrap px-1">{rightParameter}</Label>
            </div>
        </RadioGroup>
    </fieldset>;
}

interface PromptControlsWithPromptProps {
    promptText?: string;
    showSpecificity?: boolean;
    showStyle?: boolean;
    showContext?: boolean;
    showBias?: boolean;
    enableSpecificity?: boolean;
    enableStyle?: boolean;
    enableContext?: boolean;
    enableBias?: boolean;
    specificity?: string;
    style?: string;
    context?: string;
    bias?: string;
    onSpecificityChange?: (value: string) => void;
    onStyleChange?: (value: string) => void;
    onContextChange?: (value: string) => void;
    onBiasChange?: (value: string) => void;
    onReset?: () => void;
    onSubmit?: () => void;
    hasUnappliedChanges?: boolean;
    onPromptChange?: (prompt: string) => void;
    onOutputChange?: (output: string) => void;
}

export default function PromptControlsWithPrompt({
    promptText,
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
    hasUnappliedChanges,
    onPromptChange,
    onOutputChange
}: PromptControlsWithPromptProps) {
    const [localSpecificity, setLocalSpecificity] = useState<string>(specificity ?? "");
    const [localStyle, setLocalStyle] = useState<string>(style ?? "");
    const [localContext, setLocalContext] = useState<string>(context ?? "");
    const [localBias, setLocalBias] = useState<string>(bias ?? "");

    const handleSpecificityChange = (val: string) => {
        // Reset all other parameters to "no change" if this parameter is being changed
        if (val !== "") {
            if (onStyleChange) onStyleChange(""); else setLocalStyle("");
            if (onContextChange) onContextChange(""); else setLocalContext("");
            if (onBiasChange) onBiasChange(""); else setLocalBias("");
        }
        if (onSpecificityChange) onSpecificityChange(val); else setLocalSpecificity(val);
    };
    const handleStyleChange = (val: string) => {
        // Reset all other parameters to "no change" if this parameter is being changed
        if (val !== "") {
            if (onSpecificityChange) onSpecificityChange(""); else setLocalSpecificity("");
            if (onContextChange) onContextChange(""); else setLocalContext("");
            if (onBiasChange) onBiasChange(""); else setLocalBias("");
        }
        if (onStyleChange) onStyleChange(val); else setLocalStyle(val);
    };
    const handleContextChange = (val: string) => {
        // Reset all other parameters to "no change" if this parameter is being changed
        if (val !== "") {
            if (onSpecificityChange) onSpecificityChange(""); else setLocalSpecificity("");
            if (onStyleChange) onStyleChange(""); else setLocalStyle("");
            if (onBiasChange) onBiasChange(""); else setLocalBias("");
        }
        
        // Update prompt and output based on context selection
        if (val === "No Background") {
            if (onPromptChange) {
                onPromptChange("Summarize the main points in the AI Act.");
            }
        }
        
        if (onContextChange) onContextChange(val); else setLocalContext(val);
    };
    const handleBiasChange = (val: string) => {
        // Reset all other parameters to "no change" if this parameter is being changed
        if (val !== "") {
            if (onSpecificityChange) onSpecificityChange(""); else setLocalSpecificity("");
            if (onStyleChange) onStyleChange(""); else setLocalStyle("");
            if (onContextChange) onContextChange(""); else setLocalContext("");
        }
        if (onBiasChange) onBiasChange(val); else setLocalBias(val);
    };
    const handleResetClick = () => {
        if (onReset) onReset(); else {
            setLocalSpecificity("");
            setLocalStyle("");
            setLocalContext("");
            setLocalBias("");
        }
    };
    const handleSubmitClick = () => {
        // Update output based on current context value
        const currentContext = context ?? localContext;
        if (currentContext === "No Background" && onOutputChange) {
            onOutputChange(`The AI Act is the EU's regulation for artificial intelligence, adopted in 2024. Here are the main points:
Risk-based approach: AI systems are categorized by risk level:

Unacceptable risk systems are banned (e.g., government social scoring, manipulative AI)
High-risk systems face strict requirements (e.g., AI in employment, law enforcement, credit scoring, critical infrastructure)
Limited risk systems need transparency (e.g., chatbots must disclose they're AI)
Minimal risk systems have few requirements

Requirements for high-risk AI:

Risk management throughout the system's lifecycle
High-quality training data to minimize bias
Technical documentation and record-keeping
Transparency about capabilities and limitations
Human oversight mechanisms
Robustness, accuracy, and cybersecurity
Conformity assessments before deployment

Scope: Applies to AI providers and deployers in the EU market, regardless of location.
Goals: Protect fundamental rights and safety while promoting innovation and creating harmonized rules across EU member states.`);
        }
        
        if (onSubmit) onSubmit();
    };

    return <Card className="bg-white border border-gray-200 rounded-lg max-w-sm">
        <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <h3 className="font-semibold text-gray-900">Prompt Controls</h3>
            </div>

            {/* Sent Prompt Display */}
            {(((context ?? localContext) === "No Background") || !!promptText) && (
                <div 
                    className="mb-6 bg-secondary rounded-lg p-4"
                >
                    <p 
                        className="text-gray-900 leading-relaxed text-sm"
                        style={{
                            fontFamily: 'Manrope',
                        }}
                    >
                        {(context ?? localContext) === "No Background" 
                            ? "Input: Summarize the main points in the AI Act."
                            : (promptText ?? "")}
                    </p>
                </div>
            )}

            <div>
                <div className="relative">
                    <Parameter parameterTitle="Prompt Specificity" leftParameter="General" rightParameter="Specific" showParameter={showSpecificity} enabled={enableSpecificity} currentValue={specificity ?? localSpecificity} onParameterChange={handleSpecificityChange} />
                    <Parameter parameterTitle="Interaction Style" leftParameter="Conversational" rightParameter="Instructional" showParameter={showStyle} enabled={enableStyle} currentValue={style ?? localStyle} onParameterChange={handleStyleChange} />
                    <Parameter parameterTitle="Context" leftParameter="No Background" rightParameter="With Background" showParameter={showContext} enabled={enableContext} currentValue={context ?? localContext} onParameterChange={handleContextChange} />
                    <Parameter parameterTitle="Bias" leftParameter="No Bias" rightParameter="With Bias" showParameter={showBias} enabled={enableBias} currentValue={bias ?? localBias} onParameterChange={handleBiasChange} />
                </div>

                <div className="flex gap-2">
                    <Button 
                        onClick={handleSubmitClick} 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        disabled={hasUnappliedChanges !== undefined ? !hasUnappliedChanges : !((specificity ?? localSpecificity) || (style ?? localStyle) || (context ?? localContext) || (bias ?? localBias))}
                    > 
                        Apply Changes
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>;
}
