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
        <Breadcrumb />
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
    </div>
  );
}