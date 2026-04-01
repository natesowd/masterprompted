import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";
import { FourPointStar } from "@/components/FourPointStar";
import starImage from "@/assets/star.png";
import mannequinImage from "@/assets/mannequin.png";
import dumbbellImg from "@/assets/dumbbell.png";
import magnifyingGlassImage from "@/assets/magnifying-glass.png";

type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';

const LEVEL_CONFIG: Record<KnowledgeLevel, { stars: number; className: string }> = {
  beginner:     { stars: 1, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  intermediate: { stars: 2, className: "bg-amber-100 text-amber-700 border-amber-200" },
  advanced:     { stars: 3, className: "bg-rose-100 text-rose-700 border-rose-200" },
};

const LEARNING_UNITS = [
  {
    key: 'introduction',
    route: '/module/intro',
    number: 0,
    image: '/task.png',
    level: 'beginner' as KnowledgeLevel,
  },
  {
    key: 'nextWordPrediction',
    route: '/module/next-word-prediction',
    number: 1,
    image: '/stair.png',
    level: 'beginner' as KnowledgeLevel,
  },
  {
    key: 'promptConstruction',
    route: '/module/prompt-construction',
    number: 2,
    image: starImage,
    level: 'intermediate' as KnowledgeLevel,
  },
  {
    key: 'systemParameters',
    route: '/module/system-parameters',
    number: 3,
    image: mannequinImage,
    level: 'intermediate' as KnowledgeLevel,
  },
  {
    key: 'multipleSources',
    route: '/module/multiple-sources',
    number: 4,
    image: magnifyingGlassImage,
    level: 'advanced' as KnowledgeLevel,
  },
  {
    key: 'llmTraining',
    route: '/module/llm-training',
    number: 5,
    image: dumbbellImg,
    level: 'advanced' as KnowledgeLevel,
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
            {LEARNING_UNITS.map((unit) => (
              <Card
                key={unit.key}
                className="group border border-border hover:border-secondary transition-all rounded-xl bg-white overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-muted/30 flex items-center justify-center p-6">
                  <img
                    src={unit.image}
                    alt={t(`modules.units.${unit.key}.title`)}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground font-heading">
                      {unit.number === 0
                        ? t('modules.introLabel')
                        : `${t('modules.unitLabel')} ${unit.number}`}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-5 gap-0.5 font-medium ${LEVEL_CONFIG[unit.level].className}`}
                    >
                      {Array.from({ length: LEVEL_CONFIG[unit.level].stars }).map((_, i) => (
                        <FourPointStar key={i} className="h-2.5 w-2.5" />
                      ))}
                    </Badge>
                  </div>
                  <h2 className="font-heading font-semibold text-foreground text-sm leading-tight mb-1">
                    {t(`modules.units.${unit.key}.title`)}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-snug mb-3 line-clamp-2 flex-1">
                    {t(`modules.units.${unit.key}.description`)}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => navigate(unit.route)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
