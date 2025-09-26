import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Chatbox from "@/components/ChatBox";
import Breadcrumb from "@/components/Breadcrumb";

export default function NextWordPrediction() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate("/module/headline-response");
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto relative min-h-[600px]">
          <Chatbox 
            canType={false} 
            text="Write a headline for a long form journalistic article about ai ethics agreement reached across the eu" 
            fileName="EU_AI_Act.pdf"
            submitButtonId="chatbox-submit-button" // Pass the ID here
            onSubmit={handleSubmit}
          />
        </div>
      </main>
      
      {/* Fixed breadcrumb at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-10">
        <div className="container mx-auto">
          <Breadcrumb />
        </div>
      </div>
    </div>
  );
}