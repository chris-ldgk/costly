import { Slider } from "@costly/components";

export const PARTNER_SHARE_STEP = 5;

export function snapPartnerSharePercent(value: number): number {
  return Math.min(
    100,
    Math.max(0, Math.round(value / PARTNER_SHARE_STEP) * PARTNER_SHARE_STEP),
  );
}

type PartnerShareSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function PartnerShareSlider({ value, onChange }: PartnerShareSliderProps) {
  const snapped = snapPartnerSharePercent(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption-bold font-caption-bold text-default-font">
          Partner&apos;s share (%)
        </span>
        <span className="text-caption-bold font-caption-bold text-default-font tabular-nums">
          {snapped}%
        </span>
      </div>
      <Slider
        min={0}
        max={100}
        step={PARTNER_SHARE_STEP}
        value={[snapped]}
        onValueChange={(values) => onChange(values[0] ?? 0)}
        aria-label="Partner's share percent"
      />
      <span className="text-caption font-caption text-subtext-color">
        How much of this cost is your partner&apos;s share
      </span>
    </div>
  );
}
