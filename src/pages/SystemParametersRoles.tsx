import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ModuleNavigation from "@/components/ModuleNavigation";
import ChatPrompt from "@/components/ChatPrompt";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import roleDefaultImg from "@/assets/role-default.png";
import roleJournalistImg from "@/assets/role-journalist.png";
import roleNovelistImg from "@/assets/role-novelist.png";

const PROMPT_TEXT = "Draft a lede paragraph for a news article about the EU AI Act.";

const ROLES = [
  {
    id: "default",
    label: "Default",
    image: roleDefaultImg,
  },
  {
    id: "journalist",
    label: "Investigative Journalist",
    image: roleJournalistImg,
  },
  {
    id: "novelist",
    label: "Novelist",
    image: roleNovelistImg,
  },
];

const ROLE_OUTPUTS: Record<string, string> = {
  default:
    "The European Union's Artificial Intelligence Act, which entered into force on August 1, 2024, establishes a comprehensive legal framework for the development, deployment, and use of AI systems across the bloc's 27 member states. The regulation adopts a risk-based approach, categorizing AI applications into four tiers — unacceptable, high-risk, limited, and minimal — and imposes obligations ranging from outright bans on social scoring and real-time biometric surveillance to transparency and documentation requirements for systems used in hiring, credit scoring, and law enforcement.",
  journalist:
    "After three years of backroom negotiations, closed-door trilogues, and intense lobbying from Silicon Valley and Beijing alike, the European Union has enacted what it calls the world's first comprehensive law governing artificial intelligence — but a months-long investigation reveals that key enforcement provisions remain vague, underfunded, and vulnerable to the same industry capture that has blunted the bloc's data protection regime.\n\nInternal Commission documents obtained through freedom-of-information requests show that at least four member states pushed to water down penalties for non-compliance during the final round of negotiations, while trade associations representing major AI developers held more than 160 meetings with MEPs on the responsible committees — outpacing civil society groups by a ratio of nearly five to one.",
  novelist:
    "The regulation was 144 pages long, and Élise Garnier had read every one of them twice — once in the fluorescent quiet of her office on Rue de la Loi, and once more at the kitchen table of her apartment in Ixelles, a glass of Côtes du Rhône turning warm beside her laptop. The AI Act, they were calling it. As though three letters and a noun could contain the thing they were all afraid of.\n\nShe closed the document and looked out at the Brussels rain, thinking of the hearing tomorrow — the parade of executives in good suits who would explain, with great patience, why their systems were not the ones the law was meant for. They never were. The dangerous ones never were.",
};

export default function SystemParametersRoles() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState("default");

  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col w-full">
            {/* Breadcrumb */}
            <div className="pt-6 pb-3 px-6 flex justify-center">
              <div className="max-w-[860px]">
                <Breadcrumb />
              </div>
            </div>

            {/* Three column layout */}
            <div className="flex flex-1 items-start px-6 relative justify-center">
              {/* Left panel - Role selection */}
              <div className="w-[280px] lg:w-[320px] flex-shrink-0 pr-6 lg:pr-10">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Role Prompting
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Role prompting uses a system prompt to assign an LLM a specific role or persona. This prompt sets instructions about how the model should behave, communicate, and respond, guiding its outputs to match the defined role, context, and goals.
                </p>

                <p className="text-sm font-medium text-foreground mb-4">
                  Select a role and see how the output changes
                </p>

                <RadioGroup
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                  className="space-y-3"
                >
                  {ROLES.map((role) => (
                    <Label
                      key={role.id}
                      htmlFor={`role-${role.id}`}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedRole === role.id
                          ? "border-brand-tertiary-500 bg-brand-tertiary-500/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <img
                        src={role.image}
                        alt={role.label}
                        className="w-16 h-16 object-contain"
                      />
                      <RadioGroupItem value={role.id} id={`role-${role.id}`} />
                      <span className="text-sm font-medium text-foreground">
                        {role.label}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Middle column - Prompt + Output text */}
              <div className="flex-1 min-w-0">
                {/* Prompt bubble */}
                <ChatPrompt
                  text={PROMPT_TEXT}
                  fileName="EU_AI_Act.pdf"
                />

                <div className="min-h-[400px] pt-4">
                  {ROLE_OUTPUTS[selectedRole].split("\n\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-xl leading-relaxed text-muted-foreground/60 mb-8"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="mt-8 mb-12 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/module/system-parameters/temperature")}
                    className="h-12 w-12 border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                  >
                    <ArrowLeft className="!h-6 !w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/module/system-parameters/takeaways")}
                    className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                  >
                    Takeaways
                    <ArrowRight className="-mr-2 !h-6 !w-6" />
                  </Button>
                </div>
              </div>

              {/* Right column - Evaluation panel */}
              <div className="flex-shrink-0 ml-6">
                <EvaluationPanel initialIsOpen={true} canClose={true} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ModuleNavigation
        previousRoute="/module/system-parameters/temperature"
        nextRoute="/module/system-parameters/takeaways"
      />

      {/* LLM Disclaimer */}
      <div className="fixed bottom-3 left-3 text-[13px] leading-snug text-muted-foreground/70 text-left z-10">
        LLMs used in the creation of prompt output examples in the Guided Exploration include: Mistral, Claude, Chat GPT &amp; Llama 3.1 8B (open source)
      </div>
    </div>
  );
}
