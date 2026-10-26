"use client";

import { formatMoney } from "@/lib/format";

import { basket, type BasketLine } from "../basket-store";

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (next: number) => void }) {
  const control = "motion-press grid h-9 w-9 place-items-center rounded-full border-[1.5px] border-line-strong bg-paper text-body hover:border-ink";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center gap-2">
      <button type="button" className={control} aria-label="One fewer" onClick={() => onChange(value - 1)}>
        −
      </button>
      <span key={value} aria-live="polite" className="motion-pop w-6 text-center tabular-nums">
        {value}
      </span>
      <button type="button" className={control} aria-label="One more" onClick={() => onChange(value + 1)} disabled={value >= 99}>
        +
      </button>
    </div>
  );
}

export function BasketLines({ slug, lines, currency, locale }: { slug: string; lines: BasketLine[]; currency: string; locale: string }) {
  return (
    <ul className="stagger flex flex-col divide-y divide-line">
      {lines.map((line) => (
        <li key={line.productId} className="motion-rise flex flex-wrap items-center justify-between gap-3 py-3">
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{line.name}</span>
            <span className="text-meta font-normal text-ink-faint tabular-nums">{formatMoney(line.priceMinor, currency, locale)} each</span>
          </span>
          <Stepper label={`Quantity of ${line.name}`} value={line.quantity} onChange={(next) => basket.setQuantity(slug, line.productId, next)} />
          <span className="w-24 text-right font-medium tabular-nums">{formatMoney(line.priceMinor * line.quantity, currency, locale)}</span>
        </li>
      ))}
    </ul>
  );
}
