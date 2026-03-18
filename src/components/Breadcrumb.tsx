import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";



export default function Breadcrumb() {
  // TODO: Re-enable breadcrumbs when ready
  const SHOW_BREADCRUMBS = false;
  const location = useLocation();
  const { t } = useLanguage();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbMap: Record<string, string> = {
    "/modules": "Modules",
    "/module": t('components.breadcrumb.guidedSimulation'),
    "/module/intro": "Introduction",
    "/module/intro/about-simulator": "About Simulator",
    "/module/journalistic-evaluation": "Journalistic Evaluation",
    "/module/next-word-prediction-intro": "Next Word Prediction",
    "/module/headline-response": "Next Word Prediction",
    "/module/prompt-construction": "Prompt Construction",
    "/module/prompt-construction/specificity": "Prompt Construction",
    "/module/prompt-construction/specificity/response": "Prompt Construction",
    "/module/prompt-construction/conversation-style": "Conversation Style",
    "/module/prompt-construction/context": "Context",
    "/module/prompt-construction/bias": "Bias",
    "/module/system-parameters": "System Parameters",
    "/module/multiple-sources": "Multiple Sources",
    "/module/llm-training": "LLM Training",
    "/module/llm-training/supervised": "Supervised Learning",
    "/module/next-word-prediction": "Next Word Prediction",
    "/next-word-prediction": "Next Word Prediction",
    "/takeaways": t('components.breadcrumb.takeaways')
  };

  // Build breadcrumb items
  const breadcrumbItems = [];
  let currentPath = '';

  // Add home
  breadcrumbItems.push({
    label: t('components.breadcrumb.home'),
    path: "/",
    isLast: false
  });

  // Special case for takeaways page
  if (location.pathname === '/takeaways') {
    breadcrumbItems.push({
      label: t('components.breadcrumb.guidedSimulation'),
      path: "/module/intro",
      isLast: false
    });
    breadcrumbItems.push({
      label: "Next Word Prediction",
      path: "/module/next-word-prediction-intro",
      isLast: false
    });
    breadcrumbItems.push({
      label: t('components.breadcrumb.takeaways'),
      path: "/takeaways",
      isLast: true
    });
  } else {
    // Add path segments, but stop at prompt-construction level and skip "prompt" segment
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += '/' + pathSegments[i];

      // Skip the "prompt" and "response" segments
      if (pathSegments[i] === 'prompt' || pathSegments[i] === 'response') {
        continue;
      }

      // If we're in prompt-construction sub-routes, stop at prompt-construction
      if (currentPath === '/module/prompt-construction') {
        breadcrumbItems.push({
          label: breadcrumbMap[currentPath] || pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1),
          path: currentPath,
          isLast: true
        });
        break;
      }

      // If we're in prompt-construction sub-routes, stop at prompt-construction
      if (currentPath === '/module/intro') {
        breadcrumbItems.push({
          label: breadcrumbMap[currentPath] || pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1),
          path: currentPath,
          isLast: true
        });
        break;
      }


      const isLast = i === pathSegments.length - 1;
      const label = breadcrumbMap[currentPath] || pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1);

      breadcrumbItems.push({
        label,
        path: currentPath,
        isLast
      });
    }
  }

  if (!SHOW_BREADCRUMBS) return null;

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-5">
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />}

          {item.isLast ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link
              to={item.label === t('components.breadcrumb.guidedSimulation') ? "/module/intro" : item.path}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}