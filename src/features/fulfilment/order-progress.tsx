import type { OrderStatus } from "@/shared";

import { CheckMark } from "@/components/ui/check-mark";
import { cn } from "@/lib/cn";

const STEPS = ["Check items", "Pack", "Shipping", "Hand over", "On its way", "Delivered"] as const;

const STEP_OF: Partial<Record<OrderStatus, number>> = {
  PENDING_PACKING: 0,
  PACKING_COMPLETED: 2,
  AWAITING_SHIPPING_SELECTION: 2,
  AWAITING_WALLET_FUNDING: 2,
  SHIPPING_PAID: 2,
  LABEL_PURCHASED: 3,
  HANDED_OFF: 4,
  IN_TRANSIT: 4,
  EXCEPTION: 4,
  DELIVERED: 6,
};

export function OrderProgress({ status, allScanned }: { status: OrderStatus; allScanned: boolean }) {
  const base = STEP_OF[status];
  if (base === undefined) {
    return null;
  }
  const current = base === 0 && allScanned ? 1 : base;
  return (
    <ol aria-label="Progress" className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-6">
      {STEPS.map((step, index) => {
        const done = index < current;
        const now = index === current;
        return (
          <li key={step} aria-current={now ? "step" : undefined} className="flex flex-col gap-1.5">
            <span className={cn("h-1.5 rounded-full transition-colors duration-300", done ? "bg-blue" : now ? "bg-ink" : "bg-line")} />
            <span className={cn("flex items-center gap-1 text-[13px]", now ? "font-semibold text-ink" : done ? "text-ink-soft" : "text-ink-faint")}>
              {done ? <CheckMark className="h-3 w-3" /> : null}
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
