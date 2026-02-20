import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PromptConstructionSpecificityTakeaways() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleDownload = () => {
    const title = t('promptConstructionModule.takeaways.title');
    const subtitle = t('promptConstructionModule.takeaways.subtitle');
    const points = [
      { title: t('promptConstructionModule.takeaways.point1Title'), body: t('promptConstructionModule.takeaways.point1') },
      { title: t('promptConstructionModule.takeaways.point2Title'), body: t('promptConstructionModule.takeaways.point2') },
      { title: t('promptConstructionModule.takeaways.point3Title'), body: t('promptConstructionModule.takeaways.point3') },
    ];
    const content = [
      `${title} ${subtitle}`,
      '',
      ...points.map((p, i) => `${i + 1}. ${p.title}${p.body}`),
      '',
      '---',
      'Tips for better prompting:',
      '• Be specific – include dates, names, scope, and format expectations.',
      '• Provide context – attach relevant documents or background info.',
      '• Stay neutral – avoid conversational or leading language.',
      '• Iterate – refine your prompt based on the output you receive.',
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt-construction-takeaways.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5" />
        <div className="max-w-4xl mx-auto pt-0 mt-[130px]">
          <h1 className="text-h2 font-heading text-foreground mb-2">
            {t('promptConstructionModule.takeaways.title')}
          </h1>
          <h2 className="text-h2 font-heading text-foreground mb-12">
            {t('promptConstructionModule.takeaways.subtitle')}
          </h2>
          
          <div className="space-y-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {n}
                </div>
                <p className="text-body-1 text-foreground pt-2">
                  <span className="font-bold">{t(`promptConstructionModule.takeaways.point${n}Title`)}</span>
                  {t(`promptConstructionModule.takeaways.point${n}`)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 flex items-center gap-4">
            <Button
              onClick={() => navigate("/playground")}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8 py-6 rounded-full transition-colors">
              {t('promptConstructionModule.takeaways.promptPlayground')}
              <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-3">
                <path d="M1 5H11M11 5L7 1M11 5L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full px-6 py-6">
                  <Download className="h-4 w-4 mr-2" />
                  {t('promptConstructionModule.takeaways.download')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-heading">{t('promptConstructionModule.takeaways.download')}</DialogTitle>
                </DialogHeader>
                <div className="border border-border rounded-lg bg-muted/30 p-5 font-mono text-sm text-muted-foreground space-y-2 whitespace-pre-line max-h-[50vh] overflow-y-auto">
                  <p className="font-bold text-foreground">{t('promptConstructionModule.takeaways.title')} {t('promptConstructionModule.takeaways.subtitle')}</p>
                  <p>1. {t('promptConstructionModule.takeaways.point1Title')}{t('promptConstructionModule.takeaways.point1')}</p>
                  <p>2. {t('promptConstructionModule.takeaways.point2Title')}{t('promptConstructionModule.takeaways.point2')}</p>
                  <p>3. {t('promptConstructionModule.takeaways.point3Title')}{t('promptConstructionModule.takeaways.point3')}</p>
                  <hr className="border-border my-2" />
                  <p className="font-bold text-foreground">Tips for better prompting:</p>
                  <p>• Be specific – include dates, names, scope, and format expectations.</p>
                  <p>• Provide context – attach relevant documents or background info.</p>
                  <p>• Stay neutral – avoid conversational or leading language.</p>
                  <p>• Iterate – refine your prompt based on the output you receive.</p>
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={handleDownload} className="rounded-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download .txt
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      <ModuleNavigation
        previousRoute="/module/prompt-construction/specificity/response"
        nextRoute="/module/prompt-construction/conversation-style" />
    </div>
  );
}