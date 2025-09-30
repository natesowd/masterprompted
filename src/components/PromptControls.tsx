import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Updated ParameterProps to use three-option radio buttons
interface ParameterProps {
    parameterTitle: string;
    leftParameter: string;
    rightParameter: string;
    showParameter?: boolean;
    enabled?: boolean;
    currentValue: "left" | "middle" | "right"; // Three states
    onParameterChange?: (param: "left" | "middle" | "right") => void;
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
    
    return (
        <div className="my-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                {parameterTitle}
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">i</span>
                </div>
            </h4>
            
            {/* Radio button controls */}
            <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-300 z-0"></div>
                
                {/* Radio buttons container */}
                <div className="flex justify-between items-center relative z-10">
                    {/* Left option */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => enabled && onParameterChange?.("left")}
                            className={`w-6 h-6 rounded-full border-2 transition-colors ${
                                currentValue === "left" 
                                    ? "bg-emerald-500 border-emerald-500" 
                                    : "bg-white border-gray-300 hover:border-gray-400"
                            } ${!enabled && "cursor-not-allowed opacity-50"}`}
                            disabled={!enabled}
                        >
                            {currentValue === "left" && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto"></div>
                            )}
                        </button>
                        <span className="text-xs text-gray-600 mt-2 text-center max-w-20">
                            {leftParameter}
                        </span>
                    </div>
                    
                    {/* Middle option */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => enabled && onParameterChange?.("middle")}
                            className={`w-6 h-6 rounded-full border-2 transition-colors ${
                                currentValue === "middle" 
                                    ? "bg-emerald-500 border-emerald-500" 
                                    : "bg-white border-gray-300 hover:border-gray-400"
                            } ${!enabled && "cursor-not-allowed opacity-50"}`}
                            disabled={!enabled}
                        >
                            {currentValue === "middle" && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto"></div>
                            )}
                        </button>
                    </div>
                    
                    {/* Right option */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => enabled && onParameterChange?.("right")}
                            className={`w-6 h-6 rounded-full border-2 transition-colors ${
                                currentValue === "right" 
                                    ? "bg-emerald-500 border-emerald-500" 
                                    : "bg-white border-gray-300 hover:border-gray-400"
                            } ${!enabled && "cursor-not-allowed opacity-50"}`}
                            disabled={!enabled}
                        >
                            {currentValue === "right" && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto"></div>
                            )}
                        </button>
                        <span className="text-xs text-gray-600 mt-2 text-center max-w-20">
                            {rightParameter}
                        </span>
                    </div>
                </div>
            </div>
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
}

export default function PromptControls({
    showSpecificity = true,
    showStyle = true,
    showContext = true,
    showBias = true,
    enableSpecificity = true,
    enableStyle = true,
    enableContext = true,
    enableBias = true
}: PromptControlsProps) {
    // Use three-state values: "left", "middle", "right"
    const [specificity, setSpecificity] = useState<"left" | "middle" | "right">("middle");
    const [style, setStyle] = useState<"left" | "middle" | "right">("middle");
    const [context, setContext] = useState<"left" | "middle" | "right">("middle");
    const [bias, setBias] = useState<"left" | "middle" | "right">("middle");

    // Reset to middle position
    const handleReset = () => {
        setSpecificity("middle");
        setStyle("middle");
        setContext("middle");
        setBias("middle");
    };

    const handleSubmit = () => {
        // Handle submit logic here
        console.log("Specificity:", specificity);
        console.log("Style:", style);
        console.log("Context:", context);
        console.log("Bias:", bias);
    }

    return (
        <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src="/lovable-uploads/Prompt Construction.png.png"
                        alt="Prompt Construction"
                        className="w-8 h-8 flex-shrink-0"
                    />
                    <h3 className="font-semibold text-gray-900">Prompt Controls</h3>
                </div>
                <div>
                    <div className="relative">
                        {/* Updated parameters to match the image */}
                        <Parameter
                            parameterTitle="Specificity"
                            leftParameter="More General"
                            rightParameter="More Specific"
                            showParameter={showSpecificity}
                            enabled={enableSpecificity}
                            currentValue={specificity}
                            onParameterChange={setSpecificity}
                        />
                        <Parameter
                            parameterTitle="Interaction Style"
                            leftParameter="More Technical"
                            rightParameter="More Human"
                            showParameter={showStyle}
                            enabled={enableStyle}
                            currentValue={style}
                            onParameterChange={setStyle}
                        />
                        <Parameter
                            parameterTitle="Context"
                            leftParameter="With Background"
                            rightParameter="No Background"
                            showParameter={showContext}
                            enabled={enableContext}
                            currentValue={context}
                            onParameterChange={setContext}
                        />
                        <Parameter
                            parameterTitle="Confirmation Bias"
                            leftParameter="No Bias"
                            rightParameter="Biased"
                            showParameter={showBias}
                            enabled={enableBias}
                            currentValue={bias}
                            onParameterChange={setBias}
                        />
                    </div>

                    <div className="mt-6">
                        <Button
                            onClick={handleSubmit}
                            variant="default"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            Modify Prompt
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}