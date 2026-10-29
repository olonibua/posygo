"use client";

import { DELIVERY_PREFERENCE_LABELS, type OrderDetailView, type RateTag } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
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

const TAG_TONES: Record<RateTag, "lime" | "sky"> = { CHEAPEST: "lime", FASTEST: "sky" };

export function RatesPanel({ order, locale, busy, onFetch, onSelect }: RatesPanelProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const canSelect = order.actions.includes("SELECT_RATE");
  const selected = chosen ?? order.rates.find((rate) => rate.selected)?.id ?? (canSelect ? (order.rates.find((rate) => rate.preferred)?.id ?? null) : null);
  const wanted = DELIVERY_PREFERENCE_LABELS[order.deliveryPreference];
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
      <p className="mt-2 text-small">
        The seller wants <b className="font-semibold">{wanted.label.toLowerCase()}</b> delivery.
      </p>
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
                {rate.tags.length > 0 || rate.preferred ? (
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {rate.preferred ? <StatusPill tone="orange">Seller&apos;s choice</StatusPill> : null}
                    {rate.tags.map((tag) => (
                      <StatusPill key={tag} tone={TAG_TONES[tag]}>
                        {DELIVERY_PREFERENCE_LABELS[tag].label}
                      </StatusPill>
                    ))}
                  </span>
                ) : null}
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
