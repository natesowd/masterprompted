import { Button } from "@/components/ui/button";
interface GuidanceTooltipProps {
  text: string;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}
export default function GuidanceTooltip({
  text,
  isVisible,
  onClose,
  className = ""
}: GuidanceTooltipProps) {
  if (!isVisible) return null;
  return <div className={`absolute z-10 ${className}`}>
      
    </div>;
}