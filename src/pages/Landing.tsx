import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { ArrowRight, GitBranch, RotateCcw, Mouse } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const handleStartSimulator = () => {
    navigate("/module/introduction");
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Full Screen Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url("/lovable-uploads/3b3ae4fa-c5d8-40bd-bbce-dade9e3871f1.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header transparent />
        
        {/* Hero Section */}
        <main className="flex-1 relative overflow-hidden">
          <div className="relative px-6 py-16 text-center text-white min-h-[80vh] flex flex-col justify-center">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                PromptED: Responsible AI use in Journalism
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                A hands-on exploration and practice for journalists to observe how large language models function, their limitations, and how to use them for more trustworthy content production.
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <Card 
                className="bg-black/80 backdrop-blur-sm border border-white/20 hover:bg-black/90 hover:shadow-2xl hover:shadow-white/10 hover:scale-105 transition-all duration-500 cursor-pointer group"
                onClick={handleStartSimulator}
              >
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-semibold text-white">Guided Simulator</h3>
                  <p className="text-white/80 text-sm">
                    Interactive guide: explore LLMs and use them responsibly
                  </p>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <ArrowRight className="h-5 w-5 text-black transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/80 backdrop-blur-sm border border-white/20 hover:bg-black/90 hover:shadow-2xl hover:shadow-white/10 hover:scale-105 transition-all duration-500 cursor-pointer group">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-semibold text-white">Prompt Playground</h3>
                  <p className="text-white/80 text-sm">
                    Apply your knowledge: experiment with prompting yourself
                  </p>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <ArrowRight className="h-5 w-5 text-black transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/80 backdrop-blur-sm border border-white/20 hover:bg-black/90 hover:shadow-2xl hover:shadow-white/10 hover:scale-105 transition-all duration-500 cursor-pointer group">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-semibold text-white">Claim Debunker</h3>
                  <p className="text-white/80 text-sm">
                    Put your skills to work: craft prompts, check claims
                  </p>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <ArrowRight className="h-5 w-5 text-black transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8 mt-16 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-center text-sm text-white">
            <span className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/2392e8d9-dc60-4606-a42e-f8bdd4c76835.png" 
                alt="European Union Flag" 
                className="w-8 h-6"
              />
              Funded by the European Union's Horizon Europe Programme (Grant 101135437)
            </span>
          </div>
        </footer>
      </div>

    </div>
  );
};

export default Landing;