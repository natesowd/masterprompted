import { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ChatPrompt from "@/components/ChatPrompt";
import FeatureHighlight from "@/components/FeatureHighlight";
import SectionFlag from "@/components/SectionFlag";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, ArrowRight, Plus, X, Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface OutputSection {
  heading: string;
  items: string[];
}

interface InputOutputPair {
  id: string;
  input: string;
  outputTitle: string;
  sections: OutputSection[];
  footer?: string;
}

const INPUT_OUTPUT_PAIRS: InputOutputPair[] = [
  {
    id: "pair-1",
    input: "Create an outline for an article about renewable energy policy in Europe",
    outputTitle: "European Renewable Energy Policy Article Outline",
    sections: [
      {
        heading: "Introduction",
        items: [
          "Current state of renewable energy in Europe",
          "Policy goals and climate commitments",
          "Importance for energy security and climate change",
        ],
      },
      {
        heading: "Key Policies",
        items: [
          "European Green Deal objectives",
          "REPowerEU plan and energy independence",
          "Renewable Energy Directive (RED III) targets",
        ],
      },
      {
        heading: "Implementation Challenges",
        items: [
          "Grid infrastructure and storage limitations",
          "Financing and investment requirements",
          "Cross-border energy cooperation",
        ],
      },
      {
        heading: "Economic Impact",
        items: [
          "Job creation in green energy sectors",
          "Energy price effects for consumers",
          "Industrial competitiveness concerns",
        ],
      },
      {
        heading: "Conclusion",
        items: [
          "Progress toward 2030 and 2050 targets",
          "Role of policy in accelerating transition",
          "Future outlook and remaining gaps",
        ],
      },
    ],
    footer: "Would you like me to expand on any particular section or adjust the focus of the outline?",
  },
  {
    id: "pair-2",
    input: "Design an outline for an article about the EU AI Act",
    outputTitle: "AI Act Article Outline",
    sections: [
      {
        heading: "Introduction",
        items: [
          "What is the EU AI Act and why it matters",
          "Timeline: from proposal to enforcement (2021-2025)",
          "First comprehensive AI regulation globally",
        ],
      },
      {
        heading: "Key Provisions",
        items: [
          "Risk-based approach: prohibited, high-risk, limited-risk, and minimal-risk AI systems",
          "Prohibited AI practices (social scoring, emotion recognition in workplaces/schools, etc.)",
          "Requirements for high-risk AI systems (documentation, transparency, human oversight)",
          "Foundation model regulations for powerful AI systems",
        ],
      },
      {
        heading: "Compliance Requirements",
        items: [
          "Conformity assessments and CE marking",
          "Risk management systems and quality management",
          "Data governance and record-keeping obligations",
          "Human oversight requirements",
        ],
      },
      {
        heading: "Enforcement and Penalties",
        items: [
          "National supervisory authorities",
          "Fines up to €35 million or 7% of global turnover",
          "Phased implementation timeline through 2027",
        ],
      },
      {
        heading: "Industry Impact",
        items: [
          "Effects on AI developers and deployers",
          "Compliance costs and market access",
          "Innovation vs. regulation balance",
          "Global influence on AI governance",
        ],
      },
      {
        heading: "Conclusion",
        items: [
          "Significance for the future of AI regulation",
          "Potential model for other jurisdictions",
          "Challenges and opportunities ahead",
        ],
      },
    ],
    footer: "Would you like me to expand on any particular section or adjust the focus of the outline?",
  },
];

/* The center column always shows pair-2's output */
const MAIN_OUTPUT = INPUT_OUTPUT_PAIRS[1];

/* ------------------------------------------------------------------ */
/*  Extended output items — extras available when users add bullets     */
/* ------------------------------------------------------------------ */

const OUTPUT_ITEM_POOL: Record<string, string[]> = {
  "Introduction": [
    "What is the EU AI Act and why it matters",
    "Timeline: from proposal to enforcement (2021-2025)",
    "First comprehensive AI regulation globally",
    "Comparison with existing technology regulations",
    "Stakeholder reactions and public discourse",
    "Context within the EU's broader digital strategy",
  ],
  "Key Provisions": [
    "Risk-based approach: prohibited, high-risk, limited-risk, and minimal-risk AI systems",
    "Prohibited AI practices (social scoring, emotion recognition in workplaces/schools, etc.)",
    "Requirements for high-risk AI systems (documentation, transparency, human oversight)",
    "Foundation model regulations for powerful AI systems",
    "Obligations for general-purpose AI providers",
    "Transparency requirements for AI-generated content",
  ],
  "Compliance Requirements": [
    "Conformity assessments and CE marking",
    "Risk management systems and quality management",
    "Data governance and record-keeping obligations",
    "Human oversight requirements",
    "Post-market monitoring and incident reporting",
    "Documentation and technical file requirements",
  ],
  "Enforcement and Penalties": [
    "National supervisory authorities",
    "Fines up to €35 million or 7% of global turnover",
    "Phased implementation timeline through 2027",
    "Role of the European AI Office",
    "Cross-border enforcement mechanisms",
    "Whistleblower protections for AI violations",
  ],
  "Industry Impact": [
    "Effects on AI developers and deployers",
    "Compliance costs and market access",
    "Innovation vs. regulation balance",
    "Global influence on AI governance",
    "Competitive implications for EU-based companies",
    "Impact on AI research and open-source development",
  ],
  "Conclusion": [
    "Significance for the future of AI regulation",
    "Potential model for other jurisdictions",
    "Challenges and opportunities ahead",
    "Long-term implications for AI innovation in Europe",
    "Role of public engagement in shaping AI policy",
    "Evolving nature of AI governance frameworks",
  ],
};

/* Map example section headings to output section headings */
const EXAMPLE_TO_OUTPUT_HEADING: Record<string, string> = {
  "Introduction": "Introduction",
  "Key Policies": "Key Provisions",
  "Implementation Challenges": "Compliance Requirements",
  "Economic Impact": "Industry Impact",
  "Conclusion": "Conclusion",
};

/* ------------------------------------------------------------------ */
/*  Style modifiers for interactive mode                               */
/* ------------------------------------------------------------------ */

type StyleModifier = "formal" | "concise" | null;

const STYLE_LABELS: Record<string, string> = {
  formal: "Use formal academic tone",
  concise: "Keep points brief and concise",
};

/** Style-specific item pools — applied on top of the structural pool */
const FORMAL_ITEM_POOL: Record<string, string[]> = {
  "Introduction": [
    "An examination of the EU AI Act and its significance within the regulatory landscape",
    "A chronological analysis of the legislative trajectory from initial proposal to formal enforcement (2021-2025)",
    "The Act's distinction as the first comprehensive artificial intelligence regulatory framework at a global level",
    "A comparative assessment with pre-existing technology governance instruments",
    "An analysis of stakeholder discourse and public deliberation surrounding the legislation",
    "Contextualisation within the European Union's overarching digital strategy",
  ],
  "Key Provisions": [
    "The risk-stratified regulatory framework: delineation of prohibited, high-risk, limited-risk, and minimal-risk artificial intelligence systems",
    "Enumeration of prohibited AI practices, including but not limited to social scoring and emotion recognition in occupational and educational settings",
    "Mandatory requirements for high-risk AI systems pertaining to documentation, transparency, and human oversight",
    "Regulatory obligations imposed upon foundation model providers and general-purpose AI systems",
    "Compliance obligations for providers of general-purpose artificial intelligence",
    "Transparency mandates for content generated by artificial intelligence systems",
  ],
  "Compliance Requirements": [
    "Conformity assessment procedures and the CE marking framework",
    "Establishment of risk management systems and quality management protocols",
    "Data governance obligations and record-keeping requirements",
    "Human oversight requirements and accountability mechanisms",
    "Post-market monitoring obligations and incident reporting protocols",
    "Documentation standards and technical file maintenance requirements",
  ],
  "Enforcement and Penalties": [
    "The establishment and mandate of national supervisory authorities",
    "Financial penalties of up to €35 million or 7% of global annual turnover for non-compliance",
    "The phased implementation timeline extending through 2027",
    "The institutional role of the European AI Office in oversight and coordination",
    "Cross-border enforcement mechanisms and jurisdictional cooperation",
    "Whistleblower protections pertaining to AI regulatory violations",
  ],
  "Industry Impact": [
    "Implications for artificial intelligence developers and deploying entities",
    "Analysis of compliance costs and their effect on market access",
    "The equilibrium between fostering innovation and ensuring regulatory compliance",
    "The Act's global influence on the development of AI governance frameworks",
    "Competitive implications for enterprises domiciled within the European Union",
    "Impact on artificial intelligence research and open-source development practices",
  ],
  "Conclusion": [
    "The Act's significance for the trajectory of artificial intelligence regulation",
    "Its potential as a regulatory model for other jurisdictions and international bodies",
    "An assessment of the challenges and opportunities that lie ahead",
    "Long-term implications for the landscape of AI innovation within Europe",
    "The role of public engagement in shaping future AI policy discourse",
    "The evolving nature of AI governance frameworks and adaptive regulation",
  ],
};

const CONCISE_ITEM_POOL: Record<string, string[]> = {
  "Introduction": [
    "What the EU AI Act is",
    "Timeline: 2021-2025",
    "First global AI law",
    "Comparison with other tech regulations",
    "Public and stakeholder response",
    "Part of EU digital strategy",
  ],
  "Key Provisions": [
    "Risk tiers: prohibited → minimal",
    "Banned uses: social scoring, emotion tracking",
    "High-risk rules: docs, transparency, oversight",
    "Foundation model requirements",
    "General-purpose AI obligations",
    "AI content labelling rules",
  ],
  "Compliance Requirements": [
    "CE marking + conformity checks",
    "Risk & quality management",
    "Data governance + records",
    "Human oversight rules",
    "Post-market monitoring",
    "Technical documentation",
  ],
  "Enforcement and Penalties": [
    "National regulators",
    "Fines: up to €35M / 7% revenue",
    "Phased rollout through 2027",
    "EU AI Office role",
    "Cross-border enforcement",
    "Whistleblower protections",
  ],
  "Industry Impact": [
    "Effects on developers & deployers",
    "Compliance costs vs. market access",
    "Innovation–regulation trade-off",
    "Global governance influence",
    "EU company competitiveness",
    "Research & open-source impact",
  ],
  "Conclusion": [
    "Future of AI regulation",
    "Model for other countries",
    "Challenges & opportunities ahead",
    "Long-term EU innovation impact",
    "Public engagement in AI policy",
    "Evolving governance frameworks",
  ],
};

/* Style pools for the EXAMPLE pair (renewable energy) shown in the sidebar */
const EXAMPLE_FORMAL_POOL: Record<string, string[]> = {
  "Introduction": [
    "An analysis of the present state of renewable energy development across Europe",
    "An examination of policy objectives and commitments pertaining to climate change mitigation",
    "The strategic significance of renewable energy for ensuring energy security and addressing climate change",
  ],
  "Key Policies": [
    "The objectives and strategic framework of the European Green Deal",
    "The REPowerEU plan and its implications for European energy independence",
    "The Renewable Energy Directive (RED III) and its quantitative targets",
  ],
  "Implementation Challenges": [
    "Limitations pertaining to grid infrastructure and energy storage capacity",
    "The financing and capital investment requirements for renewable energy deployment",
    "The complexities of cross-border energy cooperation and regulatory harmonisation",
  ],
  "Economic Impact": [
    "Employment generation within the green energy sector and associated industries",
    "The effects of energy transition policies on consumer energy pricing",
    "Concerns regarding industrial competitiveness in the context of energy transition",
  ],
  "Conclusion": [
    "An assessment of progress toward the 2030 and 2050 climate and energy targets",
    "The role of policy instruments in accelerating the renewable energy transition",
    "Future outlook and the identification of remaining policy and implementation gaps",
  ],
};

const EXAMPLE_CONCISE_POOL: Record<string, string[]> = {
  "Introduction": [
    "Renewable energy status in Europe",
    "Climate policy goals",
    "Energy security relevance",
  ],
  "Key Policies": [
    "Green Deal objectives",
    "REPowerEU plan",
    "RED III targets",
  ],
  "Implementation Challenges": [
    "Grid & storage gaps",
    "Investment needs",
    "Cross-border cooperation",
  ],
  "Economic Impact": [
    "Green job creation",
    "Consumer energy costs",
    "Industry competitiveness",
  ],
  "Conclusion": [
    "2030/2050 progress",
    "Policy role in transition",
    "Remaining gaps",
  ],
};

/* ------------------------------------------------------------------ */
/*  Structural highlight groups                                        */
/* ------------------------------------------------------------------ */

/** Connected groups — only these cross-highlight between sidebar & output */
type StructGroup = "title" | "intro" | "key-topics" | "impact" | "conclusion" | "footer";

const HIGHLIGHT_CLASS = "bg-brand-tertiary-700/15 ring-1 ring-brand-tertiary-700/25";

/** Map section headings → connected group. Unconnected sections return null. */
const SECTION_STRUCT_MAP: Record<string, StructGroup> = {
  "Introduction": "intro",
  "Key Policies": "key-topics",
  "Key Provisions": "key-topics",
  "Economic Impact": "impact",
  "Industry Impact": "impact",
  "Conclusion": "conclusion",
};

function getSectionGroup(heading: string): StructGroup | null {
  return SECTION_STRUCT_MAP[heading] ?? null;
}

/* ------------------------------------------------------------------ */
/*  Session-once hint                                                  */
/* ------------------------------------------------------------------ */

const HINT_KEY = "llm-training-struct-hint-seen";

function useStructHint() {
  const [show, setShow] = useState(() => !sessionStorage.getItem(HINT_KEY));
  const dismiss = () => {
    sessionStorage.setItem(HINT_KEY, "1");
    setShow(false);
  };
  return { show, dismiss };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LLMTrainingExercise() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"structural" | "interactive">("structural");
  const [selectedPair, setSelectedPair] = useState<string>(INPUT_OUTPUT_PAIRS[0].id);
  const [activeStruct, setActiveStruct] = useState<StructGroup | null>(null);
  const { show: showHint, dismiss: dismissHint } = useStructHint();

  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  /* ── Interactive mode state ── */
  const [editableExample, setEditableExample] = useState<OutputSection[]>(
    () => INPUT_OUTPUT_PAIRS[0].sections.map(s => ({ heading: s.heading, items: [...s.items] }))
  );
  const [activeStyle, setActiveStyle] = useState<StyleModifier>(null);

  const handleSyncScroll = useCallback((source: "sidebar" | "main") => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    const from = source === "sidebar" ? sidebarScrollRef.current : mainScrollRef.current;
    const to = source === "sidebar" ? mainScrollRef.current : sidebarScrollRef.current;
    if (from && to) {
      const ratio = from.scrollTop / (from.scrollHeight - from.clientHeight || 1);
      to.scrollTop = ratio * (to.scrollHeight - to.clientHeight);
    }
    requestAnimationFrame(() => { isSyncing.current = false; });
  }, []);

  const togglePair = (id: string) => {
    setSelectedPair((prev) => (prev === id ? "" : id));
    setActiveStruct(null);
  };

  /** Only connected (non-null) groups get highlight styling */
  const structClass = (group: StructGroup | null) =>
    cn(
      "transition-all duration-200 rounded-sm",
      group && activeStruct === group ? HIGHLIGHT_CLASS : "",
      // Only dim elements that ARE connected but not the active one
      activeStruct && group && activeStruct !== group ? "opacity-35" : ""
    );

  const structHandlers = (group: StructGroup | null) => group ? ({
    onMouseEnter: () => setActiveStruct(group),
    onMouseLeave: () => setActiveStruct(null),
  }) : {};

  /* ── Interactive mode handlers ── */
  const handleDeleteItem = useCallback((sectionIndex: number, itemIndex: number) => {
    setEditableExample(prev => {
      const next = prev.map(s => ({ ...s, items: [...s.items] }));
      if (next[sectionIndex].items.length > 1) {
        next[sectionIndex].items.splice(itemIndex, 1);
      }
      return next;
    });
  }, []);

  const handleAddItem = useCallback((sectionIndex: number) => {
    setEditableExample(prev => {
      const next = prev.map(s => ({ ...s, items: [...s.items] }));
      const section = next[sectionIndex];
      const original = INPUT_OUTPUT_PAIRS[0].sections[sectionIndex];
      // Add a generic new bullet
      const count = section.items.length + 1;
      section.items.push(`New point ${count} for ${original.heading.toLowerCase()}`);
      return next;
    });
  }, []);

  const handleToggleStyle = useCallback((style: StyleModifier) => {
    setActiveStyle(prev => prev === style ? null : style);
  }, []);

  const handleResetExample = useCallback(() => {
    setEditableExample(
      INPUT_OUTPUT_PAIRS[0].sections.map(s => ({ heading: s.heading, items: [...s.items] }))
    );
    setActiveStyle(null);
  }, []);

  /* ── Derive example pair items from style ── */
  const derivedExample = useMemo((): OutputSection[] => {
    if (!activeStyle) return editableExample;
    const pool = activeStyle === "formal" ? EXAMPLE_FORMAL_POOL : EXAMPLE_CONCISE_POOL;
    return editableExample.map(section => {
      const styledItems = pool[section.heading];
      if (!styledItems) return section;
      // Keep the same count as the editable version, pull from styled pool
      return {
        ...section,
        items: section.items.map((_, i) => styledItems[i] ?? section.items[i]),
      };
    });
  }, [editableExample, activeStyle]);

  /* ── Derive output from editable example ── */
  const derivedOutput = useMemo(() => {
    const stylePool = activeStyle === "formal"
      ? FORMAL_ITEM_POOL
      : activeStyle === "concise"
        ? CONCISE_ITEM_POOL
        : OUTPUT_ITEM_POOL;

    return MAIN_OUTPUT.sections.map(outputSection => {
      // Find the matching example section
      const exampleSection = editableExample.find(
        es => EXAMPLE_TO_OUTPUT_HEADING[es.heading] === outputSection.heading
      );
      if (!exampleSection) return outputSection;

      const pool = stylePool[outputSection.heading] || OUTPUT_ITEM_POOL[outputSection.heading] || outputSection.items;
      const targetCount = exampleSection.items.length;
      const items = pool.slice(0, targetCount);

      return { ...outputSection, items };
    });
  }, [editableExample, activeStyle]);

  const derivedFooter = useMemo(() => {
    if (activeStyle === "formal") {
      return "Should you require elaboration on any particular section, or wish to adjust the thematic focus of this outline, please do not hesitate to indicate your preferences.";
    }
    if (activeStyle === "concise") {
      return "Need changes? Let me know.";
    }
    return MAIN_OUTPUT.footer;
  }, [activeStyle]);

  const derivedExampleFooter = useMemo(() => {
    if (activeStyle === "formal") {
      return "Should you wish to elaborate on any particular section or adjust the thematic focus of this outline, please indicate your preferences.";
    }
    if (activeStyle === "concise") {
      return "Want changes? Just say.";
    }
    return INPUT_OUTPUT_PAIRS[0].footer;
  }, [activeStyle]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col pb-10">
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col">
            <div className="hidden 2xl:block pt-6 pb-5">
              <Breadcrumb />
            </div>

            <div className="flex flex-1">
              {/* ── Left sidebar ── */}
              <div className="w-80 flex-shrink-0 px-6 pt-6 2xl:pt-0 flex flex-col overflow-hidden">
                <h2 className="text-xl font-heading font-bold text-foreground mb-3">
                  Supervised learning
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {viewMode === "structural"
                    ? "The model will use the training example (input) to create the output."
                    : "Edit the training example below and see how it changes the model's output."
                  }
                </p>

                {/* View mode toggle */}
                <div className="mb-4">
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(v) => v && setViewMode(v as typeof viewMode)}
                    className="w-full"
                  >
                    <ToggleGroupItem value="structural" className="flex-1 gap-1.5 text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      Observe
                    </ToggleGroupItem>
                    <ToggleGroupItem value="interactive" className="flex-1 gap-1.5 text-xs">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Example
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* ── Structural view sidebar ── */}
                {viewMode === "structural" && (
                  <>
                    <p className="text-sm font-semibold text-foreground mb-3">
                      Select an input-output pair and see how the output changes
                    </p>

                    <div className="space-y-3 flex-1 overflow-y-auto pr-1 pb-4">
                      {INPUT_OUTPUT_PAIRS.map((pair, index) => {
                        const isSelected = selectedPair === pair.id;
                        return (
                          <button
                            key={pair.id}
                            type="button"
                            onClick={() => togglePair(pair.id)}
                            data-highlight-target={index === 0 ? "pair-card" : undefined}
                            className={cn(
                              "w-full rounded-xl border p-3 text-left transition-shadow font-heading",
                              isSelected
                                ? "border-brand-tertiary-500 shadow-sm"
                                : "border-border hover:shadow-md"
                            )}
                          >
                            {!isSelected && (
                              <span className="text-xs font-semibold text-foreground">
                                Input Output pair {index + 1}
                              </span>
                            )}

                            {isSelected && (
                              <div className="space-y-2">
                                <span className="text-xs font-semibold text-foreground block">
                                  Input Output pair {index + 1}
                                </span>

                                {/* Input */}
                                <div>
                                  <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                                    Input
                                  </span>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {pair.input}
                                  </p>
                                </div>

                                {/* Output – structurally highlighted, scrollable */}
                                <div className="flex flex-col min-h-0">
                                  <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                                    Output
                                  </span>

                                  <div
                                    ref={sidebarScrollRef}
                                    onScroll={() => handleSyncScroll("sidebar")}
                                    className="max-h-[280px] overflow-y-auto pr-1"
                                  >
                                    <span
                                      className={cn(
                                        "text-xs font-semibold text-foreground block px-1 py-0.5 cursor-default",
                                        structClass("title")
                                      )}
                                      {...structHandlers("title")}
                                    >
                                      {pair.outputTitle}
                                    </span>

                                    <div className="mt-1.5 space-y-1.5">
                                      {pair.sections.map((section, si) => {
                                        const group = getSectionGroup(section.heading);
                                        return (
                                        <div key={si}>
                                          <span
                                            className={cn(
                                              "text-xs font-semibold text-foreground block px-1 py-0.5 cursor-default",
                                              structClass(group)
                                            )}
                                            {...structHandlers(group)}
                                          >
                                            {section.heading}
                                          </span>
                                          <ul className="ml-2 mt-0.5 space-y-0.5">
                                            {section.items.map((item, ii) => (
                                              <li
                                                key={ii}
                                                className={cn(
                                                  "text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5 px-1 py-0.5 cursor-default",
                                                  structClass(group)
                                                )}
                                                {...structHandlers(group)}
                                              >
                                                <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
                                                {item}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        );
                                      })}
                                    </div>

                                    {pair.footer && (
                                      <p
                                        className={cn(
                                          "text-xs text-muted-foreground italic mt-2 px-1 py-0.5 cursor-default",
                                          structClass("footer")
                                        )}
                                        {...structHandlers("footer")}
                                      >
                                        {pair.footer}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* ── Interactive view sidebar ── */}
                {viewMode === "interactive" && (
                  <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-3">
                    {/* Example label */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Training example
                      </span>
                      <button
                        type="button"
                        onClick={handleResetExample}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Example input (read-only) */}
                    <div className="rounded-lg border border-border p-3">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                        Input
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {INPUT_OUTPUT_PAIRS[0].input}
                      </p>
                    </div>

                    {/* Editable example output */}
                    <div className="rounded-lg border border-brand-tertiary-500 p-3 flex flex-col min-h-0">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                        Output (editable)
                      </span>

                      <div
                        ref={sidebarScrollRef}
                        onScroll={() => handleSyncScroll("sidebar")}
                        className="max-h-[280px] overflow-y-auto pr-1 space-y-2"
                      >
                        <span className="text-xs font-semibold text-foreground block">
                          {INPUT_OUTPUT_PAIRS[0].outputTitle}
                        </span>

                        {derivedExample.map((section, si) => (
                          <div key={si}>
                            <span className="text-xs font-semibold text-foreground block mb-0.5">
                              {section.heading}
                            </span>
                            <ul className="ml-1 space-y-0.5">
                              {section.items.map((item, ii) => (
                                <li
                                  key={ii}
                                  className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1 group"
                                >
                                  <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
                                  <span className="flex-1">{item}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(si, ii)}
                                    className={cn(
                                      "flex-shrink-0 p-0.5 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors",
                                      section.items.length <= 1 && "invisible"
                                    )}
                                    aria-label="Remove item"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                            <button
                              type="button"
                              onClick={() => handleAddItem(si)}
                              className="mt-0.5 ml-1 flex items-center gap-1 text-[10px] text-brand-tertiary-500 hover:text-brand-tertiary-700 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              Add point
                            </button>
                          </div>
                        ))}

                        {derivedExampleFooter && (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            {derivedExampleFooter}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Style modifiers */}
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Language style
                      </span>
                      <div className="space-y-1">
                        {(Object.entries(STYLE_LABELS) as [StyleModifier & string, string][]).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleToggleStyle(key as StyleModifier)}
                            className={cn(
                              "w-full text-left text-xs px-2.5 py-1.5 rounded-md border transition-colors",
                              activeStyle === key
                                ? "border-brand-tertiary-500 bg-brand-tertiary-500/10 text-foreground"
                                : "border-border text-muted-foreground hover:border-brand-tertiary-500/50"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Center content ── */}
              <div className="flex-initial flex flex-col px-6 py-6 2xl:pt-0 items-start">
                <div className="w-full max-w-[1100px] 2xl:hidden">
                  <Breadcrumb />
                  <div className="mb-5" />
                </div>

                <div className="flex gap-6 max-w-[1100px] w-full">
                  <div className="flex-1 flex flex-col">
                    <div className="bg-background rounded-lg p-8 flex-1 flex flex-col">
                      <ChatPrompt text={MAIN_OUTPUT.input} />

                      {/* ── Structural view output ── */}
                      {viewMode === "structural" && (
                        <div ref={mainScrollRef} onScroll={() => handleSyncScroll("main")} className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                          {/* Title */}
                          <h2
                            className={cn(
                              "text-xl font-heading font-semibold text-foreground mb-6 px-1 py-0.5 cursor-default",
                              structClass("title")
                            )}
                            {...structHandlers("title")}
                          >
                            {MAIN_OUTPUT.outputTitle}
                          </h2>

                          <div className="space-y-6">
                            {MAIN_OUTPUT.sections.map((section, i) => {
                              const group = getSectionGroup(section.heading);
                              return (
                              <div key={i}>
                                <h3
                                    className={cn(
                                      "text-lg font-heading font-semibold text-foreground mb-3 px-1 py-0.5 cursor-default",
                                      structClass(group)
                                    )}
                                    {...structHandlers(group)}
                                  >
                                    {section.heading}
                                  </h3>
                                {section.heading === "Introduction" ? (
                                  <SectionFlag
                                    evaluationFactor="relevance"
                                    severity="error"
                                    explanation="The model produces three to four bullet points per section because that is the pattern in the training example — not because three points are the right number for this topic. This rigid structure can cause the model to leave out key information or wrongly elevate minor points to fill the pattern."
                                  >
                                    <ul className="space-y-2 ml-1">
                                      {section.items.map((item, j) => (
                                        <li
                                          key={j}
                                          className={cn(
                                            "flex items-start gap-3 text-base text-foreground leading-relaxed px-1 py-0.5 cursor-default",
                                            structClass(group)
                                          )}
                                          {...structHandlers(group)}
                                        >
                                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </SectionFlag>
                                ) : section.heading === "Industry Impact" ? (
                                  <SectionFlag
                                    evaluationFactor="relevance"
                                    severity="error"
                                    explanation="The order and prominence of sections in the output is shaped by the training pair's structure, not by what is most relevant to this specific topic. A section placed high in the outline may appear important, but its position is inherited from the example — you might miss key information or wrongly elevate minor points."
                                  >
                                    <ul className="space-y-2 ml-1">
                                      {section.items.map((item, j) => (
                                        <li
                                          key={j}
                                          className={cn(
                                            "flex items-start gap-3 text-base text-foreground leading-relaxed px-1 py-0.5 cursor-default",
                                            structClass(group)
                                          )}
                                          {...structHandlers(group)}
                                        >
                                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </SectionFlag>
                                ) : (
                                  <ul className="space-y-2 ml-1">
                                    {section.items.map((item, j) => (
                                      <li
                                        key={j}
                                        className={cn(
                                          "flex items-start gap-3 text-base text-foreground leading-relaxed px-1 py-0.5 cursor-default",
                                          structClass(group)
                                        )}
                                        {...structHandlers(group)}
                                      >
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              );
                            })}
                          </div>

                          {/* Footer */}
                          {MAIN_OUTPUT.footer && (
                            <p
                              className={cn(
                                "text-sm text-muted-foreground italic mt-6 px-1 py-0.5 cursor-default",
                                structClass("footer")
                              )}
                              {...structHandlers("footer")}
                            >
                              {MAIN_OUTPUT.footer}
                            </p>
                          )}
                        </div>
                      )}

                      {/* ── Interactive view output ── */}
                      {viewMode === "interactive" && (
                        <div ref={mainScrollRef} onScroll={() => handleSyncScroll("main")} className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                          <h2 className="text-xl font-heading font-semibold text-foreground mb-6 px-1 py-0.5">
                            {MAIN_OUTPUT.outputTitle}
                          </h2>

                          <div className="space-y-6">
                            {derivedOutput.map((section, i) => (
                              <div key={i}>
                                <h3 className="text-lg font-heading font-semibold text-foreground mb-3 px-1 py-0.5">
                                  {section.heading}
                                </h3>
                                <ul className="space-y-2 ml-1">
                                  {section.items.map((item, j) => (
                                    <li
                                      key={`${section.heading}-${j}`}
                                      className="flex items-start gap-3 text-base text-foreground leading-relaxed px-1 py-0.5 animate-in fade-in duration-300"
                                    >
                                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>

                          {derivedFooter && (
                            <p className="text-sm text-muted-foreground italic mt-6 px-1 py-0.5">
                              {derivedFooter}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="mt-8 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/module/llm-training")}
                          className="rounded-md border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                        >
                          <ArrowLeft className="!h-5 !w-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/module/llm-training/few-shot")}
                          className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                        >
                          Next (Few-Shot Prompting)
                          <ArrowRight className="-mr-2 !h-6 !w-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right sidebar ── */}
              <div className="w-80 flex-shrink-0">
                <EvaluationPanel initialIsOpen={false} canClose={true} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 px-3 py-2 bg-background/80 backdrop-blur-sm">
        <p className="text-[13px] leading-snug text-muted-foreground/70 text-left">
          LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
        </p>
      </div>

      {/* Feature Highlight */}
      <FeatureHighlight
        target='[data-highlight-target="pair-card"]'
        open={showHint && viewMode === "structural" && selectedPair === INPUT_OUTPUT_PAIRS[0].id}
        onClose={dismissHint}
        side="right"
        sideOffset={20}
        closeLabel="Got it"
      >
        <strong>Compare sections!</strong>
        <br />
        Hover over a section (e.g. Introduction, Conclusion) in the training pair to see the matching section highlighted in the output — notice how the model replicates the same structure.
      </FeatureHighlight>
    </div>
  );
}
