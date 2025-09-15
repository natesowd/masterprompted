import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, ArrowUp, X } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NextWordPrediction() {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const arrowButtonRef = useRef<HTMLButtonElement>(null);

  const calculatePopupPosition = () => {
    if (arrowButtonRef.current) {
      const rect = arrowButtonRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.bottom + 20, // 20px below the button
        left: rect.left + rect.width / 2 - 112 // Center popup on button (224px popup width / 2 = 112px)
      });
    }
  };

  useEffect(() => {
    if (showPopup) {
      calculatePopupPosition();
      window.addEventListener('resize', calculatePopupPosition);
      return () => window.removeEventListener('resize', calculatePopupPosition);
    }
  }, [showPopup]);

  const handlePageClick = (e: React.MouseEvent) => {
    // Don't count clicks on the arrow button
    if ((e.target as HTMLElement).closest('.arrow-button')) {
      return;
    }
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount > 1) {
      setShowPopup(true);
    }
  };

  const handleArrowClick = () => {
    // Navigate to the headline response page
    navigate("/module/headline-response");
  };

  const closePopup = () => {
    setShowPopup(false);
    // Just close the popup and stay on the current page
  };

  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the page click handler
  };

  return (
    <div className="min-h-screen bg-background" onClick={handlePageClick}>
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto relative min-h-[600px]">
          {/* Prompt Box */}
          <Card 
            className="bg-white border border-gray-200 rounded-2xl shadow-lg"
            style={{
              position: 'absolute',
              top: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '768px'
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                {/* Left content */}
                <div className="flex-1">
                  <p className="text-gray-800 text-lg leading-relaxed mb-4">
                    Write a headline for a long form journalistic article about ai ethics agreement reached across the eu
                  </p>
                  
                  {/* Attached file */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm">EU_AI_Act.pdf</span>
                  </div>
                </div>
                
                {/* Arrow button */}
                <Button
                  ref={arrowButtonRef}
                  onClick={handleArrowClick}
                  className="arrow-button bg-gray-800 hover:bg-gray-700 text-white rounded-full p-3 ml-4"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closePopup}>
          <div 
            className="bg-teal-700 text-white rounded-2xl p-6 max-w-sm relative"
            onClick={handlePopupClick}
            style={{
              position: 'fixed',
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`
            }}
          >
            {/* Pointer pointing to arrow button */}
            <div 
              className="absolute"
              style={{
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '10px solid #0F766E'
              }}
            ></div>
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Please send the prompt</h3>
              <Button
                onClick={closePopup}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-teal-600 p-1 -mt-1 -mr-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-white/90 text-sm leading-relaxed mb-6">
              Could you share the specifics or background for the message you want to convey? This will help me assist you better.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex-1"></div>
              <span className="pagination-indicator text-white/70 text-sm font-medium mr-[10px]">1 / 7</span>
              
              <div className="flex gap-3 flex-1 justify-end">
                <Button
                  onClick={closePopup}
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 px-4 py-2"
                >
                  Previous
                </Button>
                <Button
                  onClick={closePopup}
                  className="bg-white text-teal-700 hover:bg-gray-100 px-6 py-2"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}