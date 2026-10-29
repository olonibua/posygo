"use client";

import {
  DELIVERY_PREFERENCE_LABELS,
  DELIVERY_PREFERENCES,
  type DeliveryInput,
  type DeliveryPreference,
  deliveryTimeLabel,
  rankRates,
  type RateTag,
  serviceKey,
  type ShippingEstimateRateView,
  type ShippingEstimateView,
} from "@/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { StatusPill } from "@/components/ui/chip";
import { Field, Select } from "@/components/ui/form-controls";
import { errorMessage } from "@/features/receiving/api-errors";
import { useCountryScope } from "@/features/seller-countries/selected-country";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

const SETTLE_MS = 700;
const SHOWN_RATES = 4;
const SERVICE_PREFIX = "service:";
const TAG_TONES: Record<RateTag, "lime" | "sky"> = { CHEAPEST: "lime", FASTEST: "sky" };

export interface DeliveryChoice {
  deliveryPreference: DeliveryPreference;
  preferredService: string | undefined;
}

function readyToPrice(delivery: Pick<DeliveryInput, "recipient" | "lines">): boolean {
  const { recipient, lines } = delivery;
  return Boolean(recipient.name && recipient.line1 && recipient.city && recipient.postalCode) && lines.some((line) => line.quantity > 0);
}

function useSettled<T>(value: T): T {
  const [settled, setSettled] = useState(value);
  const key = JSON.stringify(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(JSON.parse(key) as T), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [key]);
  return settled;
}

function keyOf(rate: ShippingEstimateRateView): string {
  return serviceKey(rate.carrier, rate.service);
}

function useRanked(rates: readonly ShippingEstimateRateView[], choice: DeliveryChoice) {
  return useMemo(() => {
    const ranking = rankRates(rates, choice.deliveryPreference, choice.preferredService ?? null);
    const byId = new Map(rates.map((rate) => [rate.id, rate]));
    return { preferredId: ranking.preferredId, rates: ranking.order.map((id) => byId.get(id)!) };
  }, [rates, choice.deliveryPreference, choice.preferredService]);
}

export function ShippingEstimate({ delivery, locale, onChoose }: { delivery: DeliveryInput; locale: string; onChoose: (choice: DeliveryChoice) => void }) {
  const { path, ready, code } = useCountryScope();
  const body = useSettled({ recipient: delivery.recipient, lines: delivery.lines.filter((line) => line.quantity > 0) });
  const enabled = ready && readyToPrice(body);
  const estimate = useQuery({
    queryKey: ["vendor", "orders", "shipping-estimate", code, body],
    queryFn: () => apiRequest<ShippingEstimateView>(path("/v1/vendor/orders/shipping-estimate"), { method: "POST", body, quiet: true }),
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });
  const choice: DeliveryChoice = { deliveryPreference: delivery.deliveryPreference ?? "CHEAPEST", preferredService: delivery.preferredService };
  const rates = enabled ? (estimate.data?.rates ?? []) : [];
  const ranked = useRanked(rates, choice);

  return (
    <section aria-label="Delivery" className="flex flex-col gap-4 rounded-card bg-paper-sunk px-4 py-4">
      <DeliveryPicker choice={choice} rates={rates} currency={estimate.data?.currency} locale={locale} onChoose={onChoose} />
      <div className="flex flex-col gap-2">
        <p className="text-small font-medium">Estimated delivery</p>
        {!enabled ? <p className="text-small text-ink-soft">Add the address and products to see the services and prices.</p> : null}
        {enabled && estimate.isLoading ? <p className="text-small text-ink-soft">Getting prices from couriers…</p> : null}
        {enabled && estimate.isError ? <p className="text-small text-ink-soft">{errorMessage(estimate.error)}</p> : null}
        {enabled && estimate.data ? <EstimateRates estimate={estimate.data} rates={ranked.rates} preferredId={ranked.preferredId} locale={locale} onPick={(rate) => onChoose({ ...choice, preferredService: keyOf(rate) })} /> : null}
      </div>
    </section>
  );
}

interface DeliveryPickerProps {
  choice: DeliveryChoice;
  rates: readonly ShippingEstimateRateView[];
  currency: string | undefined;
  locale: string;
  onChoose: (choice: DeliveryChoice) => void;
}

function DeliveryPicker({ choice, rates, currency, locale, onChoose }: DeliveryPickerProps) {
  const offered = new Set(rates.map(keyOf));
  const value = choice.preferredService ? `${SERVICE_PREFIX}${choice.preferredService}` : choice.deliveryPreference;
  const hint = choice.preferredService
    ? `The hub books this service. If it isn't offered for the packed parcel, they send it ${DELIVERY_PREFERENCE_LABELS[choice.deliveryPreference].label.toLowerCase()}.`
    : DELIVERY_PREFERENCE_LABELS[choice.deliveryPreference].hint;
  const pick = (next: string) =>
    next.startsWith(SERVICE_PREFIX)
      ? onChoose({ ...choice, preferredService: next.slice(SERVICE_PREFIX.length) })
      : onChoose({ deliveryPreference: next as DeliveryPreference, preferredService: undefined });

  return (
    <Field label="Delivery" hint={hint}>
      {({ id, describedBy }) => (
        <Select id={id} aria-describedby={describedBy} value={value} onChange={(event) => pick(event.target.value)}>
          <optgroup label="Let the hub pick">
            {DELIVERY_PREFERENCES.map((preference) => (
              <option key={preference} value={preference}>
                {DELIVERY_PREFERENCE_LABELS[preference].label} available
              </option>
            ))}
          </optgroup>
          {rates.length > 0 || choice.preferredService ? (
            <optgroup label="Choose a service">
              {choice.preferredService && !offered.has(choice.preferredService) ? <option value={value}>{choice.preferredService}</option> : null}
              {rates.map((rate) => (
                <option key={rate.id} value={`${SERVICE_PREFIX}${keyOf(rate)}`}>
                  {`${rate.carrier} ${rate.service}${currency ? ` · ${formatMoney(rate.chargeMinor, currency, locale)}` : ""}`}
                </option>
              ))}
            </optgroup>
          ) : null}
        </Select>
      )}
    </Field>
  );
}

interface EstimateRatesProps {
  estimate: ShippingEstimateView;
  rates: readonly ShippingEstimateRateView[];
  preferredId: string | null;
  locale: string;
  onPick: (rate: ShippingEstimateRateView) => void;
}

function EstimateRates({ estimate, rates, preferredId, locale, onPick }: EstimateRatesProps) {
  const [expanded, setExpanded] = useState(false);
  if (rates.length === 0) {
    return <p className="text-small text-ink-soft">No courier offered a price for this address yet.</p>;
  }
  const shown = expanded ? rates : rates.slice(0, SHOWN_RATES);
  return (
    <>
      <ul className="flex flex-col gap-1.5">
        {shown.map((rate) => {
          const chosen = rate.id === preferredId;
          const time = deliveryTimeLabel(rate.estimatedDays, rate.service);
          return (
            <li key={rate.id}>
              <button
                type="button"
                aria-pressed={chosen}
                onClick={() => onPick(rate)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-[12px] border-[1.5px] px-3.5 py-2.5 text-left transition-colors duration-200",
                  chosen ? "border-ink bg-white" : "border-transparent hover:border-line-strong hover:bg-white/60",
                )}
              >
                <span className="min-w-0">
                  <span className="block text-small font-medium">
                    {rate.carrier} {rate.service}
                  </span>
                  {time ? <span className="text-meta text-ink-soft">{time}</span> : null}
                  {chosen || rate.tags.length > 0 ? (
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {chosen ? <StatusPill tone="orange">Your choice</StatusPill> : null}
                      {rate.tags.map((tag) => (
                        <StatusPill key={tag} tone={TAG_TONES[tag]}>
                          {DELIVERY_PREFERENCE_LABELS[tag].label}
                        </StatusPill>
                      ))}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{formatMoney(rate.chargeMinor, estimate.currency, locale)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {rates.length > SHOWN_RATES ? (
        <button type="button" onClick={() => setExpanded(!expanded)} className="self-start text-[13px] font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
          {expanded ? "Show fewer" : `Show all ${rates.length} services`}
        </button>
      ) : null}
      <p className="text-meta text-ink-soft">
        {`Estimated for a ${estimate.boxLabel.toLowerCase()}. The final price is set when the hub weighs the packed parcel, and is taken from your wallet then.`}
      </p>
      {estimate.productsWithoutSize.length > 0 ? (
        <p className="text-meta">
          For a closer estimate, add the size of {estimate.productsWithoutSize.join(", ")} on{" "}
          <Link href="/products" className="font-medium">
            Products
          </Link>
          .
        </p>
      ) : null}
    </>
  );
}
