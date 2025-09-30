import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import ModuleNavigation from "@/components/ModuleNavigation";

export default function Context() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="content-container">
        <Breadcrumb />
        <div className="mb-5"></div>
        <div className="content-wrapper">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Context</h1>
            <p className="text-xl text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      </main>
      
      <ModuleNavigation 
        previousRoute="/module/prompt-construction/specificity/response" 
        nextRoute="/module/prompt-construction/conversation-style"
      />
    </div>
  );
}