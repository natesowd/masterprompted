import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';


export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full p-0.5 bg-background/80 border border-border shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('en')}
        className={`h-6 px-3 text-xs rounded-full transition-all ${
          language === 'en'
            ? 'bg-foreground text-background hover:bg-foreground/90'
            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/10'
        }`}
      >
        EN
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('es')}
        className={`h-6 px-3 text-xs rounded-full transition-all ${
          language === 'es'
            ? 'bg-foreground text-background hover:bg-foreground/90'
            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/10'
        }`}
      >
        ES
      </Button>
    </div>
  );
};
