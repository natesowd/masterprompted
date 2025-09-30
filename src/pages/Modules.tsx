import Header from "@/components/Header";

export default function Modules() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="content-container">
        <div className="content-wrapper">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Modules</h1>
            <p className="text-xl text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}