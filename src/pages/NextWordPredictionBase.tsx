import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NextWordPredictionIntro = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/module/next-word-prediction/prompt");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <Breadcrumb />
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[600px] relative">
          <Card 
            className="transition-all duration-200"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '40px 50px 50px',
              gap: '30px',
              isolation: 'isolate',
              position: 'absolute',
              width: '845px',
              minHeight: 'auto',
              left: 'calc(50% - 845px/2 + 0.5px)',
              top: '100px',
              background: '#FFFFFF',
              border: '1px solid #C5C5C5',
              boxShadow: '0px 6px 15px rgba(62, 62, 62, 0.15)',
              borderRadius: '20px'
            }}
          >
            {/* Image inside the popup - aligned to top and smaller */}
            <img 
              src="/stair.png" 
              alt="Stair blocks" 
              className="w-[325px] h-auto flex-shrink-0"
              style={{ marginTop: '10px' }}
            />
            
            <CardContent className="p-0 w-full flex flex-col">
              {/* Learning label */}
              <div className="flex items-center justify-between w-full mb-6">
                <span className="text-gray-500 text-sm">Learning 1: Next word prediction</span>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Main heading */}
              <h1 className="text-[40px] font-barlow-semi font-bold text-gray-900 leading-tight" style={{ marginBottom: '10px' }}>
                How do LLMs form responses to user prompts?
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                LLMs generate text by predicting what word should come next. For each prediction, previous words are analysed to calculate probabilities for all possible next words. The most probable word is selected, added to the text, and then used in this updated context to predict the next word, continuing until complete.
              </p>

              {/* Continue button */}
              <Button 
                onClick={handleContinue}
                className="transition-all duration-200"
                style={{ 
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '15px 30px',
                  gap: '12px',
                  width: '140px',
                  height: '50px',
                  background: '#64DB96',
                  borderRadius: '100px',
                  border: 'none',
                  color: '#1F1F1F',
                  fontFamily: 'Manrope',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                Continue
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
};

export default NextWordPredictionIntro;