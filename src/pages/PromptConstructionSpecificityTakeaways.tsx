import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * PromptConstructionSpecificityTakeaways - Summary page for the specificity section
 * Displays key learnings and provides navigation to the Prompt Playground
 */
export default function PromptConstructionSpecificityTakeaways() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleContinue = () => {
    navigate("/playground");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-h2 font-heading text-foreground mb-2">
            {t('promptConstructionModule.takeaways.title')}
          </h1>
          <h2 className="text-h2 font-heading text-foreground mb-12">
            {t('promptConstructionModule.takeaways.subtitle')}
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                1
              </div>
              <p className="text-body-1 text-foreground pt-2">
                <span className="font-bold">{t('promptConstructionModule.takeaways.point1Title')}</span>
                {t('promptConstructionModule.takeaways.point1')}
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                2
              </div>
              <p className="text-body-1 text-foreground pt-2">
                <span className="font-bold">{t('promptConstructionModule.takeaways.point2Title')}</span>
                {t('promptConstructionModule.takeaways.point2')}
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                3
              </div>
              <p className="text-body-1 text-foreground pt-2">
                <span className="font-bold">{t('promptConstructionModule.takeaways.point3Title')}</span>
                {t('promptConstructionModule.takeaways.point3')}
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <Button 
              onClick={() => navigate("/playground")}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8 py-6 rounded-full transition-colors"
            >
              {t('promptConstructionModule.takeaways.promptPlayground')}
              <svg 
                width="10" 
                height="8" 
                viewBox="0 0 12 10" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="ml-3"
              >
                <path 
                  d="M1 5H11M11 5L7 1M11 5L7 9" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </Button>
          </div>
        </div>
      </main>
      
      <ModuleNavigation 
        previousRoute="/module/prompt-construction/specificity/response" 
        nextRoute="/module/prompt-construction/conversation-style"
      />
    </div>
  );
}
