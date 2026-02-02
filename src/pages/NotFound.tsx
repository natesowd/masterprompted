import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * NotFound - 404 error page displayed when user navigates to a non-existent route
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-h1 font-heading text-foreground">404</h1>
        <p className="mb-4 text-body-1 text-muted-foreground">Oops! Page not found</p>
        <Button 
          asChild
          variant="outline"
          className="text-primary hover:text-primary/80"
        >
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
