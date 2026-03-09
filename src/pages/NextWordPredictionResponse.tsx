import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ChatPrompt from "@/components/ChatPrompt";
import ModuleNavigation from "@/components/ModuleNavigation";
import { BranchDiagram } from "@/components/BranchDiagram";
import { TreeDiagram } from "@/components/TreeDiagram";
import FeatureHighlight from "@/components/FeatureHighlight";
import React, { useState, useEffect, useMemo } from "react";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, GitBranch, ListChecks } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { predictionTree, getDefaultPath, getOptionsForPath } from "@/data/predictionTreeData";
import { FLAGGED_WORDS_MAP } from "@/data/flaggedWords";

export default function HeadlineResponse() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const defaultPath = useMemo(() => getDefaultPath(), []);

  const [currentSentence, setCurrentSentence] = useState<string[]>([predictionTree.word]);
  const [viewMode, setViewMode] = useState<"tree" | "branch">("tree");
  const [evaluationPanelOpen, setEvaluationPanelOpen] = useState(false);
  const [hasEvaluationBeenOpened, setHasEvaluationBeenOpened] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [highlightStep, setHighlightStep] = useState<0 | 1 | 2 | 3>(1);

  // Reset everything when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentSentence([predictionTree.word]);
    setViewMode("tree");
    setEvaluationPanelOpen(false);
    setHasEvaluationBeenOpened(false);
    setHasInteracted(false);

    const skipHighlights = sessionStorage.getItem('nwp-skip-highlights');
    if (skipHighlights) {
      setHighlightStep(0);
      sessionStorage.removeItem('nwp-skip-highlights');
    } else {
      setHighlightStep(1);
    }
  }, []);

  // When switching view modes, reset evaluation gating
  useEffect(() => {
    setEvaluationPanelOpen(false);
    setHasEvaluationBeenOpened(false);
    setHasInteracted(false);
  }, [viewMode]);

  const { registerFactor, deregisterFactor } = useEvaluation();

  // Watch for flagged words (selected OR visible as options) to expand evaluation panel
  useEffect(() => {
    if (!hasInteracted) return;
    
    const normalizedSentence = currentSentence.map(w => w?.toLowerCase().replace(/[,.]$/g, '') ?? '');
    
    // Also check visible options at current frontier
    const visibleOptions = getOptionsForPath(currentSentence);
    const visibleWords = visibleOptions.map(o => o.word.toLowerCase());
    
    const allVisibleWords = [...normalizedSentence, ...visibleWords];
    
    // Check which factors are active based on visible flagged words
    const activeFactors = new Set<string>();
    for (const w of allVisibleWords) {
      // Find matching key in FLAGGED_WORDS_MAP (case-insensitive)
      const key = Object.keys(FLAGGED_WORDS_MAP).find(k => k.toLowerCase() === w);
      if (key) {
        activeFactors.add(FLAGGED_WORDS_MAP[key].evaluationFactor);
      }
    }

    const hasFlaggedWord = activeFactors.size > 0;

    if (hasFlaggedWord && !hasEvaluationBeenOpened) {
      setEvaluationPanelOpen(true);
      setHasEvaluationBeenOpened(true);
    }

    for (const factor of activeFactors) {
      registerFactor(factor);
    }
    return () => {
      for (const factor of activeFactors) {
        deregisterFactor(factor);
      }
    };
  }, [currentSentence, hasInteracted]);

  const handlePathChange = (path: string[]) => {
    setCurrentSentence(path);
    if (path.length > 1) setHasInteracted(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col">
            {/* Breadcrumb */}
            <div className="pt-6 pb-3 px-6">
              <Breadcrumb />
            </div>

            {/* Two column layout: Middle + Evaluation */}
            <div className="flex flex-1 items-start px-6 relative">
              {/* Middle column - fixed width to match prompt controls pages */}
              <div className="w-[860px] flex-shrink-0">
                {/* Original Prompt */}
                <div className="mb-8">
                  <ChatPrompt text="Write a 7-word headline for a long form journalistic article about AI ethics agreement reached across the EU." fileName="EU_AI_Act.pdf" />
                </div>

                {/* AI Response */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <ToggleGroup
                      type="single"
                      value={viewMode}
                      onValueChange={(value) => value && setViewMode(value as typeof viewMode)}
                      className="shrink-0"
                    >
                      <ToggleGroupItem value="tree" aria-label="Branch View" className="gap-1.5 text-xs">
                        <GitBranch className="h-3.5 w-3.5" />
                        Branch
                      </ToggleGroupItem>
                      <ToggleGroupItem value="branch" aria-label="Tree View" className="gap-1.5 text-xs">
                        <GitBranch className="h-3.5 w-3.5 rotate-90" />
                        Tree
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {viewMode === "tree" ? (
                    <BranchDiagram
                      selectedPath={currentSentence}
                      onPathChange={handlePathChange}
                    />
                  ) : (
                    <TreeDiagram
                      selectedPath={currentSentence}
                      onPathChange={handlePathChange}
                    />
                  )}

                  {/* Takeaways Button - only show after user interaction */}
                  {hasInteracted && (
                    <div className="mt-8 flex items-center gap-3">
                      <Button variant="outline" size="icon" onClick={() => navigate("/module/next-word-prediction")} className="h-12 w-12 border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10">
                        <ArrowLeft className="!h-6 !w-6" />
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => navigate("/module/next-word-prediction/takeaways")} className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10">
                        {t('components.breadcrumb.takeaways')}
                        <ArrowRight className="-mr-2 !h-6 !w-6" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Evaluation trigger or panel */}
              <div className="flex-shrink-0 ml-6 2xl:absolute 2xl:left-[884px] 2xl:top-0 2xl:ml-0">
                {!evaluationPanelOpen ? (
                  <div className="pt-2">
                    <button
                      aria-label="Open evaluation panel"
                      className="p-2 rounded-full hover:bg-muted/50"
                      onClick={() => setEvaluationPanelOpen(true)}
                    >
                      <ListChecks className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div data-evaluation-panel>
                    <EvaluationPanel initialIsOpen={true} canClose={true} onClose={() => setEvaluationPanelOpen(false)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Highlight - Step 1: Headline preview */}
      <FeatureHighlight
        target='[data-feature="headline-preview"]'
        open={highlightStep === 1 && viewMode === "tree"}
        onClose={() => setHighlightStep(2)}
        side="bottom"
        sideOffset={32}
        closeLabel="Next"
      >
        This is a headline that an LLM might output. <strong>European Union</strong> is the fixed starting point, and the greyed-out words show one possible completion.
      </FeatureHighlight>

      {/* Feature Highlight - Step 2: Word selections */}
      <FeatureHighlight
        target='[data-feature="word-options"]'
        open={highlightStep === 2 && viewMode === "tree"}
        onClose={() => setHighlightStep(3)}
        side="right"
        sideOffset={32}
        closeLabel="Next"
      >
        Select from these words to see how an LLM might construct a headline. Each choice leads to a new set of options, just like a language model predicting the next token.
      </FeatureHighlight>

      {/* Feature Highlight - Step 3: Probability */}
      <FeatureHighlight
        target='[data-feature="probability"]'
        open={highlightStep === 3 && viewMode === "tree"}
        onClose={() => setHighlightStep(0)}
        side="top"
        sideOffset={32}
        closeLabel="Got it"
      >
        This number is the <strong>probability</strong> — it shows how likely the LLM thinks this word should come next, based on all the text it was trained on. A higher probability means the model considers it a more natural continuation. Use these numbers to pick what the computer would most likely choose!
      </FeatureHighlight>

      <ModuleNavigation previousRoute="/module/next-word-prediction/prompt" nextRoute={hasInteracted ? "/module/next-word-prediction/takeaways" : undefined} />
      <div className="fixed bottom-3 right-3 text-[13px] leading-snug text-muted-foreground/70 text-right">
        LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
      </div>
    </div>
  );
}
