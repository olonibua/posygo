import { cn } from "@/lib/cn";

export function SegmentedProgress({ total, current, label }: { total: number; current: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1} className="flex gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className="h-1.5 flex-1 overflow-hidden rounded-[6px] bg-line">
          <span className={cn("block h-full origin-left rounded-[6px] bg-orange transition-[scale] duration-500 ease-[var(--ease-out)]", index <= current ? "scale-x-100" : "scale-x-0")} />
        </span>
      ))}
    </div>
  );
}

export function ProgressBar({ value, max, label, tone = "bg-lime" }: { value: number; max: number; label: string; tone?: string }) {
  const fraction = max === 0 ? 0 : Math.min(1, value / max);
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-2 overflow-hidden rounded-full bg-line">
      <span className={cn("block h-full origin-left rounded-full transition-[scale] duration-700 ease-[var(--ease-out)]", tone)} style={{ scale: `${fraction} 1` }} />
    </div>
  );
}
