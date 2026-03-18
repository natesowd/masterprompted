import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { EvaluationProvider } from "./contexts/EvaluationContext";
import Landing from "./pages/Landing";
import Modules from "./pages/Modules";
import Introduction from "./pages/IntroBase";
import AboutSimulator from "./pages/IntroAboutSimulator";
import JournalisticEvaluation from "./pages/JournalisticEvaluation";
import NextWordPredictionPrompt from "./pages/NextWordPredictionPrompt";
import NextWordPredictionIntro from "./pages/NextWordPredictionBase";
import HeadlineResponse from "./pages/NextWordPredictionResponse";
import PromptConstruction from "./pages/PromptConstructionBase";
import Specificity from "./pages/PromptConstructionSpecificity";
import SpecificityResponse from "./pages/PromptConstructionSpecificityResponse";
import PromptConstructionSpecificityTakeaways from "./pages/PromptConstructionSpecificityTakeaways";
import PromptConstructionSummarize from "./pages/PromptConstructionSummarize";

import ConversationStyle from "./pages/PromptConstructionConversationStyle";
import Context from "./pages/PromptConstructionContext";
import Bias from "./pages/PrompConstructionBias";
import SystemParameters from "./pages/SystemParameters";
import SystemParametersTemperature from "./pages/SystemParametersTemperature";
import SystemParametersRoles from "./pages/SystemParametersRoles";
import SystemParametersTakeaways from "./pages/SystemParametersTakeaways";
import MultipleSources from "./pages/MultipleSources";
import LLMTraining from "./pages/LLMTraining";
import PromptPlayground from "./pages/PromptPlayground";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Imprint from "./pages/Imprint";
import Takeaways from "./pages/NextWordPredictionTakeaways";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";
import DesignSystemFab from "./components/DesignSystemFab";
const queryClient = new QueryClient();

const App = () =>
<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <EvaluationProvider>
          <Sonner />
          <BrowserRouter>
            <DesignSystemFab />
            <Routes>
              {/* NAV BAR */}
              <Route path="/" element={<Landing />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/playground" element={<PromptPlayground />} />
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
              <Route path="/module/llm-training" element={<LLMTraining />} />
              <Route path="/module/journalistic-evaluation" element={<JournalisticEvaluation />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </EvaluationProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>;


export default App;