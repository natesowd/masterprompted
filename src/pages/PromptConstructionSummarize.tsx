import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";

import { Card, CardContent } from "@/components/ui/card";
import { Plus, Paperclip } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PromptConstructionSummarize() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
        <div className="max-w-4xl mx-auto relative min-h-[calc(100vh-300px)]">
          
          {/* Add Document Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 bg-card border border-border rounded-2xl shadow-lg outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
              isDocumentAttached 
                ? 'border-primary bg-primary/5' 
                : 'hover:border-border hover:shadow-md'
            }`}
            style={{
              position: 'absolute',
              top: '200px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '768px'
            }}
            onClick={handleAddDocument}
          >
            <CardContent className="p-6">
              {!isDocumentAttached ? (
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-medium">{t('promptConstructionModule.summarize.addDocument')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-primary">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Paperclip className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-foreground">{t('promptConstructionModule.summarize.documentAttached')}</span>
                    <span className="text-sm text-muted-foreground">{t('promptConstructionModule.summarize.fileName')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
      </main>
    </div>
  );
}