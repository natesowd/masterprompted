import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import Chatbox from "./ChatBox";
import { Parameters } from "@/pages/PromptPlayground";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NO_CHANGE_VALUE = "no-change";

interface ParameterProps {
    parameterTitle: string;
    parameterKey: keyof Parameters;
    leftParameter: string;
    rightParameter: string;
    showParameter?: boolean;
    enabled?: boolean;
    currentValue: string;
    onParameterChange?: (key: keyof Parameters, value: string) => void;
    infoText?: string;
}

function Parameter({
    parameterTitle,
    parameterKey,
    leftParameter,
    rightParameter,
    showParameter = true,
    enabled = true,
    currentValue,
    onParameterChange,
    infoText
}: ParameterProps) {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    
    if (!showParameter) {
        return null;
    }
    
    // Determine the selected value - default to NO_CHANGE_VALUE if empty or invalid
    let selectedValue = currentValue;
    if (!selectedValue || (selectedValue !== leftParameter && selectedValue !== rightParameter)) {
        selectedValue = NO_CHANGE_VALUE;
    }

    const handleValueChange = (value: string) => {
        if (enabled && onParameterChange) {
            // Convert NO_CHANGE_VALUE back to empty string for the parent state
            const valueToSend = value === NO_CHANGE_VALUE ? "" : value;
            onParameterChange(parameterKey, valueToSend);
        }
    };

    return (
        <fieldset 
            className={`my-2 p-0 px-1 border border-border rounded-lg ${!enabled && 'opacity-60 pointer-events-none'}`}
            disabled={!enabled}
        >
            <legend className="text-xs font-medium text-muted-foreground px-2 mx-auto flex items-center gap-1">
                <span>{parameterTitle}</span>
                {infoText && (
                    <TooltipProvider>
                        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen} delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Info 
                                    className="w-3 h-3 cursor-pointer" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTooltipOpen(!tooltipOpen);
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
    );
}

interface PromptControlsProps {
    showSpecificity?: boolean;
    showStyle?: boolean;
    showContext?: boolean;
    showBias?: boolean;
    enableSpecificity?: boolean;
    enableStyle?: boolean;
    enableContext?: boolean;
    enableBias?: boolean;
    parameters: Parameters;
    onParameterChange: (key: keyof Parameters, value: string) => void;
    onReset?: () => void;
    onOptimize?: () => void;
    undoEnabled?: boolean;
    onUndo?: () => void;
    disableSend?: boolean;
    disableOptimize?: boolean;
    waitingforOptimization?: boolean;
    chatValue?: string;
    onChatChange?: (value: string) => void;
    onChatSubmit?: (value: string) => void;
    chatSubmitButtonId?: string;
    chatAnimationKey?: number;
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
    parameters,
    onParameterChange,
    onReset,
    onOptimize,
    undoEnabled = false,
    onUndo,
    chatValue = "",
    onChatChange,
    onChatSubmit,
    chatSubmitButtonId,
    disableSend,
    disableOptimize,
    chatAnimationKey,
    waitingforOptimization = false
}: PromptControlsProps) {
    const { t } = useLanguage();
    const handleResetClick = () => {
        if (onReset) onReset();
    };
    
    const handleSubmitClick = () => {
        if (onOptimize) onOptimize();
    };
    
    const handleUndoClick = () => {
        if (onUndo && undoEnabled) onUndo();
    };

    const isAnyParameterSet = Object.values(parameters).some(p => p !== "");

    return (
        <Card className="bg-card border border-border rounded-lg max-w-sm h-full">
            <CardContent className="p-4 h-full flex flex-col gap-2">
                <div className="flex-1 min-h-0 z-50">
                    <Chatbox
                        value={chatValue}
                        onChange={onChatChange ?? (() => {})}
                        onSubmit={onChatSubmit}
                        submitButtonId={chatSubmitButtonId}
                        disableSend={disableSend}
                        fullHeight
                        animationKey={chatAnimationKey}
                        waitingforOptimization={waitingforOptimization}
                    />
                </div>

                <div className="flex flex-col overflow-y-auto">
                    <h3 className="font-semibold text-card-foreground text-center whitespace-nowrap">{t('components.promptControls.title')}</h3>
                    <Separator/>
                    <div id='parameters' className="relative">
                        <Parameter 
                            parameterTitle={t('components.promptControls.specificity.title')}
                            parameterKey="specificity" 
                            leftParameter={t('components.promptControls.specificity.left')}
                            rightParameter={t('components.promptControls.specificity.right')}
                            showParameter={showSpecificity} 
                            enabled={enableSpecificity} 
                            currentValue={parameters.specificity} 
                            onParameterChange={onParameterChange}
                            infoText={t('components.promptControls.specificity.info')}
                        />
                        <Parameter 
                            parameterTitle={t('components.promptControls.conversationStyle.title')}
                            parameterKey="style" 
                            leftParameter={t('components.promptControls.conversationStyle.left')}
                            rightParameter={t('components.promptControls.conversationStyle.right')}
                            showParameter={showStyle} 
                            enabled={enableStyle} 
                            currentValue={parameters.style} 
                            onParameterChange={onParameterChange}
                            infoText={t('components.promptControls.conversationStyle.info')}
                        />
                        <Parameter 
                            parameterTitle={t('components.promptControls.context.title')}
                            parameterKey="context" 
                            leftParameter={t('components.promptControls.context.left')}
                            rightParameter={t('components.promptControls.context.right')}
                            showParameter={showContext} 
                            enabled={enableContext} 
                            currentValue={parameters.context} 
                            onParameterChange={onParameterChange}
                            infoText={t('components.promptControls.context.info')}
                        />
                        <Parameter 
                            parameterTitle={t('components.promptControls.bias.title')}
                            parameterKey="bias" 
                            leftParameter={t('components.promptControls.bias.left')}
                            rightParameter={t('components.promptControls.bias.right')}
                            showParameter={showBias} 
                            enabled={enableBias} 
                            currentValue={parameters.bias} 
                            onParameterChange={onParameterChange}
                            infoText={t('components.promptControls.bias.info')}
                        />
                    </div>

                    <div className="flex py-2 items-stretch">
                        <Button 
                            onClick={handleSubmitClick} 
                            variant="default" 
                            size="sm" 
                            className="flex-1 min-h-[48px] leading-tight rounded-full whitespace-normal text-center"
                            disabled={disableOptimize}
                        > 
                            {t('components.promptControls.sendOptimizedPrompt')}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}