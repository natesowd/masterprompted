import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * NextWordPredictionIntro - Introduction page for the Next Word Prediction module
 * Shows an overview card with image and description before the interactive exercise
 */
const NextWordPredictionIntro = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleContinue = () => {
    navigate("/module/next-word-prediction/prompt");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="max-w-5xl mx-auto py-8">
          <Card className="flex flex-row items-start gap-8 p-10 border border-border shadow-lg rounded-2xl bg-white">
            {/* Image inside the popup - aligned to top */}
            <img
              src="/stair.png"
              alt="Stair blocks"
              className="w-[325px] h-auto flex-shrink-0 mt-2" />

            
            <CardContent className="p-0 w-full flex flex-col">
              {/* Learning label */}
              <div className="flex items-center justify-between w-full mb-6">
                <span className="text-muted-foreground text-sm">
                  {t('nextWord.intro.label')}
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-h2 font-heading text-foreground mb-3">
                {t('nextWord.intro.title')}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-body-1 leading-relaxed mb-8">
                {t('nextWord.intro.description')}
              </p>

              {/* Continue button */}
              <Button
                onClick={handleContinue}
                className="w-fit px-10 py-6 font-heading font-semibold text-lg rounded-full"
              >
                {t('nextWord.intro.continue')}
                <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
                  <path d="M1 5H11M11 5L7 1M11 5L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>);

};

export default NextWordPredictionIntro;