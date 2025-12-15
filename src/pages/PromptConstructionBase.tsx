import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import starImage from "@/assets/star.png";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PromptConstruction() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleContinue = () => {
    navigate("/module/prompt-construction/specificity");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[600px]">
          <Card
            className="transition-all duration-200 w-auto max-w-full"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '40px 50px 40px',
              gap: '40px',
              isolation: 'isolate',
              background: '#FFFFFF',
              border: '1px solid #C5C5C5',
              boxShadow: '0px 6px 15px rgba(62, 62, 62, 0.15)',
              borderRadius: '20px'
            }}
          >
            {/* Left column - Star image */}
            <div className="flex-shrink-0">
              <img 
                src={starImage} 
                alt="Star illustration" 
                className="w-[325px] h-auto"
              />
            </div>

            {/* Right column - Content */}
            <CardContent className="p-0 w-full flex flex-col">
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 text-sm">{t('promptConstructionModule.intro.label')}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/modules")}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Main heading */}
              <h1 className="text-3xl font-bold text-gray-900 leading-tight" style={{ marginBottom: '10px' }}>
                {t('promptConstructionModule.intro.title')}
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed mb-8 flex-grow">
                {t('promptConstructionModule.intro.description')}
              </p>

              {/* Continue button */}
              <Button 
                onClick={handleContinue}
                className="transition-all duration-200 self-start"
                style={{ 
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '15px 40px',
                  gap: '12px',
                  width: '184px',
                  height: '58px',
                  background: '#64DB96',
                  borderRadius: '100px',
                  border: 'none',
                  color: '#1F1F1F',
                  fontFamily: 'Manrope',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  fontSize: '18px',
                  lineHeight: '28px'
                }}
              >
                {t('promptConstructionModule.intro.continue')}
                <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5H11M11 5L7 1M11 5L7 9" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </CardContent>
          </Card>
        </div>
        
      </main>
    </div>
  );
}