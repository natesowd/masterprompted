import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

import starImage from "@/assets/star.png";
import mannequinImage from "@/assets/mannequin.png";
import dumbbellImg from "@/assets/dumbbell.png";
import magnifyingGlassImage from "@/assets/magnifying-glass.png";

type KnowledgeLevel = 'none' | 'builds';

const LEVEL_CONFIG: Record<KnowledgeLevel, { label: string; labelDe: string; className: string }> = {
  none:   { label: "No Prior Knowledge", labelDe: "Kein Vorwissen nötig", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  builds: { label: "Builds on Knowledge", labelDe: "Baut auf Vorwissen auf", className: "bg-amber-100 text-amber-700 border-amber-200" },
};

const LEARNING_UNITS = [
  {
    key: 'introduction',
    route: '/module/intro',
    number: 0,
    image: '/task.png',
    level: 'none' as KnowledgeLevel,
  },
  {
    key: 'nextWordPrediction',
    route: '/module/next-word-prediction',
    number: 1,
    image: '/stair.png',
    level: 'none' as KnowledgeLevel,
  },
  {
    key: 'promptConstruction',
    route: '/module/prompt-construction',
    number: 2,
    image: starImage,
    level: 'none' as KnowledgeLevel,
  },
  {
    key: 'systemParameters',
    route: '/module/system-parameters',
    number: 3,
    image: mannequinImage,
    level: 'builds' as KnowledgeLevel,
  },
  {
    key: 'multipleSources',
    route: '/module/multiple-sources',
    number: 4,
    image: magnifyingGlassImage,
    level: 'builds' as KnowledgeLevel,
  },
  {
    key: 'llmTraining',
    route: '/module/llm-training',
    number: 5,
    image: dumbbellImg,
    level: 'builds' as KnowledgeLevel,
  },
];

export default function Modules() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const spacerIndex = LEARNING_UNITS.length; // index of the blank card

  const onApiChange = useCallback((api: CarouselApi) => {
    if (!api) return;
    const onSelect = () => {
      const snap = api.selectedScrollSnap();
      if (snap === spacerIndex) {
        // Skip past the spacer — jump forward
        api.scrollNext();
      } else {
        setSelectedIndex(snap);
      }
    };
    onSelect();
    api.on("select", onSelect);
  }, [spacerIndex]);

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

          {/* Learning units carousel */}
          <div className="px-12 mb-8">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              setApi={onApiChange}
              className="w-full overflow-visible"
            >
              <CarouselContent className="-ml-5 overflow-visible py-4">
                {[...LEARNING_UNITS, null].map((unit, index) => {
                  const isSelected = index === selectedIndex;
                  if (!unit) {
                    return (
                      <CarouselItem key="spacer" className="pl-5 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                        <Card className={`rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 border border-dashed border-border bg-background ${isSelected ? "scale-105" : "opacity-50 scale-95"}`}>
                          <div className="aspect-[4/3]" />
                          <div className="p-4 flex-1" />
                        </Card>
                      </CarouselItem>
                    );
                  }
                  return (
                    <CarouselItem
                      key={unit.key}
                      className="pl-5 basis-[85%] sm:basis-1/2 lg:basis-1/3"
                    >
                      <Card
                        className={`rounded-xl overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? "border-2 border-emerald-500 bg-background scale-105"
                            : "border border-border bg-background opacity-50 scale-95"
                        }`}
                        onClick={() => navigate(unit.route)}
                      >
                        <div className="aspect-[4/3] bg-muted/30 flex items-center justify-center p-6">
                          <img
                            src={unit.image}
                            alt={t(`modules.units.${unit.key}.title`)}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground font-heading">
                              {unit.number === 0
                                ? t('modules.introLabel')
                                : `${t('modules.unitLabel')} ${unit.number}`}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0.5 h-auto font-medium whitespace-nowrap ${LEVEL_CONFIG[unit.level].className}`}
                            >
                              {LEVEL_CONFIG[unit.level].label}
                            </Badge>
                          </div>
                          <h2 className="font-heading font-semibold text-foreground text-sm leading-tight mb-1">
                            {t(`modules.units.${unit.key}.title`)}
                          </h2>
                          <p className="text-xs text-muted-foreground leading-snug mb-3 line-clamp-2 flex-1">
                            {t(`modules.units.${unit.key}.description`)}
                          </p>
                        </div>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            {/* Single enter button for selected unit */}
            {selectedIndex < LEARNING_UNITS.length && (
              <div className="flex justify-center mt-6">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                  onClick={() => navigate(LEARNING_UNITS[selectedIndex].route)}
                >
                  {t(`modules.units.${LEARNING_UNITS[selectedIndex].key}.title`)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
