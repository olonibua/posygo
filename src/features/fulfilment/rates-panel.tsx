"use client";

import { DELIVERY_PREFERENCE_LABELS, deliveryTimeLabel, type OrderDetailView, type RateTag, serviceKey } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { RadioDot } from "@/components/ui/form-controls";
import { formatSize, formatWeight } from "@/features/orders/order-display";
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
  const missingChoice = Boolean(order.preferredService) && order.rates.length > 0 && !order.rates.some((rate) => serviceKey(rate.carrier, rate.service) === order.preferredService);
  return (
    <Paper className="px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <Stamp>Choose the courier</Stamp>
        {order.actions.includes("FETCH_RATES") ? (
          <Button variant="ghost" loading={busy && !chosen} onClick={onFetch}>
            {order.rates.length > 0 ? "Refresh prices" : "Get courier prices"}
          </Button>
        ) : null}
      </div>
      <p className="mt-2 text-small">
        {missingChoice ? (
          <>
            The seller chose <b className="font-semibold">{order.preferredService}</b>, but it isn&apos;t offered for this parcel. The {wanted.label.toLowerCase()} option is picked instead.
          </>
        ) : order.preferredService ? (
          <>
            The seller chose <b className="font-semibold">{order.preferredService}</b>.
          </>
        ) : (
          <>
            The seller wants <b className="font-semibold">{wanted.label.toLowerCase()}</b> delivery.
          </>
        )}
      </p>
      {order.pack && order.rates.length > 0 ? (
        <p className="mt-1 text-meta text-ink-faint">
          Prices for a {formatSize(order.pack.lengthMm, order.pack.widthMm, order.pack.heightMm)} parcel weighing {formatWeight(order.pack.weightGrams)}, from the couriers connected for this country.
        </p>
      ) : null}
      {order.rates.length === 0 ? (
        <p className="mt-3 text-small text-ink-soft">Get courier prices for the packed parcel. The seller pays the courier&rsquo;s price plus our handling from their wallet when you buy the label.</p>
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
                <DeliveryTime estimatedDays={rate.estimatedDays} service={rate.service} />
                {rate.tags.length > 0 || rate.preferred ? (
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {rate.preferred ? <StatusPill tone="orange">{missingChoice ? "Picked for you" : "Seller's choice"}</StatusPill> : null}
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
          {order.charges ? "Charge the seller and buy the label" : "Buy the label"}
        </Button>
      ) : null}
    </Paper>
  );
}

function DeliveryTime({ estimatedDays, service }: { estimatedDays: number | null; service: string }) {
  const label = deliveryTimeLabel(estimatedDays, service);
  return label ? <span className="text-meta text-ink-soft">{label}</span> : null;
}
