import { Palette } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

interface DesignSystemFabProps {
  className?: string;
}

/**
 * Floating action button that links to the Design System page.
 * When already on /design-system, navigates back to the previous page.
 */
const DesignSystemFab = ({ className }: DesignSystemFabProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);

  const isOnDesignSystem = location.pathname === "/design-system";

  useEffect(() => {
    if (!isOnDesignSystem) {
      previousPathRef.current = location.pathname + location.search + location.hash;
    }
  }, [location, isOnDesignSystem]);

  const handleClick = () => {
    if (isOnDesignSystem) {
      navigate(previousPathRef.current || "/");
    } else {
      navigate("/design-system");
    }
  };

  return (
    <button
      onClick={handleClick}
      title={isOnDesignSystem ? "Back" : "Design System"}
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow-md",
        className
      )}
    >
      <Palette className="h-5 w-5" />
    </button>
  );
};

export default DesignSystemFab;
