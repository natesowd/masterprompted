import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

const LEARNING_UNITS = [
  {
    key: 'nextWordPrediction',
    route: '/module/next-word-prediction',
    number: 1,
  },
  {
    key: 'promptConstruction',
    route: '/module/prompt-construction',
    number: 2,
  },
  {
    key: 'systemParameters',
    route: '/module/system-parameters',
    number: 3,
  },
  {
    key: 'multipleSources',
    route: '/module/multiple-sources',
    number: 4,
  },
  {
    key: 'llmTraining',
    route: '/module/llm-training',
    number: 5,
  },
];

export default function Modules() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="max-w-3xl mx-auto mt-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-h2 font-heading text-foreground mb-2">
              {t('modules.title')}
            </h1>
            <p className="text-muted-foreground text-body-1">
              {t('modules.subtitle')}
            </p>
          </div>

          {/* Learning units list */}
          <div className="flex flex-col gap-3 mb-8">
            {LEARNING_UNITS.map((unit) => (
              <Card
                key={unit.key}
                className="group cursor-pointer border border-border hover:border-secondary transition-colors rounded-xl bg-white"
                onClick={() => navigate(unit.route)}
              >
                <CardContent className="p-5 flex items-center gap-5">
                  {/* Unit number */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center font-heading font-semibold text-sm">
                    {unit.number}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading font-semibold text-foreground text-base">
                      {t(`modules.units.${unit.key}.title`)}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-0.5 line-clamp-1">
                      {t(`modules.units.${unit.key}.description`)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Start at beginning CTA */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate("/module/next-word-prediction")}
              className="rounded-full px-8 py-5 font-heading font-semibold"
            >
              {t('modules.startAtBeginning')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
