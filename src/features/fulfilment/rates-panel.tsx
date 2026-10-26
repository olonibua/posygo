"use client";

import type { OrderDetailView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { RadioDot } from "@/components/ui/form-controls";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

interface RatesPanelProps {
  order: OrderDetailView;
  locale: string;
  busy: boolean;
  onFetch: () => void;
  onSelect: (rateId: string) => void;
}

export function RatesPanel({ order, locale, busy, onFetch, onSelect }: RatesPanelProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const canSelect = order.actions.includes("SELECT_RATE");
  const selected = chosen ?? order.rates.find((rate) => rate.selected)?.id ?? null;
  return (
    <Paper className="px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <Stamp>Shipping</Stamp>
        {order.actions.includes("FETCH_RATES") ? (
          <Button variant="ghost" loading={busy && !chosen} onClick={onFetch}>
            {order.rates.length > 0 ? "Refresh rates" : "Get rates"}
          </Button>
        ) : null}
      </div>
      {order.rates.length === 0 ? (
        <p className="mt-3 text-small text-ink-soft">Get rates for the packed parcel. The vendor pays the carrier&rsquo;s price plus our handling, taken from their wallet when you buy the label.</p>
      ) : (
        <div role="radiogroup" aria-label="Shipping options" className="mt-4 flex flex-col gap-2">
          {order.rates.map((rate) => (
            <button
              key={rate.id}
              type="button"
              role="radio"
              aria-checked={selected === rate.id}
              disabled={!canSelect}
              onClick={() => setChosen(rate.id)}
              className={cn(
                "motion-press flex items-center justify-between gap-4 rounded-card border-[1.5px] px-4 py-3 text-left",
                selected === rate.id ? "border-ink bg-yellow" : "border-line-strong bg-paper hover:border-ink",
              )}
            >
              <RadioDot checked={selected === rate.id} />
              <span className="mr-auto">
                <span className="block font-medium">
                  {rate.carrier} {rate.service}
                </span>
                <span className="text-meta text-ink-soft">{rate.estimatedDays ? `About ${rate.estimatedDays} ${rate.estimatedDays === 1 ? "day" : "days"}` : "Delivery time not given"}</span>
              </span>
              {rate.chargeMinor === null ? null : <span className="font-semibold tabular-nums">{formatMoney(rate.chargeMinor, rate.currency, locale)}</span>}
            </button>
          ))}
        </div>
      )}
      {canSelect && order.rates.length > 0 ? (
        <Button variant="yellow" className="mt-4 w-full" loading={busy && Boolean(chosen)} disabled={!selected} onClick={() => selected && onSelect(selected)}>
          {order.charges ? "Charge the vendor and buy the label" : "Buy the label"}
        </Button>
      ) : null}
    </Paper>
  );
}
