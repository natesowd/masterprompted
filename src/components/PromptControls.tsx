import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
        <div
            className={`mb-4 ${!enabled && 'opacity-60 pointer-events-none'}`}
        >
            {/* Parameter title with info icon */}
            <div className="flex items-center gap-1 mb-2">
                <span className="text-sm font-semibold text-foreground">{parameterTitle}</span>
                {infoText && (
                    <TooltipProvider>
                        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen} delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Info
                                    className="w-3.5 h-3.5 text-muted-foreground cursor-pointer"
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
            </div>

            {/* Slider-style radio track */}
            <RadioGroup
                value={selectedValue}
                onValueChange={handleValueChange}
                orientation="horizontal"
                className="relative flex w-full items-center"
                disabled={!enabled}
            >
                {/* Track line spanning between first and last radio */}
                <div className="pointer-events-none absolute top-[9px] left-[calc(8.333%)] right-[calc(8.333%)] h-[2px] bg-border rounded-full" />

                <div className="flex flex-1 flex-col items-center gap-1.5">
                    <RadioGroupItem value={leftParameter} id={`${parameterTitle}-r1`} className="h-[18px] w-[18px] border-2 border-muted-foreground/40 data-[state=checked]:border-secondary data-[state=checked]:text-secondary" />
                    <Label htmlFor={`${parameterTitle}-r1`} className="text-[11px] text-muted-foreground font-normal whitespace-nowrap">{leftParameter}</Label>
                </div>

                <div className="flex flex-1 flex-col items-center gap-1.5">
                    <RadioGroupItem value={NO_CHANGE_VALUE} id={`${parameterTitle}-r2`} className="h-[18px] w-[18px] border-2 border-muted-foreground/40 data-[state=checked]:border-secondary data-[state=checked]:text-secondary" />
                    <Label htmlFor={`${parameterTitle}-r2`} className="text-[11px] text-muted-foreground font-normal whitespace-nowrap">{useLanguage().t('components.promptControls.original')}</Label>
                </div>

                <div className="flex flex-1 flex-col items-center gap-1.5">
                    <RadioGroupItem value={rightParameter} id={`${parameterTitle}-r3`} className="h-[18px] w-[18px] border-2 border-muted-foreground/40 data-[state=checked]:border-secondary data-[state=checked]:text-secondary" />
                    <Label htmlFor={`${parameterTitle}-r3`} className="text-[11px] text-muted-foreground font-normal whitespace-nowrap">{rightParameter}</Label>
                </div>
            </RadioGroup>
        </div>
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
    onFileUpload?: () => void;
    chatSubmitButtonId?: string;
    chatAnimationKey?: number;
    files?: { name: string; isUploading?: boolean }[];
    onUploadFiles?: (files: FileList | File[]) => void;
    onRemoveFile?: (index: number) => void;
    readOnly?: boolean;
    className?: string;
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
    onFileUpload,
    chatSubmitButtonId,
    disableSend,
    disableOptimize,
    chatAnimationKey,
    files,
    onUploadFiles,
    onRemoveFile,
    waitingforOptimization = false,
    readOnly = false,
    className
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
        <Card className={`bg-card border border-border rounded-lg max-w-sm h-[calc(100vh-160px)] min-w-[300px] ${className}`}>
            <CardContent className="p-4 h-full flex flex-col gap-2">
                {/* Prompt history label */}
                <span className="text-secondary-foreground font-semibold text-sm cursor-default">
                    {t('components.promptControls.promptHistory')}
                </span>

                {/* Chatbox */}
                <Chatbox
                    value={chatValue}
                    onChange={onChatChange ?? (() => { })}
                    onSubmit={onChatSubmit}
                    submitButtonId={chatSubmitButtonId}
                    disableSend={disableSend}
                    animationKey={chatAnimationKey}
                    waitingforOptimization={waitingforOptimization}
                    onUploadFiles={onUploadFiles}
                    files={files}
                    onRemoveFile={onRemoveFile}
                    readOnly={readOnly}
                    className="z-50 flex-auto min-h-0"
                />

                {/* Parameters area */}
                <div className="flex-initial flex flex-col justify-end min-h-0 overflow-y-auto">
                    <h3 className="font-bold text-foreground text-base mb-3">{t('components.promptControls.title')}</h3>
                    <div id='parameters' className="relative overflow-auto">
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

                    <div className="flex pt-3">
                        <Button
                            onClick={handleSubmitClick}
                            variant="default"
                            size="sm"
                            className="flex-1 min-h-[48px] leading-tight rounded-full whitespace-normal text-center bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-sm"
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