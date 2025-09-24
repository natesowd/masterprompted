import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import Chatbox from "@/components/ChatBox";
import { PopoverSeries } from "@/components/PopoverSeries";
export default function HeadlineResponse() {
  // Define popover steps for the journalistic evaluation tour
  const popoverSteps = [
    {
      id: "evaluation-panel",
      trigger: "[data-evaluation-panel]",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Journalistic Evaluation</h3>
          <p className="text-sm leading-relaxed">
            This panel helps you evaluate AI-generated content across key journalistic criteria. 
            Each section examines different aspects of quality and reliability that journalists should consider.
          </p>
        </div>
      ),
    },
    {
      id: "factual-accuracy",
      trigger: "[data-criterion-id='factual-accuracy']",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Factual Accuracy</h3>
          <p className="text-sm leading-relaxed">
            Click here to learn about factual accuracy - one of the most critical aspects when evaluating AI outputs. 
            This covers how to identify hallucinations and ensure information reliability.
          </p>
        </div>
      ),
    },
  ];

  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Breadcrumb />
        <div className="max-w-7xl mx-auto">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column - Main content */}
            <div className="lg:col-span-8">
              {/* Original Prompt */}
              <div className="mb-8">
                <Chatbox 
                  canType={false} 
                  text="Write a headline for a long form journalistic article about ai ethics agreement reached across the eu" 
                  fileName="EU_AI_Act.pdf"
                />
              </div>

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

            {/* Right column - Evaluation panel */}
            <div className="lg:col-span-4" data-evaluation-panel>
              <EvaluationPanel />
            </div>
          </div>
        </div>
      </main>
      
      {/* PopoverSeries for evaluation tour */}
      {/* <PopoverSeries steps={popoverSteps} /> */}
    </div>;
}