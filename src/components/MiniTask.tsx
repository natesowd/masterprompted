import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlignJustify } from 'lucide-react';
interface MiniTaskProps {
  title: string;
  description: string;
  onStartTask: () => void;
  className?: string;
}
export function MiniTask({
  title,
  description,
  onStartTask,
  className = ""
}: MiniTaskProps) {
  const [spotlightRects, setSpotlightRects] = useState<{
    unite: DOMRect | null;
    on: DOMRect | null;
  }>({
    unite: null,
    on: null
  });
  useEffect(() => {
    // Find the "Unites" and "On" elements and get their positions
    const queryTargets = () => {
      const uniteEl = document.querySelector('[data-word="unites"], [data-word="unite"]') as HTMLElement | null;
      const onEl = document.querySelector('[data-word="on"]') as HTMLElement | null;
      console.log('MiniTask spotlight targets:', {
        uniteEl,
        onEl
      });
      if (uniteEl) {
        const rect = uniteEl.getBoundingClientRect();
        console.log('Unites rect:', rect);
        setSpotlightRects(prev => ({
          ...prev,
          unite: rect
        }));
      } else {
        setSpotlightRects(prev => ({
          ...prev,
          unite: null
        }));
      }
      if (onEl) {
        const rect = onEl.getBoundingClientRect();
        console.log('On rect:', rect);
        setSpotlightRects(prev => ({
          ...prev,
          on: rect
        }));
      } else {
        setSpotlightRects(prev => ({
          ...prev,
          on: null
        }));
      }
    };
    const handleRecalc = () => {
      queryTargets();
    };
    window.addEventListener('resize', handleRecalc);
    window.addEventListener('scroll', handleRecalc, true);
    // Initial calc
    queryTargets();
    return () => {
      window.removeEventListener('resize', handleRecalc);
      window.removeEventListener('scroll', handleRecalc, true);
    };
  }, []);
  return <>
      
      {/* Combined spotlight covering both words */}
      {(spotlightRects.unite || spotlightRects.on) && (() => {
      const u = spotlightRects.unite;
      const o = spotlightRects.on;
      const left = Math.min(u?.left ?? Infinity, o?.left ?? Infinity) - 3;
      const top = Math.min(u?.top ?? Infinity, o?.top ?? Infinity) - 3;
      const right = Math.max(u ? u.left + u.width : -Infinity, o ? o.left + o.width : -Infinity) + 3;
      const bottom = Math.max(u ? u.top + u.height : -Infinity, o ? o.top + o.height : -Infinity) + 3;
      const width = Math.max(0, right - left);
      const height = Math.max(0, bottom - top);
      return <div className="fixed z-50 pointer-events-none" style={{
        left,
        top,
        width,
        height,
        background: 'transparent',
        borderRadius: '8px',
        boxShadow: `0 0 0 9999px rgba(0,0,0,0.5)`
      }} />;
    })()}


      {/* MiniTask component */}
      <div className={`bg-card border border-border rounded-lg p-6 shadow-lg ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <AlignJustify className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            <Button onClick={onStartTask} variant="default" size="sm">
              Start Task
            </Button>
          </div>
        </div>
      </div>
    </>;
}