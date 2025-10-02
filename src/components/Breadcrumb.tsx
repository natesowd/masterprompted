import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const breadcrumbMap: Record<string, string> = {
  "/modules": "Modules",
  "/module": "Guided Simulation",
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
  "/module/next-word-prediction": "Next Word Prediction",
  "/next-word-prediction": "Next Word Prediction",
  "/takeaways": "Takeaways"
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Build breadcrumb items
  const breadcrumbItems = [];
  let currentPath = '';
  
  // Add home
  breadcrumbItems.push({
    label: "Home",
    path: "/",
    isLast: false
  });
  
  // Special case for takeaways page
  if (location.pathname === '/takeaways') {
    breadcrumbItems.push({
      label: "Guided Simulation",
      path: "/module/intro",
      isLast: false
    });
    breadcrumbItems.push({
      label: "Next Word Prediction",
      path: "/module/next-word-prediction-intro",
      isLast: false
    });
    breadcrumbItems.push({
      label: "Takeaways",
      path: "/takeaways",
      isLast: true
    });
  } else {
    // Add path segments, but stop at prompt-construction level
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += '/' + pathSegments[i];
      
      // If we're in prompt-construction sub-routes, stop at prompt-construction
      if (currentPath === '/module/prompt-construction') {
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

  return (
    <nav className="flex items-center text-sm text-gray-600 mb-5">
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
          
          {item.isLast ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link 
              to={item.label === "Guided Simulation" ? "/module/intro" : item.path}
              className="hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}