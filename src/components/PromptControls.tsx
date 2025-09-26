import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ParameterProps {
    parameterTitle: string;
    leftParameter: string;
    rightParameter: string;
    showParameter?: boolean;
    onParameterChange?: (param: string) => void;

}
function Parameter({ parameterTitle, leftParameter, rightParameter, showParameter = true, onParameterChange }: ParameterProps) {
    // Placeholder for parameter selector logic
    const [leftSelected, setLeftSelected] = useState(true);

    if (!showParameter) {
        return null; // Don't render anything if showParameter is false
    }
    return (
        <div className='my-10'>
            <h4 className="text-sm font-medium text-gray-700 mx-3">{parameterTitle}</h4>
            <div className="flex justify-between bg-gray-100 rounded-full p-1">
                <button
                    onClick={() => setLeftSelected(true)}
                    className={`grow px-4 py-2 text-sm font-medium rounded-full transition-colors ${leftSelected
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    {leftParameter}
                </button>
                <button
                    onClick={() => setLeftSelected(false)}
                    className={`grow px-4 py-2 text-sm font-medium rounded-full transition-colors ${!leftSelected
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
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
}

export default function PromptControls({ showSpecificity = true, showStyle = true, showContext = true, showBias = true }: PromptControlsProps) {
    const [isSpecific, setIsSpecific] = useState(false);

    const handleReset = () => {
        setIsSpecific(false);
    };

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
                            />
                            <Parameter
                                parameterTitle="Interaction Style"
                                leftParameter="Conversational"
                                rightParameter="Instructional"
                                showParameter={showStyle}
                            />
                            <Parameter
                                parameterTitle="Context"
                                leftParameter="No Background"
                                rightParameter="With Background"
                                showParameter={showContext}
                            />
                            <Parameter
                                parameterTitle="Bias"
                                leftParameter="No Bias"
                                rightParameter="With Bias"
                                showParameter={showBias}
                            />
                        </div>

                        <Button
                            onClick={handleReset}
                            variant="ghost"
                            size="sm"
                            className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}