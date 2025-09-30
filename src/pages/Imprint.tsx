import Header from "@/components/Header";

const Imprint = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Imprint
          </h1>
          
          <div className="bg-card rounded-lg border p-8">
            <p className="text-muted-foreground text-lg">
              This is the Imprint page. Legal information and impressum will be added here soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Imprint;