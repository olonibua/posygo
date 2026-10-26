import { cn } from "@/lib/cn";

export function CheckMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={cn("shrink-0", className)} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 6.5 12 13 4.5" strokeDasharray={16} className="[animation:check-draw_var(--dur)_var(--ease-out)_both]" />
    </svg>
  );
}
