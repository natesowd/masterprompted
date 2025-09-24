import Header from "@/components/Header";
import { useState, useRef, useEffect } from "react";
import ControlledPopup from "@/components/ControlledDialog";
import UncontrolledPopup from "@/components/UncontrolledDialog";
import { PopoverSeries } from "@/components/PopoverSeries";

const About = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [steps, setSteps] = useState<any[]>([]);

  useEffect(() => {
    if (buttonRef.current) {
      setSteps([
        {
          id: "step-1",
          trigger: buttonRef.current,
          content: <p>Welcome to Step 1lka sndlka sndkasnd kalsjnds kalj
            ndkasnsdkjasndlkasjndlksajndkaj!</p>,
        },
      ]);
    }
  }, []);

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
            <button ref={buttonRef} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded">
              Step 1
            </button>
          </div>
        </div>
        {/* <ControlledPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)} // This is the crucial part
        /> */}
        {/* <UncontrolledPopup isOpen={false}/> */}
        
          <PopoverSeries steps={steps} />
      </main>
    </div>
  );
};

export default About;