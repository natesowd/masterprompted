import { Slider } from "@/components/ui/slider";

interface Props {
  threshold: number;
  onChange: (value: number) => void;
  /** Min keeps the slider above 0 so we don't display every chunk as paired. */
  min?: number;
  /** Max stays under 1 so we don't fall through to a fully unpaired body. */
  max?: number;
  step?: number;
}

const CompareControls = ({
  threshold,
  onChange,
  min = 0.05,
  max = 0.95,
  step = 0.01,
}: Props) => {
  return (
    <div className="flex items-center gap-3 mb-3 px-1 py-2 rounded-md bg-surface-100 border border-border/60">
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        Similarity threshold
      </span>
      <Slider
        value={[threshold]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? threshold)}
        className="flex-1 max-w-xs"
        aria-label="Cosine similarity threshold"
      />
      <span className="text-xs font-mono tabular-nums text-foreground min-w-[3ch] text-right">
        {threshold.toFixed(2)}
      </span>
    </div>
  );
};

export default CompareControls;
