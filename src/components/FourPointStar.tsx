import { cn } from "@/lib/utils";

interface FourPointStarProps {
  className?: string;
}

export function FourPointStar({ className }: FourPointStarProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
    >
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
    </svg>
  );
}
