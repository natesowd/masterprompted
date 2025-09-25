import { Paperclip } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import EvaluationPanel from "@/components/EvaluationPanel";
import Chatbox from "@/components/ChatBox";
import ControlledPopup from "@/components/DialogPopup";
import PromptControls from "@/components/PromptControls";

const PromptPlayground = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Left Sidebar - Prompt Controls */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-4">
              <PromptControls />
            </div>
          </div>

          {/* Main Content - Chatbox */}
          <div className="flex-1 min-w-0">
            <Chatbox canType={true} />
            {/* AI Response */}
            <div className="space-y-6">
              <p className="text-gray-700 text-lg">
                Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:
              </p>

              <h1 className="text-2xl text-gray-900 leading-tight font-normal md:text-4xl">
                European Union Unites on Historic AI Ethics Framework, Charting Path for Responsible Technology Development
              </h1>
            </div>
          </div>

          {/* Right Sidebar - Evaluation Panel */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-4">
              <EvaluationPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromptPlayground;