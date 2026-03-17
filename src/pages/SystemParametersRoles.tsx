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

const PROMPT_TEXT = "Draft a lead paragraph for a news article about how EU member states are preparing to enforce the AI Act's requirements on high-risk AI systems.";

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
    "EU member states are establishing national authorities to oversee compliance with the AI Act's requirements for high-risk AI systems. The regulation, which entered into force in August 2024, requires providers and deployers of high-risk AI to meet strict standards on transparency, risk management, and human oversight. Member states have until August 2025 to designate competent authorities and notify the European Commission.\n\nThe enforcement framework gives national regulators the power to conduct market surveillance, request documentation, and impose fines of up to €35 million or 7% of global turnover for the most serious violations.",
  journalist:
    "Behind closed doors in Brussels, a turf war is brewing over who will police Europe's AI industry — and how. While the AI Act mandates that each member state designate a national authority by August 2025, interviews with officials in six EU capitals reveal a fractured landscape: some governments are building dedicated AI agencies from scratch, others are quietly handing the brief to overwhelmed data protection offices already buckling under GDPR caseloads.\n\nMeanwhile, industry lobbyists are exploiting the uncertainty. Internal documents obtained by this newsroom show that at least three major tech firms have launched coordinated campaigns to influence how 'high-risk' classifications are interpreted at the national level — raising questions about whether enforcement will have teeth or merely the appearance of them.",
  novelist:
    "The letter arrived on a Tuesday, as consequential things often do — tucked between budget memos and a lunch invitation from the Finnish delegation. Claire Marchand, newly appointed to lead France's AI oversight office, read it twice before setting it down on her desk in the Bercy district. Twenty-seven nations, the Commissioner wrote, must speak with one voice on artificial intelligence. But voices, Claire knew, were precisely what algorithms did not have.\n\nShe stood at her window, watching barges drift along the Seine, and thought of the task ahead: to judge machines that learned faster than her staff could be hired, to enforce rules written for a technology that would be unrecognizable by the time the ink was dry. Somewhere in Berlin, in Rome, in Tallinn, her counterparts were reading the same letter — each wondering, she imagined, the same quiet thing.",
};
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
              <div className="w-[860px]">
                <Breadcrumb />
              </div>
            </div>

            {/* Three column layout */}
            <div className="flex flex-1 items-start px-6 relative justify-center">
              {/* Left panel - Role selection */}
              <div className="w-[320px] flex-shrink-0 pr-10">
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
              <div className="w-[860px] flex-shrink-0">
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
