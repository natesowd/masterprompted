import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

/**
 * IntroBase - Main introduction page for the learning modules
 * Shows an overview card with image and description before starting the simulator
 */
const Introduction = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleContinue = () => {
    navigate("/module/next-word-prediction");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[600px] relative">
          <Card className="w-full max-w-4xl flex flex-col md:flex-row items-start p-8 md:p-10 gap-6 md:gap-8 border border-border shadow-lg rounded-2xl bg-white">
            {/* Task image inside the popup - aligned to top and smaller */}
            <img
              src="/task.png"
              alt="Task notebook"
              className="w-full md:w-[325px] h-auto flex-shrink-0" />


            <CardContent className="p-0 w-full flex flex-col">
              {/* Introduction label */}
              <div className="mb-6">
                <span className="text-muted-foreground text-sm">
                  {t('intro.base.label')}
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-h2 font-heading text-foreground mb-3">
                {t('intro.base.title')}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-body-1 leading-relaxed mb-8">
                {t('intro.base.description')}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleContinue}
                  className="w-fit px-10 py-6 font-heading font-semibold text-base rounded-full"
                >
                  {t('intro.base.startAtBeginning')}
                  <ArrowRight className="-mr-2 !h-6 !w-6" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/modules")}
                  className="w-fit px-10 py-6 font-heading font-semibold text-base rounded-full"
                >
                  {t('intro.base.selectLearning')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>);

};

export default Introduction;