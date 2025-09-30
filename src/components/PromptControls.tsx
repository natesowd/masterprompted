// src/components/PromptControls.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// 1. Update ParameterProps to use string-based current value and change handler
interface ParameterProps {
    parameterTitle: string;
    leftParameter: string;
    rightParameter: string;
    showParameter?: boolean;
    enabled?: boolean;
    // Removed: leftSelected?: boolean;
    // Removed: handleButtonClick?: (p: boolean) => void;
    
    currentValue: string; // New prop for current selected string value
    onParameterChange?: (param: string) => void; // String setter
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
    
    // 2. New Selection Logic: Left is selected if currentValue is the null state ("") OR matches leftParameter
    const isLeftSelected = currentValue === leftParameter || currentValue === "";
    // Right is selected if currentValue matches rightParameter
    const isRightSelected = currentValue === rightParameter;

    // 3. New Click Handlers: Set state to the parameter string value
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

    return (
        <div className={`my-5`}>
            <h4 className="text-sm font-medium text-gray-700 mx-3">{parameterTitle}</h4>
            <div className={`flex justify-between bg-gray-100 rounded-full p-1 ${!enabled && 'cursor-not-allowed'} ${!enabled && 'opacity-60'}`}>
                <button
                    onClick={handleLeftClick}
                    className={`grow px-4 py-2 text-sm font-medium rounded-full transition-colors
                        ${isLeftSelected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
                        ${enabled ? 'hover:text-gray-800' : 'cursor-not-allowed'}
                    `}
                >
                    {leftParameter}
                </button>
                <button
                    onClick={handleRightClick}
                    className={`grow px-4 py-2 text-sm font-medium rounded-full transition-colors
                        ${isRightSelected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
                        ${enabled ? 'hover:text-gray-800' : 'cursor-not-allowed'}
                    `}
                >
                    {rightParameter}
                </button>
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
    // 4. Remove boolean states:
    /*
    const [isGeneral, setIsGeneral] = useState(true);
    const [isConversational, setIsConversational] = useState(true);
    const [hasNoContext, setHasNoContext] = useState(true);
    const [hasNoBias, setHasNoBias] = useState(true);
    */

    // 5. Use string states, initialized to the null state ("")
    const [specificity, setSpecificity] = useState<string>("General");
    const [style, setStyle] = useState<string>("Conversational");
    const [context, setContext] = useState<string>("No Background");
    const [bias, setBias] = useState<string>("No Bias");

    // 6. Update handleReset to set all states to the null string value
    const handleReset = () => {
        setSpecificity("General");
        setStyle("Conversational");
        setContext("No Background");
        setBias("No Bias");
    };

    const handleSubmit = () => {
        // Handle submit logic here
        // The values to use are specificity, style, context, and bias
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
                        {/* Selectors - Updated to use string states */}
                        <Parameter
                            parameterTitle="Prompt Specificity"
                            leftParameter="General"
                            rightParameter="Specific"
                            showParameter={showSpecificity}
                            enabled={enableSpecificity}
                            currentValue={specificity}
                            onParameterChange={setSpecificity}
                        />
                        <Parameter
                            parameterTitle="Interaction Style"
                            leftParameter="Conversational"
                            rightParameter="Instructional"
                            showParameter={showStyle}
                            enabled={enableStyle}
                            currentValue={style}
                            onParameterChange={setStyle}
                        />
                        <Parameter
                            parameterTitle="Context"
                            leftParameter="No Background"
                            rightParameter="With Background"
                            showParameter={showContext}
                            enabled={enableContext}
                            currentValue={context}
                            onParameterChange={setContext}
                        />
                        <Parameter
                            parameterTitle="Bias"
                            leftParameter="No Bias"
                            rightParameter="With Bias"
                            showParameter={showBias}
                            enabled={enableBias}
                            currentValue={bias}
                            onParameterChange={setBias}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={handleSubmit} // Added onClick handler
                            variant="default"
                            size="sm"
                            className="flex-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        >
                            Apply Changes
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}