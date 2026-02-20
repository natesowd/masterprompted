import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import starImage from "@/assets/star.png";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * PromptConstructionBase - Introduction page for the Prompt Construction module
 * Shows an overview card with image and description before the interactive exercises
 */
export default function PromptConstruction() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleContinue = () => {
    navigate("/module/prompt-construction/specificity");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5" />
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[600px]">
          <Card className="flex flex-row items-start gap-10 p-10 bg-card border border-border shadow-lg rounded-2xl">
            {/* Left column - Star image */}
            <div className="flex-shrink-0">
              <img 
                src={starImage} 
                alt="Star illustration" 
                className="w-[325px] h-auto"
              />
            </div>

            {/* Right column - Content */}
            <CardContent className="p-0 w-full flex flex-col">
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-muted-foreground text-sm">
                  {t('promptConstructionModule.intro.label')}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/modules")}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Main heading */}
              <h1 className="text-h3 font-heading text-foreground mb-3">
                {t('promptConstructionModule.intro.title')}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-body-1 leading-relaxed mb-8 flex-grow">
                {t('promptConstructionModule.intro.description')}
              </p>

              {/* Continue button */}
              <Button 
                onClick={handleContinue}
                className="w-fit px-10 py-6 font-heading font-semibold text-lg rounded-full"
              >
                {t('promptConstructionModule.intro.continue')}
                <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-3">
                  <path d="M1 5H11M11 5L7 1M11 5L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
