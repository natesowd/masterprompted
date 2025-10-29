import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavigationBar from "./NavigationBar";
import { useLanguage } from "@/contexts/LanguageContext";

interface ModuleNavigationProps {
  previousRoute?: string;
  nextRoute?: string;
  previousLabel?: string;
  nextLabel?: string;
}

const ModuleNavigation = ({ 
  previousRoute, 
  nextRoute, 
  previousLabel,
  nextLabel
}: ModuleNavigationProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const defaultPreviousLabel = previousLabel || t('components.moduleNavigation.previous');
  const defaultNextLabel = nextLabel || t('components.moduleNavigation.next');

  return (
    <NavigationBar>
      {previousRoute ? (
        <Button
          variant="ghost"
          onClick={() => navigate(previousRoute)}
          className="hover:bg-muted rounded-full p-2"
          size="icon"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      ) : (
        <div className="w-8 h-8"></div>
      )}
      
      <div className="w-px h-6 bg-border"></div>
      
      {nextRoute ? (
        <Button
          variant="ghost"
          onClick={() => navigate(nextRoute)}
          className="hover:bg-muted rounded-full p-2"
          size="icon"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <div className="w-8 h-8"></div>
      )}
    </NavigationBar>
  );
};

export default ModuleNavigation;