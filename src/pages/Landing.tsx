import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import VideoLightbox from "@/components/VideoLightbox";
import { ArrowRight, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleStartSimulator = () => {
    navigate("/module/intro/about-simulator");
  };

  const handleStartPlayground = () => {
    navigate("/playground");
  };

  const handleStartDebunker = () => {
    // Use a full page navigation for an external URL instead of react-router's navigate
    window.location.assign("https://dh-hetzner.fbk.eu/aicode-v2/");
  };

  const handleWatchTrailer = () => {
    setIsVideoOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Hero Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("/hero.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header transparent />

        {/* Hero Section */}
        <main className="flex-1 relative overflow-hidden">
          <div className="relative px-6 py-16 text-center text-white min-h-[60vh] max-h-[70vh] flex flex-col justify-center">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-barlow-semi font-bold leading-tight">
                  {t('landing.hero.title')}
                </h1>

                <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                  {t('landing.hero.subtitle')}
                </p>

                {/* Watch Trailer Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleWatchTrailer}
                    className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-3 h-20"
                  >
                    <img src="/play_circle.png" alt="Play" className="w-6 h-6" />
                    {t('landing.hero.watchTrailer')}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Features Section with Gradient Background */}
        <section className="relative py-20" style={{
          background: "linear-gradient(135deg, #4FB3A0 0%, #2E8B7C 50%, #1A5C54 100%)"
        }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card
                className="bg-black/90 backdrop-blur-sm border border-white/10 hover:bg-black/80 hover:scale-105 transition-all duration-500 cursor-pointer group"
                onClick={handleStartSimulator}
              >
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-semibold text-white">{t('landing.features.simulator.title')}</h3>
                  <p className="text-white/80 text-sm">
                    {t('landing.features.simulator.description')}
                  </p>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <ArrowRight className="h-5 w-5 text-black transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-black/90 backdrop-blur-sm border border-white/10 hover:bg-black/80 hover:scale-105 transition-all duration-500 cursor-pointer group"
                onClick={handleStartPlayground}
              >
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-semibold text-white">{t('landing.features.playground.title')}</h3>
                  <p className="text-white/80 text-sm">
                    {t('landing.features.playground.description')}
                  </p>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <ArrowRight className="h-5 w-5 text-black transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/90 backdrop-blur-sm border border-white/10 hover:bg-black/80 hover:scale-105 transition-all duration-500 cursor-pointer group"
              onClick={handleStartDebunker}>
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-semibold text-white">{t('landing.features.debunker.title')}</h3>
                  <p className="text-white/80 text-sm">
                    {t('landing.features.debunker.description')}
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

          {/* EU Funding Notice */}
          <div className="flex justify-center mt-16">
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <img
                src="/lovable-uploads/2392e8d9-dc60-4606-a42e-f8bdd4c76835.png"
                alt="European Union Flag"
                className="w-8 h-6"
              />
              {t('landing.footer.euFunding')}
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="bg-card py-16">
          <div className="max-w-6xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-h5 font-heading text-foreground">
                {t('landing.footer.llmUsage')}
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>{t('landing.footer.guidedExploration')}</strong> {t('landing.footer.guidedExplorationDesc')}</p>
                <p><strong>{t('landing.footer.promptPlayground')}</strong> {t('landing.footer.promptPlaygroundDesc')}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-muted-foreground">
                <strong>{t('landing.footer.modelsUsed')}</strong> {t('landing.footer.models')}
              </p>
            </div>
          </div>
        </footer>
      </div>

      <VideoLightbox
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl="https://youtu.be/6TcjHnuHLGg"
      />
    </div>
  );
};

export default Landing;