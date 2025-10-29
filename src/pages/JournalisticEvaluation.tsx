import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";

export default function JournalisticEvaluation() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('journalisticEvaluation.title')}</h1>
            <p className="text-xl text-muted-foreground">{t('journalisticEvaluation.comingSoon')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}