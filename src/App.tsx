import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { EvaluationProvider } from "./contexts/EvaluationContext";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import FlagIntroHighlight from "./components/FlagIntroHighlight";
import ErrorBoundary from "./components/ErrorBoundary";

// Landing and NotFound stay eager so first paint and 404s don't pay the
// chunk-fetch cost. Every other page is split into its own chunk.
const Modules = lazy(() => import("./pages/Modules"));
const Introduction = lazy(() => import("./pages/IntroBase"));
const AboutSimulator = lazy(() => import("./pages/IntroAboutSimulator"));
const JournalisticEvaluation = lazy(() => import("./pages/JournalisticEvaluation"));
const NextWordPredictionPrompt = lazy(() => import("./pages/NextWordPredictionPrompt"));
const NextWordPredictionIntro = lazy(() => import("./pages/NextWordPredictionBase"));
const HeadlineResponse = lazy(() => import("./pages/NextWordPredictionResponse"));
const PromptConstruction = lazy(() => import("./pages/PromptConstructionBase"));
const Specificity = lazy(() => import("./pages/PromptConstructionSpecificity"));
const SpecificityResponse = lazy(() => import("./pages/PromptConstructionSpecificityResponse"));
const PromptConstructionSpecificityTakeaways = lazy(() => import("./pages/PromptConstructionSpecificityTakeaways"));
const PromptConstructionSummarize = lazy(() => import("./pages/PromptConstructionSummarize"));
const ConversationStyle = lazy(() => import("./pages/PromptConstructionConversationStyle"));
const Context = lazy(() => import("./pages/PromptConstructionContext"));
const Bias = lazy(() => import("./pages/PrompConstructionBias"));
const SystemParameters = lazy(() => import("./pages/SystemParameters"));
const SystemParametersTemperature = lazy(() => import("./pages/SystemParametersTemperature"));
const SystemParametersRoles = lazy(() => import("./pages/SystemParametersRoles"));
const SystemParametersTakeaways = lazy(() => import("./pages/SystemParametersTakeaways"));
const MultipleSources = lazy(() => import("./pages/MultipleSources"));
const MultipleSourcesExercise = lazy(() => import("./pages/MultipleSourcesExercise"));
const MultipleSourcesTakeaways = lazy(() => import("./pages/MultipleSourcesTakeaways"));
const LLMTraining = lazy(() => import("./pages/LLMTraining"));
const LLMTrainingExercise = lazy(() => import("./pages/LLMTrainingExercise"));
const LLMTrainingFewShot = lazy(() => import("./pages/LLMTrainingFewShot"));
const LLMTrainingTakeaways = lazy(() => import("./pages/LLMTrainingTakeaways"));
const PromptPlayground = lazy(() => import("./pages/PromptPlayground"));
const PromptPlaygroundV2 = lazy(() => import("./pages/PromptPlaygroundV2"));
const Contact = lazy(() => import("./pages/Contact"));
const Takeaways = lazy(() => import("./pages/NextWordPredictionTakeaways"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-background" aria-hidden="true" />
);

const App = () =>
<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <EvaluationProvider>
          <Sonner />
          <BrowserRouter>
            {/* <DesignSystemFab /> */}
            <FlagIntroHighlight />
            <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* NAV BAR */}
              <Route path="/" element={<Landing />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/playground" element={<PromptPlayground />} />
              <Route path="/playground-v2" element={<PromptPlaygroundV2 />} />
              {/* Hidden pages - uncomment to restore: */}
              {/* <Route path="/about" element={<About />} /> */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/design-system" element={<DesignSystem />} />
              {/* <Route path="/imprint" element={<Imprint />} */}

              {/* INTRO MODULE */}
              <Route path="/module/intro" element={<Introduction />} />
              <Route path="/module/intro/about-simulator" element={<AboutSimulator />} />

              {/* NEXT WORD PREDICTION MODULE */}
              <Route path="/module/next-word-prediction" element={<NextWordPredictionIntro />} />
              <Route path="/module/next-word-prediction/prompt" element={<NextWordPredictionPrompt />} />
              <Route path="/module/next-word-prediction/response" element={<HeadlineResponse />} />
              <Route path="/module/next-word-prediction/takeaways" element={<Takeaways />} />

              {/* PROMPT CONSTRUCTION MODULE */}
              <Route path="/module/prompt-construction" element={<PromptConstruction />} />
              <Route path="/module/prompt-construction/summarize" element={<PromptConstructionSummarize />} />
              <Route path="/module/prompt-construction/specificity" element={<Specificity />} />
              <Route path="/module/prompt-construction/specificity/response" element={<SpecificityResponse />} />
              <Route path="/module/prompt-construction/specificity/takeaways" element={<PromptConstructionSpecificityTakeaways />} />
              <Route path="/module/prompt-construction/conversation-style" element={<ConversationStyle />} />
              <Route path="/module/prompt-construction/context" element={<Context />} />
              <Route path="/module/prompt-construction/bias" element={<Bias />} />

              <Route path="/module/system-parameters" element={<SystemParameters />} />
              <Route path="/module/system-parameters/temperature" element={<SystemParametersTemperature />} />
              <Route path="/module/system-parameters/roles" element={<SystemParametersRoles />} />
              <Route path="/module/system-parameters/takeaways" element={<SystemParametersTakeaways />} />
              <Route path="/module/multiple-sources" element={<MultipleSources />} />
              <Route path="/module/multiple-sources/exercise" element={<MultipleSourcesExercise />} />
              <Route path="/module/multiple-sources/takeaways" element={<MultipleSourcesTakeaways />} />
              <Route path="/module/llm-training" element={<LLMTraining />} />
              <Route path="/module/llm-training/supervised" element={<LLMTrainingExercise />} />
              <Route path="/module/llm-training/few-shot" element={<LLMTrainingFewShot />} />
              <Route path="/module/llm-training/takeaways" element={<LLMTrainingTakeaways />} />
              <Route path="/module/journalistic-evaluation" element={<JournalisticEvaluation />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </EvaluationProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>;


export default App;
