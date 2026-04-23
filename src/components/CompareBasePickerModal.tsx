import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ThreadVersion } from "@/pages/PromptPlayground";

interface Props {
  open: boolean;
  versions: ThreadVersion[];
  currentIndex: number;
  onPick: (comparedIndex: number) => void;
  onClose: () => void;
}

const PREVIEW_LEN = 120;

const CompareBasePickerModal = ({ open, versions, currentIndex, onPick, onClose }: Props) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("components.chatAnswer.comparePickBase")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {versions.map((v, i) => {
            if (i === currentIndex) return null;
            const preview = (v.answer ?? "").replace(/\s+/g, " ").trim().slice(0, PREVIEW_LEN);
            return (
              <button
                key={i}
                className="w-full text-left p-3 rounded border border-border hover:bg-muted/50 transition-colors"
                onClick={() => onPick(i)}
              >
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {t("components.chatAnswer.version")} {i + 1}
                </div>
                <div className="text-sm line-clamp-2">{preview || <em className="text-muted-foreground">(empty)</em>}</div>
              </button>
            );
          })}
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t("components.chatAnswer.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompareBasePickerModal;
