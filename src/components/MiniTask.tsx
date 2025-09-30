import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlignJustify } from 'lucide-react';

interface MiniTaskProps {
  title: string;
  description: string;
  onStartTask: () => void;
  className?: string;
}

export function MiniTask({ title, description, onStartTask, className = "" }: MiniTaskProps) {
  const [spotlightRects, setSpotlightRects] = useState<{ unite: DOMRect | null; on: DOMRect | null }>({
    unite: null,
    on: null
  });

  useEffect(() => {
    // Find the "unite" and "on" elements and get their positions
    const uniteElement = document.querySelector('[data-word="unite"]') as HTMLElement;
    const onElement = document.querySelector('[data-word="on"]') as HTMLElement;

    if (uniteElement) {
      setSpotlightRects(prev => ({ ...prev, unite: uniteElement.getBoundingClientRect() }));
    }
    if (onElement) {
      setSpotlightRects(prev => ({ ...prev, on: onElement.getBoundingClientRect() }));
    }

    // Update positions on window resize
    const handleResize = () => {
      if (uniteElement) {
        setSpotlightRects(prev => ({ ...prev, unite: uniteElement.getBoundingClientRect() }));
      }
      if (onElement) {
        setSpotlightRects(prev => ({ ...prev, on: onElement.getBoundingClientRect() }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Grey overlay with spotlights */}
      <div className="fixed inset-0 bg-black/0 z-40" onClick={(e) => e.stopPropagation()} />
      
      {/* Spotlight for "unite" word */}
      {spotlightRects.unite && (
        <div
          className="fixed z-41"
          style={{
            left: spotlightRects.unite.left - 2,
            top: spotlightRects.unite.top - 2,
            width: spotlightRects.unite.width + 4,
            height: spotlightRects.unite.height + 4,
            background: 'transparent',
            borderRadius: '4px',
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
          }}
        />
      )}

      {/* Spotlight for "on" word */}
      {spotlightRects.on && (
        <div
          className="fixed z-41"
          style={{
            left: spotlightRects.on.left - 2,
            top: spotlightRects.on.top - 2,
            width: spotlightRects.on.width + 4,
            height: spotlightRects.on.height + 4,
            background: 'transparent',
            borderRadius: '4px',
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
          }}
        />
      )}

      {/* MiniTask component */}
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
    </>
  );
}