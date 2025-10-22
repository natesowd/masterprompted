import ProgressIndicator from "./ProgressIndicator";

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
  // Add more modules here as needed
  // 'next-word-prediction': {
  //   introRoute: '/module/next-word-prediction',
  //   mainRoute: '/module/next-word-prediction/main',
  //   takeawayRoute: '/module/next-word-prediction/takeaways'
  // },
};

export default function LearningProgressBar({ 
  module, 
  currentStep,
  baseRoute 
}: LearningProgressBarProps) {
  // Use module config if available, otherwise use baseRoute
  const config = moduleConfigs[module];
  
  const steps = [
    { 
      id: 'intro', 
      label: 'Introduction', 
      path: config?.introRoute || `${baseRoute}` 
    },
    { 
      id: 'main', 
      label: 'Guided Exploration', 
      path: config?.mainRoute || `${baseRoute}/main` 
    },
    { 
      id: 'takeaway', 
      label: 'Takeaways', 
      path: config?.takeawayRoute || `${baseRoute}/takeaways` 
    }
  ];

  return <ProgressIndicator currentStep={currentStep} steps={steps} />;
}
