import type { TaxThresholdView } from "@/shared";

import { Paper } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";
import { formatMoney, localeFor } from "@/lib/format";

const WARN_SHARE = 0.75;

export function ThresholdCard({ threshold }: { threshold: TaxThresholdView }) {
  const share = threshold.limitMinor > 0 ? threshold.last12MonthsMinor / threshold.limitMinor : 0;
  const money = (minor: number) => formatMoney(minor, threshold.currency, localeFor(threshold.countryCode));
  const reached = share >= 1;
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex items-baseline justify-between gap-3">
        <b className="text-small font-semibold">{threshold.label}</b>
        <a href={threshold.guidanceUrl} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
          Guidance
        </a>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[24px] font-semibold tabular-nums tracking-[-0.5px]">{money(threshold.last12MonthsMinor)}</span>
        <span className="text-small text-ink-soft">of {money(threshold.limitMinor)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-paper-sunk" role="meter" aria-label={threshold.label} aria-valuemin={0} aria-valuemax={threshold.limitMinor} aria-valuenow={threshold.last12MonthsMinor}>
        <div className={cn("h-full rounded-full transition-[width] duration-500", reached ? "bg-magenta-deep" : share >= WARN_SHARE ? "bg-orange" : "bg-lime")} style={{ width: `${Math.min(100, share * 100)}%` }} />
      </div>
      <p className="text-[13px] text-ink-faint">{reached ? "Over the limit. Register now." : "Fees charged in the last 12 months."}</p>
    </Paper>
  );
}
