import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Chatbox from "./ChatBox";
import { Parameters } from "@/pages/PromptPlayground"; // Assuming the type can be imported

// --- REFACTORED: ParameterProps now uses a key to identify the parameter ---
interface ParameterProps {
    parameterTitle: string;
    parameterKey: keyof Parameters; // Key to identify the parameter in the state object
    leftParameter: string;
    rightParameter: string;
    showParameter?: boolean;
    enabled?: boolean;
    currentValue: string;
    onParameterChange?: (key: keyof Parameters, value: string) => void;
}
function Parameter({
    parameterTitle,
    parameterKey,
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

    // --- REFACTORED: Handler now passes the parameterKey back to the parent ---
    const handleValueChange = (value: string) => {
        if (enabled && onParameterChange) {
            onParameterChange(parameterKey, value);
        }
    };

    return <fieldset 
        className={`my-2 p-0 px-1 border border-border rounded-lg ${!enabled && 'opacity-60 pointer-events-none'}`}
        disabled={!enabled}
    >
        <legend className="text-xs font-medium text-muted-foreground px-2 mx-auto">
            {parameterTitle}
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
                <Label htmlFor={`${parameterTitle}-r2`} className="text-[10px] font-normal whitespace-nowrap px-1">No Change</Label>
            </div>
            
            <div className="flex flex-1 flex-col items-center gap-1 w-1/4">
                <RadioGroupItem value={rightParameter} id={`${parameterTitle}-r3`} />
                <Label htmlFor={`${parameterTitle}-r3`} className="text-[10px] font-normal whitespace-nowrap px-1">{rightParameter}</Label>
            </div>
        </RadioGroup>
    </fieldset>;
}

// --- REFACTORED: Props are now consolidated into a single `parameters` object ---
interface PromptControlsProps {
    showSpecificity?: boolean;
    showStyle?: boolean;
    showContext?: boolean;
    showBias?: boolean;
    enableSpecificity?: boolean;
    enableStyle?: boolean;
    enableContext?: boolean;
    enableBias?: boolean;

    // Consolidated state and handler
    parameters: Parameters;
    onParameterChange: (key: keyof Parameters, value: string) => void;

    // Event handlers
    onReset?: () => void;
    onOptimize?: () => void;
    undoEnabled?: boolean;
    onUndo?: () => void;
    disableSend?: boolean;
    disableOptimize?: boolean;
    waitingforOptimization?: boolean;

    // ChatBox control props
    chatValue?: string;
    onChatChange?: (value: string) => void;
    onChatSubmit?: (value: string) => void;
    chatSubmitButtonId?: string;

    // external key to trigger chatbox animation
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
    // --- REFACTORED: Removed local state and individual handlers ---

    const handleResetClick = () => {
        if (onReset) onReset();
    };
    const handleSubmitClick = () => {
        if (onOptimize) onOptimize();
    };
    const handleUndoClick = () => {
        if (onUndo && undoEnabled) onUndo();
    };

    // --- REFACTORED: Disabled logic now checks the parameters object ---
    const isAnyParameterSet = Object.values(parameters).some(p => p !== "");

    return <Card className="bg-card border border-border rounded-lg max-w-sm h-full">
        <CardContent className="p-4 h-full flex flex-col gap-2">
            <div className="flex-1 min-h-0">
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
                <h3 className="font-semibold text-card-foreground text-center whitespace-nowrap">Prompt Controls</h3>
                <Separator/>
                <div id='parameters' className="relative">
                    {/* --- REFACTORED: Parameter components now use consolidated props --- */}
                    <Parameter 
                    parameterTitle="Prompt Specificity" parameterKey="specificity" 
                    leftParameter="General" rightParameter="Specific" 
                    showParameter={showSpecificity} enabled={enableSpecificity} 
                    currentValue={parameters.specificity} 
                    onParameterChange={onParameterChange} 
                    />
                    <Parameter 
                    parameterTitle="Interaction Style" parameterKey="style" 
                    leftParameter="Conversational" rightParameter="Instructional" 
                    showParameter={showStyle} enabled={enableStyle} 
                    currentValue={parameters.style} 
                    onParameterChange={onParameterChange} 
                    />
                    <Parameter 
                    parameterTitle="Context" parameterKey="context" 
                    leftParameter="No Background" rightParameter="With Background" 
                    showParameter={showContext} enabled={enableContext} 
                    currentValue={parameters.context} 
                    onParameterChange={onParameterChange} 
                    />
                    <Parameter 
                    parameterTitle="Bias" parameterKey="bias" 
                    leftParameter="No Bias" rightParameter="With Bias" 
                    showParameter={showBias} enabled={enableBias} 
                    currentValue={parameters.bias} 
                    onParameterChange={onParameterChange} 
                    />
                </div>

                <div className="flex gap-2 items-stretch">
                    <Button 
                        onClick={handleSubmitClick} 
                        variant="default" 
                        size="sm" 
                        className="flex-1 min-h-[48px] leading-tight rounded-full whitespace-normal text-center"
                        disabled={disableOptimize}> 
                        Send Optimized Prompt
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>;
}