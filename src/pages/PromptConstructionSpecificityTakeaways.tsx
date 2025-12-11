import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { useLanguage } from "@/contexts/LanguageContext";

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
        <div className="mb-5"></div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('promptConstructionModule.takeaways.title')}</h1>
          <h2 className="text-4xl font-bold text-foreground mb-12">{t('promptConstructionModule.takeaways.subtitle')}</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                1
              </div>
              <p className="text-lg text-foreground pt-2">
                <span className="font-bold">{t('promptConstructionModule.takeaways.point1Title')}</span>{t('promptConstructionModule.takeaways.point1')}
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                2
              </div>
              <p className="text-lg text-foreground pt-2">
                <span className="font-bold">{t('promptConstructionModule.takeaways.point2Title')}</span>{t('promptConstructionModule.takeaways.point2')}
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                3
              </div>
              <p className="text-lg text-foreground pt-2">
                <span className="font-bold">{t('promptConstructionModule.takeaways.point3Title')}</span>{t('promptConstructionModule.takeaways.point3')}
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <button 
              onClick={() => navigate("/playground")}
              className="bg-green-400 hover:bg-green-500 text-black font-medium px-8 py-3 rounded-full transition-colors inline-flex items-center gap-3"
            >
              {t('promptConstructionModule.takeaways.promptPlayground')}
              <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5H11M11 5L7 1M11 5L7 9" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
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
