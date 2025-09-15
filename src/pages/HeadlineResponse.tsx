import { Paperclip } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import EvaluationPanel from "@/components/EvaluationPanel";

export default function HeadlineResponse() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column - Main content */}
            <div className="lg:col-span-8">
              {/* Original Prompt */}
              <Card className="bg-gray-200 border-none rounded-2xl mb-8">
                <CardContent className="p-6">
                  <p className="text-gray-800 text-lg leading-relaxed mb-4">
                    Write a headline for a long form journalistic article about ai ethics agreement reached across the eu
                  </p>
                  
                  {/* Attached file */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm">EU_AI_Act.pdf</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Response */}
              <div className="space-y-6">
                <p className="text-gray-700 text-lg">
                  Here is a possible headline for a long-form journalistic article about an AI ethics agreement reached across the EU:
                </p>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  European Union Unites on Historic AI Ethics Framework, Charting Path for Responsible Technology Development
                </h1>
              </div>
            </div>

            {/* Right column - Evaluation panel */}
            <div className="lg:col-span-4">
              <EvaluationPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}