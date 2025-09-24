import { useState, useEffect, useRef, forwardRef } from "react" // Import forwardRef
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type Step = {
  id: string;
  trigger: string; // Changed type from HTMLElement | null to a string selector
  content: React.ReactNode;
};

interface PopoverSeriesProps {
  steps: Step[]
  initialStep?: number
  onClose?: () => void
}

// 1. FIX: Wrap FakeTrigger with forwardRef
// It must accept a ref to satisfy PopoverTrigger asChild, even if we don't use the ref internally.
// We are explicitly setting the type to accept a ref to an HTMLDivElement.
const FakeTrigger = forwardRef<HTMLDivElement, { rect: DOMRect | null }>(({ rect }, ref) => {
  if (!rect) return null; // Defensive check

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      }}
      ref={ref} // Pass the ref from PopoverTrigger to the div
    />
  );
});

export function PopoverSeries({ steps, initialStep = 0, onClose }: PopoverSeriesProps) {
  const [currentStep, setCurrentStep] = useState<number | null>(initialStep)
  const [rect, setRect] = useState<DOMRect | null>(null)

  // The triggerRefs array is now entirely unnecessary and removed for simplicity.

  const close = () => {
    setCurrentStep(null)
    onClose?.()
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
    } else {
      close()
    }
  }

  // This effect now finds the element using the selector string
  useEffect(() => {
    if (currentStep !== null) {
      const selector = steps[currentStep]?.trigger;
      if (selector) {
        // Find the element in the DOM
        const el = document.querySelector<HTMLElement>(selector);
        if (el) {
          setRect(el.getBoundingClientRect());
        } else {
          console.warn(`PopoverSeries could not find element with selector: ${selector}`);
          setRect(null);
        }
      }
    } else {
      setRect(null);
    }
  }, [currentStep, steps]); // Dependencies are correct

  const currentStepData = currentStep !== null ? steps[currentStep] : null;
  const isOpen = currentStep !== null

  if (!currentStepData || !isOpen) {
    return null;
  }

  // Return null if the rect hasn't been calculated yet for the current step
  if (!rect) {
    return null;
  }

  return (
    <>
      {/* 1. Render the mask/hole */}
      {isOpen && rect && (
        <div
          className="fixed inset-0 bg-black/50 z-40 pointer-events-none"
          style={{
            // punch a transparent hole using mask
            WebkitMask: `radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2
              }px, transparent ${Math.max(rect.width, rect.height) / 2 + 4}px, black ${Math.max(rect.width, rect.height) / 2 + 12}px)`,
            WebkitMaskComposite: "destination-out",
            maskComposite: "exclude",
          }}
        />
      )}

      {/* 2. Render the actual Popover for the current step */}
      <Popover
        key={currentStepData.id}
        open={isOpen}
        onOpenChange={() => { }}
      >
        <PopoverTrigger asChild>
          {/* 3. Use the forwardRef-wrapped FakeTrigger */}
          <FakeTrigger rect={rect} />
        </PopoverTrigger>

        {/* ... (rest of PopoverContent remains the same, using currentStepData) ... */}
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 relative space-y-4"
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
                {currentStep === steps.length - 1 ?
                  (
                    <Button
                      onClick={() => close()}
                    >
                      Done
                    </Button>
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
          ) :
            <div className="flex justify-end">
              <Button
                onClick={() => close()}
              >
                Got it
              </Button>
            </div>
          }
        </PopoverContent>
      </Popover>
    </>
  )
}