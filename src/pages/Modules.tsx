import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";
import starImage from "@/assets/star.png";
import mannequinImage from "@/assets/mannequin.png";
import dumbbellImg from "@/assets/dumbbell.png";

const LEARNING_UNITS = [
  {
    key: 'nextWordPrediction',
    route: '/module/next-word-prediction',
    number: 1,
    image: '/stair.png',
  },
  {
    key: 'promptConstruction',
    route: '/module/prompt-construction',
    number: 2,
    image: starImage,
  },
  {
    key: 'systemParameters',
    route: '/module/system-parameters',
    number: 3,
    image: mannequinImage,
  },
  {
    key: 'multipleSources',
    route: '/module/multiple-sources',
    number: 4,
    image: '/magnifying-glass.png',
  },
  {
    key: 'llmTraining',
    route: '/module/llm-training',
    number: 5,
    image: dumbbellImg,
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
        <div className="max-w-5xl mx-auto mt-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-h2 font-heading text-foreground mb-2">
              {t('modules.title')}
            </h1>
            <p className="text-muted-foreground text-body-1">
              {t('modules.subtitle')}
            </p>
          </div>

          {/* Learning units tile grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {LEARNING_UNITS.map((unit) => (
              <Card
                key={unit.key}
                className="group cursor-pointer border border-border hover:border-secondary transition-all rounded-xl bg-white overflow-hidden flex flex-col"
                onClick={() => navigate(unit.route)}
              >
                {/* Image */}
                <div className="aspect-square bg-muted/30 flex items-center justify-center p-6">
                  <img
                    src={unit.image}
                    alt={t(`modules.units.${unit.key}.title`)}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-xs text-muted-foreground font-heading mb-1">
                    {t('modules.unitLabel')} {unit.number}
                  </span>
                  <h2 className="font-heading font-semibold text-foreground text-sm leading-tight">
                    {t(`modules.units.${unit.key}.title`)}
                  </h2>
                </div>
              </Card>
            ))}
          </div>

          {/* Start at beginning CTA */}
          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/module/next-word-prediction")}
              className="rounded-full px-8 py-5 font-heading font-semibold"
            >
              {t('intro.base.startNow')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
