import { useEffect, useState } from "react";

interface LoadingDotsProps {
  text?: string;
  className?: string;
}

const LoadingDots = ({ text = "Generating response", className = "" }: LoadingDotsProps) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      <span className="text-gray-600 font-medium">
        {text}{dots}
      </span>
    </div>
  );
};

export default LoadingDots;