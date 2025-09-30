import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";

export default function MultipleSources() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Multiple Sources</h1>
            <p className="text-xl text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}