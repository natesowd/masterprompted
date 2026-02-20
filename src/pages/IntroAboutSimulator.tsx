import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * IntroAboutSimulator - About page explaining the simulator before starting
 * Shows information about LLMs used and the simulator purpose
 */
const AboutSimulator = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleStartSimulator = () => {
    navigate("/module/intro/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[600px] relative">
          <Card className="w-full max-w-4xl flex flex-col md:flex-row items-start p-8 md:p-10 gap-6 md:gap-8 border border-border shadow-lg rounded-2xl bg-white">
            {/* Image inside the popup - aligned to top and smaller */}
            <img
              src="/whatis.png"
              alt="What is simulator cone"
              className="w-full md:w-[325px] h-auto flex-shrink-0" />

            
            <CardContent className="p-0 w-full flex flex-col">
              {/* About label */}
              <div className="mb-6">
                <span className="text-muted-foreground text-sm">
                  {t('intro.aboutSimulator.label')}
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-h2 font-heading text-foreground mb-3">
                {t('intro.aboutSimulator.title')}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-body-1 leading-relaxed mb-6">
                {t('intro.aboutSimulator.description')}
              </p>

              {/* LLMs info */}
              <p className="text-muted-foreground text-body-2 leading-relaxed mb-8">
                {t('intro.aboutSimulator.llmsUsed')}
              </p>

              {/* Continue button */}
              <Button
                onClick={handleStartSimulator}
                className="w-fit px-10 py-6 font-heading font-semibold text-lg rounded-full"
              >
                {t('intro.aboutSimulator.continue')}
                <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-3">
                  <path d="M1 5H11M11 5L7 1M11 5L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>);

};

export default AboutSimulator;