import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Paperclip } from "lucide-react";

export default function PromptConstructionSummarize() {
  const navigate = useNavigate();
  const [isDocumentAttached, setIsDocumentAttached] = useState(false);

  const handleAddDocument = () => {
    setIsDocumentAttached(true);
    // After a short delay, navigate to the specificity response page
    setTimeout(() => {
      navigate("/module/prompt-construction/specificity/response");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-4xl mx-auto relative min-h-[600px]">
          
          {/* Add Document Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 bg-white border border-gray-200 rounded-2xl shadow-lg ${
              isDocumentAttached 
                ? 'border-primary bg-primary/5' 
                : 'hover:border-gray-300'
            }`}
            style={{
              position: 'absolute',
              top: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '768px'
            }}
            onClick={handleAddDocument}
          >
            <CardContent className="p-6">
              {!isDocumentAttached ? (
                <div className="flex items-center gap-4 text-gray-700">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg font-medium">Add document</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-primary">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Paperclip className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-gray-900">Document attached</span>
                    <span className="text-sm text-gray-600">EU_AI_Act.pdf</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <ModuleNavigation 
        previousRoute="/module/prompt-construction" 
        nextRoute="/module/prompt-construction/specificity"
      />
    </div>
  );
}