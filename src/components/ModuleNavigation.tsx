import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModuleNavigationProps {
  previousRoute?: string;
  nextRoute?: string;
  previousLabel?: string;
  nextLabel?: string;
}

const ModuleNavigation = ({ 
  previousRoute, 
  nextRoute, 
  previousLabel = "Previous",
  nextLabel = "Next"
}: ModuleNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-lg">
        {previousRoute ? (
          <Button
            variant="ghost"
            onClick={() => navigate(previousRoute)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-4 py-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">{previousLabel}</span>
          </Button>
        ) : (
          <div className="w-20"></div>
        )}
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        {nextRoute ? (
          <Button
            variant="ghost"
            onClick={() => navigate(nextRoute)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-4 py-2"
          >
            <span className="text-sm font-medium">{nextLabel}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>
    </div>
  );
};

export default ModuleNavigation;