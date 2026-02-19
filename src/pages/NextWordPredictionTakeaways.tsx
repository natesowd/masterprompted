import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * NextWordPredictionTakeaways - Summary page showing key learnings from the module
 * Displays numbered takeaway points in a consistent format
 */
export default function Takeaways() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleNextTask = () => {
    navigate("/module/prompt-construction");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5" />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-h2 font-heading text-foreground mb-2">
            {t('nextWord.takeaways.title')}
          </h1>
          <h2 className="text-h2 font-heading text-foreground mb-12">
            {t('nextWord.takeaways.subtitle')}
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                1
              </div>
              <p className="text-body-1 text-foreground pt-2">
                <span className="font-bold">{t('nextWord.takeaways.point1Title')}</span>
                {t('nextWord.takeaways.point1')}
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                2
              </div>
              <p className="text-body-1 text-foreground pt-2">
                <span className="font-bold">{t('nextWord.takeaways.point2Title')}</span>
                {t('nextWord.takeaways.point2')}
              </p>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                3
              </div>
              <p className="text-body-1 text-foreground pt-2">
                <span className="font-bold">{t('nextWord.takeaways.point3Title')}</span>
                {t('nextWord.takeaways.point3')}
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <Button 
              onClick={handleNextTask}
              className="bg-secondary hover:bg-secondary/90 text-foreground font-bold px-8 py-6 rounded-full transition-colors"
            >
              {t('nextWord.takeaways.nextTask')}
            </Button>
          </div>
        </div>
      </main>
      
      <ModuleNavigation 
        previousRoute="/module/next-word-prediction/response" 
        nextRoute="/module/prompt-construction"
      />
    </div>
  );
}
