"use client";

import type { DeliverySpeed, QuoteView } from "@/shared";

import { RadioDot } from "@/components/ui/form-controls";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", strong ? "text-h3" : "text-small text-ink-soft")}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function DeliveryChoice({ quote, speed, locale, onChange }: { quote: QuoteView; speed: DeliverySpeed; locale: string; onChange: (speed: DeliverySpeed) => void }) {
  const money = (amount: number) => formatMoney(amount, quote.currency, locale);
  const chosen = quote.options.find((option) => option.speed === speed) ?? quote.options[0];
  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-small font-medium">Delivery</legend>
        {quote.options.map((option) => {
          const checked = option.speed === chosen?.speed;
          return (
            <label
              key={option.speed}
              className={cn(
                "motion-press flex cursor-pointer items-center gap-3 rounded-card border-[1.5px] px-4 py-3 transition-colors duration-200",
                checked ? "border-cocoa bg-yellow/30" : "border-line-strong bg-paper hover:border-ink-faint",
              )}
            >
              <input type="radio" name="delivery" value={option.speed} checked={checked} onChange={() => onChange(option.speed)} className="sr-only" />
              <RadioDot checked={checked} />
              <span className="flex-1">
                <span className="block font-medium">{option.label}</span>
                <span className="text-meta font-normal text-ink-faint">{option.window}</span>
              </span>
              <span className="font-medium tabular-nums">{money(option.priceMinor)}</span>
            </label>
          );
        })}
      </fieldset>
      {chosen ? (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <Row label="Items" value={money(quote.goodsMinor)} />
          {quote.discountMinor > 0 ? <Row label="Discount" value={`−${money(quote.discountMinor)}`} /> : null}
          <Row label="Delivery" value={money(chosen.priceMinor)} />
          {chosen.taxMinor > 0 ? <Row label={quote.taxIncluded ? `${quote.taxLabel} included` : quote.taxLabel} value={money(chosen.taxMinor)} /> : null}
          <Row label="Total" value={money(chosen.totalMinor)} strong />
        </div>
      ) : null}
    </div>
  );
}
