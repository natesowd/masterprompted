/**
 * DialogPopup Component
 * 
 * A customizable modal dialog with primary and secondary actions.
 * Supports controlled open state and action callbacks.
 * 
 * @example
 * ```tsx
 * <DialogPopup
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 *   primaryAction={{ label: "Confirm", onClick: handleConfirm }}
 *   secondaryAction={{ label: "Cancel", onClick: handleCancel }}
 * />
 * ```
 */

import React from 'react';
import { Dialog, DialogClose, DialogFooter, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const dialogContentVariants = cva(
  "max-w-lg",
  {
    variants: {
      size: {
        default: "max-w-lg",
        sm: "max-w-md",
        lg: "max-w-2xl",
        xl: "max-w-4xl"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
);

interface DialogPopupProps extends VariantProps<typeof dialogContentVariants> {
  /** Whether the dialog is open */
  isOpen?: boolean;
  /** Callback when dialog is closed */
  onClose?: () => void;
  /** Dialog title */
  title?: string;
  /** Dialog description/body text */
  description?: string;
  /** Primary action button configuration */
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action button configuration */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const DialogPopup: React.FC<DialogPopupProps> = ({
  isOpen = true,
  onClose,
  title,
  description,
  primaryAction,
  secondaryAction,
  size
}) => {

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(dialogContentVariants({ size }))}>
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

export default DialogPopup;
