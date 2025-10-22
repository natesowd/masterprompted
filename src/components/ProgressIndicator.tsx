import { useNavigate } from "react-router-dom";

interface ProgressIndicatorProps {
  currentStep: 'intro' | 'main' | 'takeaway';
  steps: {
    id: string;
    label: string;
    path: string;
  }[];
}

export default function ProgressIndicator({ currentStep, steps }: ProgressIndicatorProps) {
  const navigate = useNavigate();
  const stepIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-col items-center group relative">
          <button
            onClick={() => navigate(step.path)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-150 ${
              index === stepIndex
                ? 'bg-primary scale-110'
                : index < stepIndex
                ? 'bg-primary/60'
                : 'bg-gray-300'
            }`}
            aria-label={step.label}
          />
          <span
            className={`absolute top-full mt-1 text-xs transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap ${
              index === stepIndex
                ? 'text-primary font-medium'
                : 'text-gray-500'
            }`}
            style={{ 
              transform: 'rotate(-90deg) translateX(-50%)',
              transformOrigin: 'left top',
              left: '50%',
              marginTop: '12px'
            }}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
