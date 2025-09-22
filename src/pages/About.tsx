import Header from "@/components/Header";
import { useState } from "react";
import ControlledPopup from "@/components/ControlledPopup";
import UncontrolledPopup from "@/components/UncontrolledPopup";

const About = () => {

  const [isPopupOpen, setIsPopupOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            About
          </h1>

          <div className="bg-card rounded-lg border p-8">
            <p className="text-muted-foreground text-lg">
              This is the About page. Information about the project will be added here soon.
            </p>
          </div>
        </div>
        {/* <ControlledPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)} // This is the crucial part
        /> */}
        <UncontrolledPopup isOpen={false}/>
      </main>
    </div>
  );
};

export default About;