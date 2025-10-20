import { ReactNode } from "react";

interface NavigationBarProps {
  children: ReactNode;
}

const NavigationBar = ({ children }: NavigationBarProps) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 hidden">
      <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default NavigationBar;
