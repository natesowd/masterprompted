import { useState, useEffect, forwardRef } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type Step = {
  id: string;
  trigger: string;
  content: React.ReactNode;
};

interface PopoverSeriesProps {
  steps: Step[]
  initialStep?: number
  onClose?: () => void
}

// The FakeTrigger component is a proxy element for positioning the Popover.
const FakeTrigger = forwardRef<HTMLDivElement, { rect: DOMRect | null }>(({ rect }, ref) => {
  if (!rect) return null;

  return (
    <div
      // MODIFICATION 1: Changed position from `absolute` to `fixed`.
      // This ensures the trigger's position is calculated relative to the viewport,
      // just like getBoundingClientRect(), fixing the popover offset issue.
      className="fixed z-50 pointer-events-none"
      style={{
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      }}
      ref={ref}
    />
  );
});

export function PopoverSeries({ steps, initialStep = 0, onClose }: PopoverSeriesProps) {
  const [currentStep, setCurrentStep] = useState<number | null>(initialStep)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [borderRadius, setBorderRadius] = useState<string>('0px')

  const close = () => {
    setCurrentStep(null)
    onClose?.()
  }

  const goToStep = async (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    } else {
      close();
    }
  }

  useEffect(() => {
    if (currentStep !== null) {
      const selector = steps[currentStep]?.trigger;
      if (selector) {
        const el = document.querySelector<HTMLElement>(selector);
        if (el) {
          setRect(el.getBoundingClientRect());
          const computedStyle = window.getComputedStyle(el);
          setBorderRadius(computedStyle.borderRadius || '0px');
        } else {
          console.warn(`PopoverSeries could not find element with selector: ${selector}`);
          setRect(null);
          setBorderRadius('0px');
        }
      }
    } else {
      setRect(null);
      setBorderRadius('0px');
    }
  }, [currentStep, steps]);

  const isOpen = currentStep !== null;
  const currentStepData = isOpen ? steps[currentStep] : null;

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!currentStepData || !isOpen || !rect) {
    return null;
  }

  return (
    <>
      {/* Spotlight/Mask Effect */}
      {isOpen && rect && (
        <div
          // MODIFICATION 2: Added `pointer-events-none`.
          // This allows clicks and interactions to pass through the spotlight
          // "hole" to the element underneath, making it interactable.
          className="fixed z-41 pointer-events-none"
          style={{
            left: rect.left - 2,
            top: rect.top - 2,
            width: rect.width + 4,
            height: rect.height + 4,
            borderRadius: borderRadius,
            // The box-shadow creates the overlay effect around the transparent hole.
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
          }}
        />
        // MODIFICATION 3: Removed the separate full-screen overlay div.
        // It was redundant and blocked all interactions. The box-shadow above
        // is sufficient to create the visual overlay.
      )}

      {/* Popover Component */}
      <Popover
        key={currentStepData.id}
        open={isOpen}
        onOpenChange={(open) => !open && close()}
      >
        <PopoverTrigger asChild>
          <FakeTrigger rect={rect} />
        </PopoverTrigger>

        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="space-y-4"
          side="bottom"
          align="center"
        >
          <div className="flex justify-between align-top">
            <div className="mt-2">{currentStepData.content}</div>
            <Button
              className="absolute top-1 right-1 rounded-full p-2"
              onClick={close}
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {steps.length > 1 ? (
            <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
              <div className="ml-4">
                {currentStep + 1} / {steps.length}
              </div>
              <div className="flex justify-between gap-4">
                <Button
                  onClick={() => goToStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  variant="secondary"
                >
                  Previous
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button onClick={close}>Done</Button>
                ) : (
                  <Button
                    onClick={() => goToStep(currentStep + 1)}
                    disabled={currentStep === steps.length - 1}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={close}>Got it</Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}