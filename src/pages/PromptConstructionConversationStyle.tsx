import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ConversationStyle() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-h2 font-heading text-foreground mb-4">{t('promptConstruction.conversationStyle.title')}</h1>
            <p className="text-xl text-muted-foreground">{t('promptConstruction.conversationStyle.comingSoon')}</p>
          </div>
        </div>
      </main>
      
      <ModuleNavigation 
        previousRoute="/module/prompt-construction/context" 
        nextRoute="/module/prompt-construction/bias"
      />
    </div>
  );
}