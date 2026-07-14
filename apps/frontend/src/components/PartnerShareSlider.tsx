import { Slider } from "@costly/components";

type PartnerShareSliderProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  helpText?: string;
  className?: string;
};

export function PartnerShareSlider({
  value,
  onChange,
  label = "Partner's share (%)",
  helpText = "How much of this cost is your partner's share",
  className,
}: PartnerShareSliderProps) {
  return (
    <div className={className ?? "flex w-full flex-col gap-2"}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-neutral-900">
          {value}%
        </span>
      </div>
      {helpText ? (
        <p className="text-xs text-neutral-500">{helpText}</p>
      ) : null}
      <Slider
        value={[value]}
        onValueChange={(next) => {
          const raw = next[0] ?? value;
          onChange(Math.round(raw / 5) * 5);
        }}
        min={0}
        max={100}
        step={5}
        className="w-full"
        aria-label={label}
      />
    </div>
  );
}
