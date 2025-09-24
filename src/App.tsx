import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Modules from "./pages/Modules";
import Introduction from "./pages/Introduction";
import AboutSimulator from "./pages/AboutSimulator";
import JournalisticEvaluation from "./pages/JournalisticEvaluation";
import NextWordPrediction from "./pages/NextWordPrediction";
import HeadlineResponse from "./pages/HeadlineResponse";
import PromptConstruction from "./pages/PromptConstruction";
import Specificity from "./pages/Specificity";
import ConversationStyle from "./pages/ConversationStyle";
import Context from "./pages/Context";
import Bias from "./pages/Bias";
import SystemParameters from "./pages/SystemParameters";
import MultipleSources from "./pages/MultipleSources";
import LLMTraining from "./pages/LLMTraining";
import PromptPlayground from "./pages/PromptPlayground";
import About from "./pages/About";
import Help from "./pages/Help";
import Imprint from "./pages/Imprint";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/playground" element={<PromptPlayground />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/module/introduction" element={<Introduction />} />
          <Route path="/module/about-simulator" element={<AboutSimulator />} />
          <Route path="/module/journalistic-evaluation" element={<JournalisticEvaluation />} />
          <Route path="/module/next-word-prediction" element={<NextWordPrediction />} />
          <Route path="/module/headline-response" element={<HeadlineResponse />} />
          <Route path="/module/prompt-construction" element={<PromptConstruction />} />
          <Route path="/module/prompt-construction/specificity" element={<Specificity />} />
          <Route path="/module/prompt-construction/conversation-style" element={<ConversationStyle />} />
          <Route path="/module/prompt-construction/context" element={<Context />} />
          <Route path="/module/prompt-construction/bias" element={<Bias />} />
          <Route path="/module/system-parameters" element={<SystemParameters />} />
          <Route path="/module/multiple-sources" element={<MultipleSources />} />
          <Route path="/module/llm-training" element={<LLMTraining />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
