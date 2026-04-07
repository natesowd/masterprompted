/**
 * Component Manifest
 * 
 * A semantic index of complex components in the application.
 * Each entry provides a brief description of the component's purpose and key features.
 */

export const COMPONENT_MANIFEST = {
  // Chat Components
  ChatBoxPromptPlayground: {
    description: "Specialized chatbox for the Prompt Playground with support for prompt optimization regeneration.",
    features: ["Controlled textarea", "File attachments", "Regenerate button", "Bounce animation", "Keyboard shortcuts"],
    path: "src/components/ChatBoxPromptPlayground.tsx"
  },
  ChatBoxPromptConstruction: {
    description: "Simplified chatbox for Guided Exploration/Prompt Construction modules.",
    features: ["Controlled textarea", "File attachments", "Bounce animation"],
    path: "src/components/ChatBoxPromptConstruction.tsx"
  },
  ChatPrompt: {
    description: "User message display with version navigation and rich text formatting",
    features: ["Version history", "File attachments", "Parameter display", "Rich text support"],
    path: "src/components/ChatPrompt.tsx"
  },
  ChatAnswer: {
    description: "AI response display with diff visualization and inline comments",
    features: ["Text diffing", "Change highlighting", "Inline comments", "Removed text sidebar"],
    path: "src/components/ChatAnswer.tsx"
  },
  ChatBody: {
    description: "Container for chat conversation threads with diff comparison",
    features: ["Thread management", "Diff toggle", "Comment positioning", "Scroll management"],
    path: "src/components/ChatBody.tsx"
  },

  // Evaluation Components
  EvaluationPanel: {
    description: "Collapsible panel displaying journalistic evaluation criteria",
    features: ["Expandable criteria", "Icon indicators", "Context-based highlighting", "Auto-expand", "Localization"],
    path: "src/components/EvaluationPanel.tsx"
  },
  SectionFlag: {
    description: "Highlights problematic sections with evaluation criteria badges",
    features: ["Hover explanations", "Context-based highlighting", "Visual borders", "Icon badges"],
    path: "src/components/SectionFlag.tsx"
  },
  TextFlag: {
    description: "Inline text annotation with evaluation criteria and explanations",
    features: ["Inline icons", "Hover cards", "External links", "Context-based highlighting", "Auto-expand trigger"],
    path: "src/components/TextFlag.tsx"
  },
  BranchTreeDiagram: {
    description: "Interactive tree diagram visualizing next-word probabilities and branching paths",
    features: ["Interactive nodes", "Probability visualization", "Automated path selection", "Flagged token integration"],
    path: "src/components/BranchTreeDiagram.tsx"
  },
  FullBranchDiagram: {
    description: "Comprehensive visualization of all possible text generation paths with probability weighting",
    features: ["Pan and zoom", "Complete path exploration", "Probability heatmaps", "Flagged token integration"],
    path: "src/components/FullBranchDiagram.tsx"
  },

  // UI Components
  DialogPopup: {
    description: "Customizable modal dialog with primary and secondary actions",
    features: ["Controlled state", "Action callbacks", "Responsive layout", "Close handling"],
    path: "src/components/DialogPopup.tsx"
  },
  ProgressIndicator: {
    description: "Visual progress tracker for multi-step flows",
    features: ["Step navigation", "Hover labels", "Active state", "Progress visualization"],
    path: "src/components/ProgressIndicator.tsx"
  },
  RichText: {
    description: "Renders formatted text with markdown-like inline formatting",
    features: ["Bold/italic support", "HTML escaping", "Inline/block modes", "Diff mode"],
    path: "src/components/RichText.tsx"
  },
  Header: {
    description: "Main navigation header with dropdown menus and language switcher",
    features: ["Module navigation", "Active state", "Transparent mode", "Responsive"],
    path: "src/components/Header.tsx"
  },

  // Interactive Components
  PopoverSeries: {
    description: "Sequential popover guide for onboarding or tutorials",
    features: ["Step progression", "Target highlighting", "Navigation controls", "Completion tracking"],
    path: "src/components/PopoverSeries.tsx"
  },
  ModuleNavigation: {
    description: "Bottom navigation for module progression",
    features: ["Previous/next navigation", "Completion status", "Route management"],
    path: "src/components/ModuleNavigation.tsx"
  },
  PromptControlsPromptPlayground: {
    description: "Interactive controls for the Prompt Playground including optimization walkthroughs and parameter overrides.",
    features: ["Slider inputs", "Walkthrough dialog", "Meta-prompt info", "Real-time updates", "Reset functionality"],
    path: "src/components/PromptControlsPromptPlayground.tsx"
  },
  PromptControlsPromptConstruction: {
    description: "Guided controls for prompt parameter adjustment focusing on construction basics.",
    features: ["Slider inputs", "Simplified parameters", "Real-time updates", "Reset functionality"],
    path: "src/components/PromptControlsPromptConstruction.tsx"
  },

  // Utility Components
  TypewriterText: {
    description: "Animated text reveal with typewriter effect",
    features: ["Word-by-word animation", "Completion callback", "Configurable delay"],
    path: "src/components/TypewriterText.tsx"
  },
  LoadingDots: {
    description: "Animated loading indicator with pulsing dots",
    features: ["Customizable text", "Dot animation", "Styling options"],
    path: "src/components/LoadingDots.tsx"
  },
  AnimatedTransition: {
    description: "Page transition wrapper with fade/slide effects",
    features: ["Route-based transitions", "Configurable animations", "Smooth page changes"],
    path: "src/components/AnimatedTransition.tsx"
  },
  Breadcrumb: {
    description: "Navigation breadcrumb trail for hierarchical pages",
    features: ["Auto-generation", "Current page indicator", "Link navigation"],
    path: "src/components/Breadcrumb.tsx"
  },
  RemovedTextSidebar: {
    description: "Side panel displaying removed text from diff comparisons",
    features: ["Comment list", "Position tracking", "Scroll sync", "Toggle visibility"],
    path: "src/components/RemovedTextSidebar.tsx"
  },
  VideoLightbox: {
    description: "Modal video player with YouTube embedding",
    features: ["Lightbox overlay", "Close on outside click", "Responsive sizing"],
    path: "src/components/VideoLightbox.tsx"
  },
  LanguageSwitcher: {
    description: "Toggle button for switching between English and Spanish",
    features: ["Language persistence", "Compact display", "Callback support"],
    path: "src/components/LanguageSwitcher.tsx"
  },
  ConnectorLines: {
    description: "SVG connector lines between DOM elements",
    features: ["Dynamic positioning", "Responsive updates", "Curved paths"],
    path: "src/components/ConnectorLines.tsx"
  },
  FeatureHighlight: {
    description: "Guided tooltip that dims the screen and highlights a target element with a connector line",
    features: ["Screen dimming", "Element cutout", "Connector line", "Brand-styled tooltip", "Side positioning"],
    path: "src/components/FeatureHighlight.tsx"
  }
} as const;

export type ComponentName = keyof typeof COMPONENT_MANIFEST;
