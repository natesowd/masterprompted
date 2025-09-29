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
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [borderRadius, setBorderRadius] = useState<string>('0px')
  const [isScrolling, setIsScrolling] = useState(false)

  const scrollToTop = () => {
    return new Promise<void>((resolve) => {
      // If already at top, resolve immediately
      if (window.scrollY === 0) {
        resolve();
        return;
      }

      setIsScrolling(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const checkScroll = () => {
        if (window.scrollY === 0) {
          window.removeEventListener('scroll', checkScroll);
          setIsScrolling(false);
          resolve();
        }
      };

      window.addEventListener('scroll', checkScroll);
    });
  };

  const close = () => {
    setCurrentStep(null)
    onClose?.()
  }

  const goToStep = async (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      if (stepIndex === 0) {
        await scrollToTop();
      }
      setCurrentStep(stepIndex);
    } else {
      close();
    }
  }

  // Initialize with scroll to top
  useEffect(() => {
    if (initialStep === 0) {
      scrollToTop().then(() => {
        setCurrentStep(initialStep);
      });
    }
  }, []);

  // This effect now finds the element using the selector string
  // Effect for handling element measurements
  useEffect(() => {
    if (currentStep !== null) {
      const selector = steps[currentStep]?.trigger;
      if (selector) {
        // Find the element in the DOM
        const el = document.querySelector<HTMLElement>(selector);
        if (el) {
          setRect(el.getBoundingClientRect());
          // Get the computed border-radius of the element
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
  }, [currentStep, steps]); // Dependencies are correct

  const isOpen = currentStep !== null;
  const currentStepData = isOpen ? steps[currentStep] : null;

  // Effect for handling body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Save the current body overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

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
        <>
          {/* Semi-transparent overlay that blocks clicks */}
          <div 
            className="fixed inset-0 bg-black/0 z-40"
            onClick={(e) => e.stopPropagation()} 
          />
          <div
            className="fixed z-41"
            style={{
              left: rect.left - 2,
              top: rect.top - 2,
              width: rect.width + 4,
              height: rect.height + 4,
              background: 'transparent',
              borderRadius: borderRadius,
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
            }}
          />
        </>
      )}

      {/* 2. Render the actual Popover for the current step */}
      <Popover
        key={currentStepData.id}
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            close();
          }
        }}
      >
        <PopoverTrigger asChild>
          {/* 3. Use the forwardRef-wrapped FakeTrigger */}
          <FakeTrigger rect={rect} />
        </PopoverTrigger>

        {/* ... (rest of PopoverContent remains the same, using currentStepData) ... */}
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