import { Button } from "@/components/ui/button";

interface GuidanceTooltipProps {
  text: string;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

export default function GuidanceTooltip({ text, isVisible, onClose, className = "" }: GuidanceTooltipProps) {
  if (!isVisible) return null;

  return (
    <div className={`absolute z-10 ${className}`}>
      <div 
        className="bg-emerald-600 text-white rounded-xl shadow-lg max-w-xs"
        style={{
          padding: '16px 20px',
        }}
      >
        <div className="flex justify-between items-start gap-3">
          <p className="text-sm leading-relaxed font-medium">
            {text}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-7 px-3 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-md font-medium"
          >
            Close
          </Button>
        </div>
        {/* Arrow pointing down */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-emerald-600"></div>
        </div>
      </div>
    </div>
  );
}