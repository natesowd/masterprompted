import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const translations = {
  en: {
    nav: {
      home: 'Home',
      modules: 'Modules',
      about: 'About',
      contact: 'Contact',
      imprint: 'Imprint'
    },
    landing: {
      hero: {
        title: 'PromptED: Responsible AI use in Journalism',
        subtitle: 'A hands-on exploration and practice for journalists to observe how large language models function, their limitations, and how to use them for more trustworthy content production.',
        watchTrailer: 'Watch Trailer'
      },
      features: {
        simulator: {
          title: 'Guided Simulator',
          description: 'Interactive guide: explore how LLMs work and how to responsibly interact with them'
        },
        playground: {
          title: 'Prompt Playground',
          description: 'Apply your knowledge: experiment with your own prompts'
        },
        debunker: {
          title: 'AI Claim Debunker',
          description: 'Put your skills to work: review claims and gain counter perspectives'
        }
      },
      footer: {
        llmUsage: 'LLMs have been used in the following ways:',
        guidedExploration: 'Guided Exploration:',
        guidedExplorationDesc: 'To create prompt-output examples.',
        promptPlayground: 'Prompt Playground:',
        promptPlaygroundDesc: 'To optimize prompts, generate outputs and to identify factual inaccuracies and bias.',
        modelsUsed: 'Models used:',
        models: 'Llama 3.1 8B, Mistral, Claude, ChatGPT',
        euFunding: "Funded by the European Union's Horizon Europe Programme (Grant 101135437)"
      }
    },
    modules: {
      title: 'Modules',
      comingSoon: 'Coming soon...'
    },
    about: {
      title: 'About',
      description: 'This is the About page. Information about the project will be added here soon.'
    },
    contact: {
      title: 'Contact',
      description: 'Contact information will be added here soon.'
    },
    imprint: {
      title: 'Imprint',
      description: 'This is the Imprint page. Legal information and impressum will be added here soon.'
    },
    systemParameters: {
      title: 'System Parameters',
      comingSoon: 'Coming soon...'
    },
    llmTraining: {
      title: 'LLM Training',
      comingSoon: 'Coming soon...'
    },
    multipleSources: {
      title: 'Multiple Sources',
      comingSoon: 'Coming soon...'
    },
    journalisticEvaluation: {
      title: 'Journalistic Evaluation',
      comingSoon: 'Coming soon...'
    },
    promptConstruction: {
      bias: {
        title: 'Bias',
        comingSoon: 'Coming soon...'
      },
      context: {
        title: 'Context',
        comingSoon: 'Coming soon...'
      },
      conversationStyle: {
        title: 'Conversation Style',
        comingSoon: 'Coming soon...'
      }
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      modules: 'Módulos',
      about: 'Acerca de',
      contact: 'Contacto',
      imprint: 'Aviso Legal'
    },
    landing: {
      hero: {
        title: 'PromptED: Uso Responsable de IA en Periodismo',
        subtitle: 'Una exploración y práctica para periodistas para observar cómo funcionan los modelos de lenguaje grandes, sus limitaciones y cómo usarlos para una producción de contenido más confiable.',
        watchTrailer: 'Ver Tráiler'
      },
      features: {
        simulator: {
          title: 'Simulador Guiado',
          description: 'Guía interactiva: explora cómo funcionan los LLM y cómo interactuar responsablemente con ellos'
        },
        playground: {
          title: 'Campo de Práctica de Prompts',
          description: 'Aplica tus conocimientos: experimenta con tus propios prompts'
        },
        debunker: {
          title: 'Verificador de Afirmaciones de IA',
          description: 'Pon tus habilidades a trabajar: revisa afirmaciones y obtén perspectivas contrarias'
        }
      },
      footer: {
        llmUsage: 'Los LLM se han utilizado de las siguientes maneras:',
        guidedExploration: 'Exploración Guiada:',
        guidedExplorationDesc: 'Para crear ejemplos de prompt-salida.',
        promptPlayground: 'Campo de Práctica de Prompts:',
        promptPlaygroundDesc: 'Para optimizar prompts, generar salidas e identificar inexactitudes factuales y sesgos.',
        modelsUsed: 'Modelos utilizados:',
        models: 'Llama 3.1 8B, Mistral, Claude, ChatGPT',
        euFunding: "Financiado por el Programa Horizonte Europa de la Unión Europea (Subvención 101135437)"
      }
    },
    modules: {
      title: 'Módulos',
      comingSoon: 'Próximamente...'
    },
    about: {
      title: 'Acerca de',
      description: 'Esta es la página Acerca de. La información sobre el proyecto se agregará aquí pronto.'
    },
    contact: {
      title: 'Contacto',
      description: 'La información de contacto se agregará aquí pronto.'
    },
    imprint: {
      title: 'Aviso Legal',
      description: 'Esta es la página de Aviso Legal. La información legal se agregará aquí pronto.'
    },
    systemParameters: {
      title: 'Parámetros del Sistema',
      comingSoon: 'Próximamente...'
    },
    llmTraining: {
      title: 'Entrenamiento LLM',
      comingSoon: 'Próximamente...'
    },
    multipleSources: {
      title: 'Múltiples Fuentes',
      comingSoon: 'Próximamente...'
    },
    journalisticEvaluation: {
      title: 'Evaluación Periodística',
      comingSoon: 'Próximamente...'
    },
    promptConstruction: {
      bias: {
        title: 'Sesgo',
        comingSoon: 'Próximamente...'
      },
      context: {
        title: 'Contexto',
        comingSoon: 'Próximamente...'
      },
      conversationStyle: {
        title: 'Estilo de Conversación',
        comingSoon: 'Próximamente...'
      }
    }
  }
};
