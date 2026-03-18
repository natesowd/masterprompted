import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Modules() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6 mt-[43px] my-[250px]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('modules.title')}</h1>
            <p className="text-xl text-muted-foreground">{t('modules.comingSoon')}</p>
          </div>
        </div>
      </main>
    </div>);

}