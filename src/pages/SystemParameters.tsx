import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SystemParameters() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('systemParameters.title')}</h1>
            <p className="text-xl text-muted-foreground">{t('systemParameters.comingSoon')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}