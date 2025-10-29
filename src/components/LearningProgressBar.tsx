import ProgressIndicator from "./ProgressIndicator";
import { useLanguage } from "@/contexts/LanguageContext";

interface LearningProgressBarProps {
  module: string;
  currentStep: 'intro' | 'main' | 'takeaway';
  baseRoute: string;
}

// Module configurations
const moduleConfigs: Record<string, { 
  introRoute: string;
  mainRoute: string;
  takeawayRoute: string;
}> = {
  'prompt-construction': {
    introRoute: '/module/prompt-construction',
    mainRoute: '/module/prompt-construction/specificity/response',
    takeawayRoute: '/module/prompt-construction/specificity/takeaways'
  },
  'next-word-prediction': {
    introRoute: '/module/next-word-prediction',
    mainRoute: '/module/next-word-prediction/response',
    takeawayRoute: '/module/next-word-prediction/takeaways'
  },
  // Add more modules here as needed
};

export default function LearningProgressBar({ 
  module, 
  currentStep,
  baseRoute 
}: LearningProgressBarProps) {
  const { t } = useLanguage();
  // Use module config if available, otherwise use baseRoute
  const config = moduleConfigs[module];
  
  const steps = [
    { 
      id: 'intro', 
      label: t('components.learningProgressBar.intro'), 
      path: config?.introRoute || `${baseRoute}` 
    },
    { 
      id: 'main', 
      label: t('components.learningProgressBar.guidedExploration'), 
      path: config?.mainRoute || `${baseRoute}/main` 
    },
    { 
      id: 'takeaway', 
      label: t('components.learningProgressBar.takeaways'), 
      path: config?.takeawayRoute || `${baseRoute}/takeaways` 
    }
  ];

  return <ProgressIndicator currentStep={currentStep} steps={steps} />;
}
