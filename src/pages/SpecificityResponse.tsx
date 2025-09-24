import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Paperclip } from "lucide-react";

export default function SpecificityResponse() {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(true);
  const [specificityValue, setSpecificityValue] = useState([50]);

  const handleReset = () => {
    setSpecificityValue([50]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Prompt Controls */}
          <div className="w-64 flex-shrink-0">
            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Prompt Controls</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Prompt Specificity</h4>
                    
                    <div className="relative">
                      {/* Tooltip */}
                      {showTooltip && (
                        <div className="absolute -top-16 left-0 right-0 z-10">
                          <div 
                            className="bg-emerald-600 text-white p-3 rounded-lg shadow-lg text-sm"
                            style={{
                              borderRadius: '8px',
                              padding: '12px 16px',
                            }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-xs leading-relaxed">
                                First, select this option for the prompt to become more specific
                              </p>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowTooltip(false)}
                                className="h-5 px-2 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
                              >
                                Close
                              </Button>
                            </div>
                            {/* Arrow pointing down */}
                            <div className="absolute -bottom-1 left-6">
                              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-emerald-600"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>General</span>
                        <span>Specific</span>
                      </div>
                      
                      <Slider
                        value={specificityValue}
                        onValueChange={setSpecificityValue}
                        max={100}
                        step={1}
                        className="mb-4"
                      />
                    </div>
                    
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Original Prompt Display */}
            <Card className="bg-gray-50 border border-gray-200 rounded-lg mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">EU_AI_Act.pdf</span>
                </div>
                <p className="text-gray-800">
                  Summarize the main points of the EU AI Act, including its risk categories and rules for high-risk AI systems
                </p>
              </CardContent>
            </Card>

            {/* AI Response */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview of the EU AI Act:</h2>
              
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    The EU AI Act is a regulatory framework proposed by the European Union to ensure the safe and trustworthy development, deployment, and use of artificial intelligence within the EU.
                  </span>
                </li>
                
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    It aims to protect fundamental rights, promote innovation, and create a harmonized set of rules across member states.
                  </span>
                </li>
                
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    The Act classifies AI systems based on their risk level and imposes requirements accordingly.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Sidebar - Journalistic Evaluation */}
          <div className="w-64 flex-shrink-0">
            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Journalistic Evaluation</h3>
                
                <div className="space-y-3">
                  <div>
                    <Select>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📊</span>
                          <SelectValue placeholder="Factual Accuracy" />
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🎯</span>
                          <SelectValue placeholder="Relevance" />
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🗣️</span>
                          <SelectValue placeholder="Voice" />
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">⚖️</span>
                          <SelectValue placeholder="Bias" />
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="significant">Significant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📝</span>
                          <SelectValue placeholder="Plagiarism" />
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None Detected</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}