import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface UncontrolledPopupProps {
  isOpen?: boolean;
  title?: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const UncontrolledPopup: React.FC<UncontrolledPopupProps> = ({
  isOpen = true,
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <Dialog defaultOpen={isOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto"
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                className="w-full sm:w-auto"
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UncontrolledPopup;
