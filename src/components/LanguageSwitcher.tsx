import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

type Language = 'en' | 'es';

interface LanguageSwitcherProps {
  /** Optional callback invoked whenever the language changes (including on mount to sync). */
  onLanguageChange?: (lang: Language) => void;
}

export const LanguageSwitcher = ({ onLanguageChange }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  // Internal setter that updates the context and notifies parent
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    onLanguageChange?.(lang);
  };

  // Ensure parent is synced on mount and whenever `language` changes from elsewhere
  useEffect(() => {
    onLanguageChange?.(language);
  }, [language, onLanguageChange]);

  return (
    <div className="flex items-center gap-0.5 rounded-full p-0.5 bg-background/80 border border-border shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSetLanguage('en')}
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
        onClick={() => handleSetLanguage('es')}
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
