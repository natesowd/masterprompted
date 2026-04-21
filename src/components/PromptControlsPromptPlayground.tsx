import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info, Redo2, RefreshCcw } from "lucide-react";
import Chatbox from "./ChatBoxPromptPlayground";
import { Parameters } from "@/pages/PromptPlayground";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import optimizationFig from "@/assets/optimization_fig.png";

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
    const [pulseActive, setPulseActive] = useState(false);
    const prevEnabledRef = useRef(enabled);

    useEffect(() => {
        if (enabled && !prevEnabledRef.current) {
            setPulseActive(true);
            const timer = setTimeout(() => setPulseActive(false), 600);
            return () => clearTimeout(timer);
        }
        prevEnabledRef.current = enabled;
    }, [enabled]);

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
            className={`my-3 rounded-lg px-2 py-1 transition-all ${!enabled ? 'opacity-30 pointer-events-none' : 'bg-background/60'} ${pulseActive ? 'animate-pulse-once' : ''}`}
        >
            <div className="flex items-center gap-1 mb-2">
                <span className="text-sm font-semibold text-foreground font-heading">{parameterTitle}</span>
                {infoText && (
                    <TooltipProvider>
                        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen} delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Info
                                    className="w-3.5 h-3.5 cursor-pointer text-muted-foreground"
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

            <RadioGroup
                value={selectedValue}
                onValueChange={handleValueChange}
                orientation="horizontal"
                className="relative flex w-full justify-between gap-0 py-1 px-2"
            >
                <div className="pointer-events-none absolute top-[14px] left-[calc(16.666%+14px)] w-[calc(33.333%-26px)] h-[2px] bg-surface-500" />
                <div className="pointer-events-none absolute top-[14px] left-[calc(50%+12px)] w-[calc(33.333%-26px)] h-[2px] bg-surface-500" />
                <div className="flex flex-1 flex-col items-center gap-1 w-1/3">
                    <RadioGroupItem value={leftParameter} id={`${parameterTitle}-r1`} />
                    <Label htmlFor={`${parameterTitle}-r1`} className="text-[11px] font-normal text-center leading-tight px-0.5 text-muted-foreground">{leftParameter}</Label>
                </div>

                <div className="flex flex-1 flex-col items-center gap-1 w-1/3">
                    <RadioGroupItem value={NO_CHANGE_VALUE} id={`${parameterTitle}-r2`} />
                    <Label htmlFor={`${parameterTitle}-r2`} className="text-[11px] font-normal text-center leading-tight px-0.5 text-muted-foreground">{useLanguage().t('components.promptControls.original')}</Label>
                </div>

                <div className="flex flex-1 flex-col items-center gap-1 w-1/3">
                    <RadioGroupItem value={rightParameter} id={`${parameterTitle}-r3`} />
                    <Label htmlFor={`${parameterTitle}-r3`} className="text-[11px] font-normal text-center leading-tight px-0.5 text-muted-foreground">{rightParameter}</Label>
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
    /** Which label/behavior to show on the primary action button. */
    buttonMode?: 'submit' | 'optimize';
    onRegenerate?: () => void;
    showRegenerate?: boolean;
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
    webSearchEnabled?: boolean;
    onToggleWebSearch?: () => void;
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
    buttonMode = 'optimize',
    onRegenerate,
    showRegenerate = false,
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
    className,
    webSearchEnabled = false,
    onToggleWebSearch,
}: PromptControlsProps) {
    const { t } = useLanguage();
    const [titlePopoverOpen, setTitlePopoverOpen] = useState(false);
    const [walkthroughOpen, setWalkthroughOpen] = useState(false);
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleMetaLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target.id === 'meta-popover-trigger') {
                setTitlePopoverOpen(false);
                setWalkthroughOpen(true);
            }
        };

        document.addEventListener('click', handleMetaLinkClick);
        return () => document.removeEventListener('click', handleMetaLinkClick);
    }, []);

    const handleMouseEnter = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setTitlePopoverOpen(true);
    };

    const handleMouseLeave = () => {
        hoverTimeout.current = setTimeout(() => {
            setTitlePopoverOpen(false);
        }, 100);
    };

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
        <div className={cn("bg-surface-200 flex flex-col overflow-hidden h-fit [&_*]:!font-heading [&_textarea]:!font-['Manrope']", className)}>
            <div className="px-4 pb-4 pt-3 flex flex-col gap-1 min-h-0">
                {/* Chatbox */}
                <div id="prompt-controls-chatbox" className="mb-2">
                    <Chatbox
                        value={chatValue}
                        onChange={onChatChange ?? (() => {})}
                        onSubmit={onChatSubmit}
                        submitButtonId={chatSubmitButtonId}
                        disableSend={disableSend}
                        animationKey={chatAnimationKey}
                        waitingforOptimization={waitingforOptimization}
                        onUploadFiles={onUploadFiles}
                        files={files}
                        onRemoveFile={onRemoveFile}
                        onRegenerate={onRegenerate}
                        showRegenerate={showRegenerate}
                        readOnly={readOnly}
                        // Archived: the primary action button in this panel is the single
                        // source of submit/optimize. Flip to `false` to restore the in-chatbox
                        // submit button. This is the ONLY place the flag is set — no layered defaults.
                        hideSubmitButton={true}
                        autoResize={readOnly}
                        webSearchEnabled={webSearchEnabled}
                        onToggleWebSearch={onToggleWebSearch}
                        className={cn("z-50 w-full", readOnly ? "flex-none" : "flex-auto min-h-0")}
                    />
                </div>

                {/* Parameters area */}
                <div className="flex-initial flex flex-col justify-end min-h-0 overflow-y-auto">
                    <div className="flex items-center gap-1.5 mt-2 mb-1">
                        <h3 className="font-bold text-foreground text-lg">{t('components.promptControls.title')}</h3>
                        <Popover open={titlePopoverOpen} onOpenChange={setTitlePopoverOpen}>
                            <PopoverTrigger asChild onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                <Info className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
                            </PopoverTrigger>
                            <PopoverContent
                                side="top"
                                align="start"
                                sideOffset={6}
                                className="max-w-xs bg-emerald-600 text-white rounded-xl shadow-lg px-5 py-4 text-sm font-medium border-none leading-relaxed z-[100]"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                {t('components.promptControls.titleInfo')}
                            </PopoverContent>
                        </Popover>
                    </div>
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
                        <Separator className="my-1" />
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
                        <Separator className="my-1" />
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
                        <Separator className="my-1" />
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

                    <div className="flex py-3 items-stretch">
                        <Button
                            onClick={handleSubmitClick}
                            variant="secondary"
                            size="lg"
                            className="flex-1 min-h-[48px] leading-tight whitespace-normal text-center font-heading font-semibold bg-brand-tertiary-500 hover:bg-brand-tertiary-600 text-white"
                            disabled={buttonMode === 'submit' ? disableSend : disableOptimize}
                        >
                            {buttonMode === 'submit'
                                ? t('components.promptControls.sendPrompt')
                                : t('components.promptControls.sendOptimizedPrompt')}
                        </Button>
                    </div>
                    <p className="text-[10px] leading-snug text-muted-foreground/70 text-left">
                        LLMs used in the creation of prompt optimizations and generated outputs include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
                    </p>
                </div>
            </div>

            <Dialog open={walkthroughOpen} onOpenChange={setWalkthroughOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-8 rounded-3xl border-none shadow-2xl">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-3xl font-bold font-heading text-foreground tracking-tight">Prompt Optimization Overview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-8">
                        <p className="text-base leading-relaxed text-muted-foreground font-heading max-w-4xl">
                            This diagram shows an overview of the prompt playground. A standard LLM is used for response generation, but a <b>specialized LLM</b> must be used for the prompt optimization, because this task has a relatively small scope. This is accomplished by giving a general-purpose LLM a specialized <b>system prompt</b>, where it’s given instructions and rules, as well as expected input and output formats. The user’s prompt is then injected into a standardized <b>meta-prompt</b> which reduces LLM volatility and encourages it to stay on-task. Also injected into the meta-prompt are the parameters selected by the user, formatted for coherency. The meta-prompt is passed to the optimizer LLM and it generates a suitable optimization prompt. The user’s original prompt is always used as the baseline prompt in order to prevent <b>model collapse</b>.
                        </p>
                        <div className="flex justify-center bg-muted/30 p-10 rounded-3xl border border-border/50 shadow-inner">
                            <img
                                src={optimizationFig}
                                alt="Prompt Optimization Diagram"
                                className="max-w-full h-auto rounded-xl shadow-xl border border-white/20"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}