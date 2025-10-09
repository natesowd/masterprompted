import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import TextFlag from "@/components/TextFlag";

export default function JournalisticEvaluation() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-8">Journalistic Evaluation</h1>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-foreground mb-6">
                  When evaluating AI-generated content for journalistic use, it's critical to assess multiple dimensions 
                  of quality and appropriateness. Here are examples of how different evaluation factors apply:
                </p>

                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Example Analysis</h2>
                
                <p className="text-foreground mb-4">
                  Consider this AI-generated statement about climate policy: "The government's new <TextFlag 
                    text="carbon tax obligations"
                    evaluationFactor="voice"
                    explanation="The word 'obligations' carries a more negative, burdensome tone than neutral alternatives like 'requirements' or 'provisions', potentially biasing the reader's perception."
                  /> represent a radical shift in environmental regulation."
                </p>

                <p className="text-foreground mb-4">
                  This output demonstrates several evaluation concerns. The <TextFlag 
                    text="characterization as 'radical'"
                    evaluationFactor="bias"
                    explanation="Describing policy as 'radical' introduces editorial bias rather than neutral reporting, potentially reflecting political leanings in the training data."
                  /> introduces subjective framing that may not align with journalistic objectivity.
                </p>

                <p className="text-foreground mb-4">
                  Additionally, when an AI generates phrases like <TextFlag 
                    text="studies have consistently shown"
                    evaluationFactor="plagiarism"
                    explanation="This phrasing closely mirrors common academic and journalistic constructions found in training data, raising concerns about originality and proper attribution."
                    href="https://example.com/source"
                  /> without specific citations, it raises plagiarism concerns even when the statement seems general.
                </p>

                <div className="bg-muted p-6 rounded-lg mt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Best Practices</h3>
                  <ul className="list-disc pl-6 space-y-2 text-foreground">
                    <li>Always verify factual claims with primary sources</li>
                    <li>Be aware of loaded language and tone that may introduce bias</li>
                    <li>Check for plagiarism even in seemingly original content</li>
                    <li>Ensure the output's relevance matches your specific needs</li>
                    <li>Maintain your journalistic voice rather than adopting AI-generated style</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Evaluation Panel */}
            <aside className="flex-shrink-0">
              <div className="sticky top-24">
                <EvaluationPanel />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}