import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";

export default function SystemParameters() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">System Parameters</h1>
            <p className="text-xl text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}