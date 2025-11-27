/**
 * ProgressIndicator Component
 * 
 * Visual progress tracker for multi-step flows with clickable navigation.
 * Shows current step, completed steps, and future steps with hover labels.
 * 
 * @example
 * ```tsx
 * <ProgressIndicator
 *   currentStep="main"
 *   steps={[
 *     { id: 'intro', label: 'Introduction', path: '/intro' },
 *     { id: 'main', label: 'Main Content', path: '/main' },
 *     { id: 'takeaway', label: 'Takeaways', path: '/takeaway' }
 *   ]}
 * />
 * ```
 */

import { useNavigate } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stepDotVariants = cva(
  "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-150",
  {
    variants: {
      state: {
        current: "bg-primary scale-110",
        completed: "bg-primary/60",
        upcoming: "bg-gray-300"
      }
    }
  }
);

const stepLabelVariants = cva(
  "mt-2 text-xs transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer",
  {
    variants: {
      state: {
        current: "text-primary font-medium",
        completed: "text-gray-500",
        upcoming: "text-gray-500"
      }
    }
  }
);

interface ProgressIndicatorProps {
  /** Current active step ID */
  currentStep: string;
  /** Array of step configurations */
  steps: {
    id: string;
    label: string;
    path: string;
  }[];
}

export default function ProgressIndicator({ currentStep, steps }: ProgressIndicatorProps) {
  const navigate = useNavigate();
  const stepIndex = steps.findIndex(step => step.id === currentStep);
  
  const getStepState = (index: number): "current" | "completed" | "upcoming" => {
    if (index === stepIndex) return "current";
    if (index < stepIndex) return "completed";
    return "upcoming";
  };
  
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const state = getStepState(index);
        return (
          <div key={step.id} className="flex flex-col items-center group">
            <button
              onClick={() => navigate(step.path)}
              className={cn(stepDotVariants({ state }))}
              aria-label={step.label}
            />
            <button
              onClick={() => navigate(step.path)}
              className={cn(stepLabelVariants({ state }))}
            >
              {step.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
