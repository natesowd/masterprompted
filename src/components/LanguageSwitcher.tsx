import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';


export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="h-8 px-4 text-sm rounded-full bg-background/80 border border-border shadow-sm hover:bg-foreground/10 transition-all"
    >
      {language === 'en' ? 'English' : 'Español'}
    </Button>
  );
};
