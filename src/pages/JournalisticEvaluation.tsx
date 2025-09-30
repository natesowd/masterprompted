import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";

export default function JournalisticEvaluation() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Journalistic Evaluation</h1>
            <p className="text-xl text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}