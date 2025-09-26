import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ParameterProps {
    parameterTitle: string;
    leftParameter: string;
    rightParameter: string;
    showParameter?: boolean;
    enabled?: boolean;
    leftSelected?: boolean;
    handleButtonClick?: (p: boolean) => void;
    onParameterChange?: (param: string) => void;
}

function Parameter({ 
    parameterTitle, 
    leftParameter, 
    rightParameter, 
    showParameter = true, 
    enabled = true,
    leftSelected = false,
    handleButtonClick,
    onParameterChange 
}: ParameterProps) {
    // const [leftSelected, setLeftSelected] = useState(propSelector);

    if (!showParameter) {
        return null;
    }

    const handleLeftClick = () => {
        if (enabled) {
            leftSelected = true;
            handleButtonClick?.(true);
            onParameterChange?.(leftParameter);
        }
    };

    const handleRightClick = () => {
        if (enabled) {
            leftSelected = false;
            handleButtonClick?.(false);
            onParameterChange?.(rightParameter);
        }
    };

    return (
        <div className={`my-10 `}>
            <h4 className="text-sm font-medium text-gray-700 mx-3">{parameterTitle}</h4>
            <div className={`flex justify-between bg-gray-100 rounded-full p-1 ${!enabled && 'cursor-not-allowed'} ${!enabled && 'opacity-60'}`}>
                <button
                    onClick={handleLeftClick}
                    className={`grow px-4 py-2 text-sm font-medium rounded-full transition-colors
                        ${leftSelected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
                        ${enabled ? 'hover:text-gray-800' : 'cursor-not-allowed'}
                    `}
                >
                    {leftParameter}
                </button>
                <button
                    onClick={handleRightClick}
                    className={`grow px-4 py-2 text-sm font-medium rounded-full transition-colors
                        ${!leftSelected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}
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
    enableSpecificity= true,
    enableStyle= true,
    enableContext= true,
    enableBias= true
}: PromptControlsProps) {
    const [isGeneral, setIsGeneral] = useState(true);
    const [isConversational, setIsConversational] = useState(true);
    const [hasNoContext, setHasNoContext] = useState(true);
    const [hasNoBias, setHasNoBias] = useState(true);

    const handleReset = () => {
        setIsGeneral(true);
        setIsConversational(true);
        setHasNoContext(true);
        setHasNoBias(true);

    };

    const handleSubmit = () => {
        // Handle submit logic here
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

                <div className="space-y-4">
                    <div>
                        <div className="relative">
                            {/* Selectors */}
                            <Parameter
                                parameterTitle="Prompt Specificity"
                                leftParameter="General"
                                rightParameter="Specific"
                                showParameter={showSpecificity}
                                enabled={enableSpecificity}
                                leftSelected={isGeneral}
                                handleButtonClick={(p) => setIsGeneral(p)}
                            />
                            <Parameter
                                parameterTitle="Interaction Style"
                                leftParameter="Conversational"
                                rightParameter="Instructional"
                                showParameter={showStyle}
                                enabled={enableStyle}
                                leftSelected={isConversational}
                                handleButtonClick={(p) => setIsConversational(p)}
                                
                            />
                            <Parameter
                                parameterTitle="Context"
                                leftParameter="No Background"
                                rightParameter="With Background"
                                showParameter={showContext}
                                enabled={enableContext}
                                leftSelected={hasNoContext}
                                handleButtonClick={(p) => setHasNoContext(p)}
                            />
                            <Parameter
                                parameterTitle="Bias"
                                leftParameter="No Bias"
                                rightParameter="With Bias"
                                showParameter={showBias}
                                enabled={enableBias}
                                leftSelected={hasNoBias}
                                handleButtonClick={(p) => setHasNoBias(p)}
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
                                variant="default"
                                size="sm"
                                className="flex-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            >
                                Apply Changes
                            </Button>
                        </div>

                        
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}