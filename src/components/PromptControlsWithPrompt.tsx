import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";


interface ParameterProps {
    parameterTitle: string;
    leftParameter: string;
    rightParameter: string;
    showParameter?: boolean;
    enabled?: boolean;
    currentValue: string;
    onParameterChange?: (param: string) => void;
    infoText?: string;
}

function Parameter({
    parameterTitle,
    leftParameter,
    rightParameter,
    showParameter = true,
    enabled = true,
    currentValue,
    onParameterChange,
    infoText
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
        className={`my-2 p-0 px-1 border border-border rounded-lg ${!enabled && 'opacity-60 pointer-events-none'}`}
        disabled={!enabled}
    >
        <legend className="text-xs font-medium text-muted-foreground px-2 mx-auto flex items-center gap-1">
            <span>{parameterTitle}</span>
            {infoText && (
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <Info
                                className="w-3 h-3 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" sideOffset={6} className="max-w-sm">
                            {infoText}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </legend>

        <RadioGroup
            value={selectedValue}
            onValueChange={handleValueChange}
            orientation="horizontal"
            className="relative flex w-full justify-between gap-0 p-1"
        >
            <div className="pointer-events-none absolute top-[12px] left-[calc(16.666%+14px)] w-[calc(33.333%-26px)] h-px bg-gray-300" />
            <div className="pointer-events-none absolute top-[12px] left-[calc(50%+12px)] w-[calc(33.333%-26px)] h-px bg-gray-300" />
            <div className="flex flex-1 flex-col items-center gap-1 w-1/4">
                <RadioGroupItem value={leftParameter} id={`${parameterTitle}-r1`} />
                <Label htmlFor={`${parameterTitle}-r1`} className="text-[10px] font-normal whitespace-nowrap px-1">{leftParameter}</Label>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1 w-1/4">
                <RadioGroupItem value={NO_CHANGE_VALUE} id={`${parameterTitle}-r2`} />
                <Label htmlFor={`${parameterTitle}-r2`} className="text-[10px] font-normal whitespace-nowrap px-1">{useLanguage().t('components.promptControls.original')}</Label>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1 w-1/4">
                <RadioGroupItem value={rightParameter} id={`${parameterTitle}-r3`} />
                <Label htmlFor={`${parameterTitle}-r3`} className="text-[10px] font-normal whitespace-nowrap px-1">{rightParameter}</Label>
            </div>
        </RadioGroup>
    </fieldset>
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
    const { t } = useLanguage();
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
        if (onSubmit) onSubmit();
    };

    return <Card className="bg-card border border-border rounded-lg shadow-sm max-w-sm">
        <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">{t('components.promptControls.title')}</h3>
            </div>

            {/* Sent Prompt Display */}
            {(() => {
                const currentSpecificity = specificity ?? localSpecificity;
                const currentStyle = style ?? localStyle;
                const currentContext = context ?? localContext;
                const currentBias = bias ?? localBias;
                const allNoChange = !currentSpecificity && !currentStyle && !currentContext && !currentBias;

                const shouldShow = allNoChange || !!promptText;

                if (!shouldShow) return null;

                let displayText = promptText;

                return (
                    <div className="mb-6 bg-secondary rounded-lg p-4">
                        <p
                            className="text-foreground leading-relaxed text-sm"
                            style={{
                                fontFamily: 'Manrope',
                            }}
                        >
                            {displayText}
                        </p>
                    </div>
                );
            })()}

            <div>
                <div className="relative">
                    <Parameter
                        parameterTitle={t('components.promptControls.promptSpecificity')}
                        leftParameter={t('components.promptControls.specificity.left')}
                        rightParameter={t('components.promptControls.specificity.right')}
                        showParameter={showSpecificity}
                        enabled={enableSpecificity}
                        currentValue={specificity ?? localSpecificity}
                        onParameterChange={handleSpecificityChange}
                        infoText={t('components.promptControls.promptSpecificityInfo')}
                    />
                    <Parameter
                        parameterTitle={t('components.promptControls.interactionStyle')}
                        leftParameter={t('components.promptControls.conversationStyle.left')}
                        rightParameter={t('components.promptControls.conversationStyle.right')}
                        showParameter={showStyle}
                        enabled={enableStyle}
                        currentValue={style ?? localStyle}
                        onParameterChange={handleStyleChange}
                        infoText={t('components.promptControls.interactionStyleInfo')}
                    />
                    <Parameter
                        parameterTitle={t('components.promptControls.context.title')}
                        leftParameter={t('components.promptControls.context.left')}
                        rightParameter={t('components.promptControls.context.right')}
                        showParameter={showContext}
                        enabled={enableContext}
                        currentValue={context ?? localContext}
                        onParameterChange={handleContextChange}
                        infoText={t('components.promptControls.contextInfo')}
                    />
                    <Parameter
                        parameterTitle={t('components.promptControls.bias.title')}
                        leftParameter={t('components.promptControls.bias.left')}
                        rightParameter={t('components.promptControls.bias.right')}
                        showParameter={showBias}
                        enabled={enableBias}
                        currentValue={bias ?? localBias}
                        onParameterChange={handleBiasChange}
                        infoText={t('components.promptControls.biasInfo')}
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleSubmitClick}
                        variant="default"
                        size="sm"
                        className="flex-1"
                        disabled={hasUnappliedChanges !== undefined ? !hasUnappliedChanges : !((specificity ?? localSpecificity) || (style ?? localStyle) || (context ?? localContext) || (bias ?? localBias))}
                    >
                        {t('components.promptControls.sendPrompt')}
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>;
}
