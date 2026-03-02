import { useNavigate } from "react-router-dom";
import { Download, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Takeaways() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleDownload = () => {
    const title = t('nextWord.takeaways.title');
    const subtitle = t('nextWord.takeaways.subtitle');
    const points = [
    { title: t('nextWord.takeaways.point1Title'), body: t('nextWord.takeaways.point1') },
    { title: t('nextWord.takeaways.point2Title'), body: t('nextWord.takeaways.point2') },
    { title: t('nextWord.takeaways.point3Title'), body: t('nextWord.takeaways.point3') }];

    const todos = [
    '☐ Before publishing AI-assisted text, verify all facts, quotes, and figures against primary sources.',
    '☐ Always disclose to editors when AI tools were used in drafting or research.',
    '☐ Rephrase and rewrite AI-generated drafts in your own voice — never publish raw output.',
    '☐ Cross-check AI summaries of documents against the original material before citing them.'];

    const content = [
    `${title} ${subtitle}`,
    '',
    ...points.map((p, i) => `${i + 1}. ${p.title}${p.body}`),
    '',
    '---',
    'Workflow Action Items:',
    ...todos].
    join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'next-word-prediction-takeaways.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5" />
        <div className="max-w-4xl mx-auto my-[170px]">
          <h1 className="text-h2 font-heading text-foreground mb-2">
            {t('nextWord.takeaways.title')}
          </h1>
          <h2 className="text-h2 font-heading text-foreground mb-12">
            {t('nextWord.takeaways.subtitle')}
          </h2>

          <div className="space-y-8">
            {[1, 2, 3].map((n) =>
            <div key={n} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {n}
                </div>
                <p className="text-body-1 text-foreground pt-2">
                  <span className="font-bold">{t(`nextWord.takeaways.point${n}Title`)}</span>
                  {t(`nextWord.takeaways.point${n}`)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-16 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/module/next-word-prediction")}
              className="h-12 w-12 rounded-full">
              <ArrowLeft className="!h-6 !w-6" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/module/prompt-construction")}
              className="font-heading font-semibold text-base px-10 py-6 rounded-full">

              {t('nextWord.takeaways.nextTask')}
              <ArrowRight className="-mr-2 !h-6 !w-6" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full text-base font-heading font-semibold px-6 py-6">
                  <Download className="h-4 w-4 mr-2" />
                  {t('promptConstructionModule.takeaways.download')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-heading">{t('promptConstructionModule.takeaways.download')}</DialogTitle>
                </DialogHeader>
                <div className="border border-border rounded-lg bg-muted/30 p-5 font-mono text-sm text-muted-foreground space-y-2 whitespace-pre-line max-h-[50vh] overflow-y-auto">
                  <p className="font-bold text-foreground">{t('nextWord.takeaways.title')} {t('nextWord.takeaways.subtitle')}</p>
                  <p>1. {t('nextWord.takeaways.point1Title')}{t('nextWord.takeaways.point1')}</p>
                  <p>2. {t('nextWord.takeaways.point2Title')}{t('nextWord.takeaways.point2')}</p>
                  <p>3. {t('nextWord.takeaways.point3Title')}{t('nextWord.takeaways.point3')}</p>
                  <hr className="border-border my-2" />
                  <p className="font-bold text-foreground">Workflow Action Items:</p>
                  <p>☐ Before publishing AI-assisted text, verify all facts, quotes, and figures against primary sources.</p>
                  <p>☐ Always disclose to editors when AI tools were used in drafting or research.</p>
                  <p>☐ Rephrase and rewrite AI-generated drafts in your own voice — never publish raw output.</p>
                  <p>☐ Cross-check AI summaries of documents against the original material before citing them.</p>
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" onClick={handleDownload} className="rounded-full">
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
        previousRoute="/module/next-word-prediction/response"
        nextRoute="/module/prompt-construction" />

    </div>);

}