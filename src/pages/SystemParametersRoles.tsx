import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import ModuleNavigation from "@/components/ModuleNavigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import roleDefaultImg from "@/assets/role-default.png";
import roleJournalistImg from "@/assets/role-journalist.png";
import roleNovelistImg from "@/assets/role-novelist.png";

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
    "Obligations for Providers: The majority of obligations fall on providers (developers) of high-risk AI systems, including those outside the EU if their systems are used within the EU.\n\nUser Responsibilities: Users (deployers) of high-risk AI systems have certain obligations, though less than providers.",
  journalist:
    "Investigation reveals regulatory gap: While the EU AI Act imposes the heaviest compliance burden on providers of high-risk AI systems — including extraterritorial reach to non-EU developers — enforcement mechanisms remain largely untested. Sources within the European Commission confirm that resource allocation for oversight bodies is still under negotiation.\n\nDeployer accountability under scrutiny: Organizations deploying high-risk AI face their own set of obligations, but whistleblowers warn that the lighter requirements create a potential loophole for responsibility-shifting from developers to end-users.",
  novelist:
    "In the marble corridors of Brussels, a new chapter was being written — one that would reach far beyond the continent's borders. The architects of the EU AI Act had cast their net wide, ensnaring not just European developers but any creator whose digital progeny dared set foot on EU soil.\n\nAnd then there were the deployers — those who wielded these tools of algorithmic prophecy. Their burden was lighter, yes, but no less consequential. For in the act of deployment lay a quiet complicity, an unspoken agreement that the outputs of these systems would shape decisions, lives, futures.",
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

              {/* Middle column - Output text */}
              <div className="w-[860px] flex-shrink-0">
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
                    size="lg"
                    onClick={() => navigate("/module/system-parameters/temperature")}
                    className="px-10 font-heading font-semibold border-brand-tertiary-500 text-brand-tertiary-500 hover:bg-brand-tertiary-500/10"
                  >
                    <ArrowLeft className="-ml-2 !h-6 !w-6" />
                    Previous (Temperature)
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
