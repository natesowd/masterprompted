import React from 'react';
import { Button } from '@/components/ui/button';
import { AlignJustify } from 'lucide-react';

interface MiniTaskProps {
  title: string;
  description: string;
  onStartTask: () => void;
  className?: string;
}

export function MiniTask({ title, description, onStartTask, className = "" }: MiniTaskProps) {
  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Red circular icon */}
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <AlignJustify className="h-6 w-6 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {description}
          </p>
          
          {/* Start Task Button */}
          <Button 
            onClick={onStartTask}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Start Task
          </Button>
        </div>
      </div>
    </div>
  );
}