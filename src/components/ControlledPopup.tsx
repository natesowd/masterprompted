import React from 'react';
import { Dialog, DialogClose, DialogFooter, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


// To Implement:
//
// const [isPopupOpen, setIsPopupOpen] = useState(false);
//
// <ControlledPopup
//   isOpen={isPopupOpen}
//   onClose={() => setIsPopupOpen(false)} // This is the crucial part
// />
//

interface ControlledPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
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

const ControlledPopup: React.FC<ControlledPopupProps> = ({
  isOpen = true,
  onClose,
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
  );
};

export default ControlledPopup;