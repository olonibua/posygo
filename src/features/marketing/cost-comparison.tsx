"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ChoiceChip } from "@/components/ui/choice-chip";
import { Stamp } from "@/components/ui/surfaces";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";
import { BRAND } from "@/lib/brand";
import { formatMoney } from "@/lib/format";

import type { MarketCost } from "./live-countries";
import { countryPhrase } from "./markets";
import { convertMinor, COURIER_FROM_HOME, type OrderCost } from "./order-cost";
import type { VisitorCurrency } from "./visitor-currency";

const LOCALE = "en-GB";

function whole(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency, currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(amountMinor / 100);
}

function useVisitorCurrency(base: string): VisitorCurrency | null {
  const [visitor, setVisitor] = useState<VisitorCurrency | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/visitor-currency?base=${base}`, { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<VisitorCurrency | null>) : null))
      .then(setVisitor)
      .catch(() => undefined);
    return () => controller.abort();
  }, [base]);
  return visitor;
}

function inVisitorMoney(amountMinor: number, cost: OrderCost, visitor: VisitorCurrency | null): string | null {
  if (!visitor || visitor.currency === cost.currency) {
    return null;
  }
  const roundTo = visitor.rate > 50 ? 10_000 : 100;
  return whole(convertMinor(amountMinor, visitor.rate, roundTo), visitor.currency);
}

function MarketPicker({ markets, chosen, onChoose }: { markets: readonly MarketCost[]; chosen: MarketCost; onChoose: (countryCode: string) => void }) {
  if (markets.length === 1) {
    return <p className="mt-4 text-small text-ink-soft">Prices for stock kept in {countryPhrase({ name: chosen.countryName })}.</p>;
  }
  return (
    <div role="group" aria-label="Prices for stock kept in" className="mt-5 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-small text-ink-soft">Prices for stock kept in</span>
      {markets.map((market) => (
        <ChoiceChip key={market.countryCode} tone="sky" selected={market.countryCode === chosen.countryCode} onToggle={() => onChoose(market.countryCode)}>
          {market.countryName}
        </ChoiceChip>
      ))}
    </div>
  );
}

export function CostComparison({ markets }: { markets: readonly MarketCost[] }) {
  const [chosenCode, setChosenCode] = useState(markets[0]!.countryCode);
  const chosen = markets.find((market) => market.countryCode === chosenCode) ?? markets[0]!;
  const cost = chosen.cost;
  const visitor = useVisitorCurrency(cost.currency);
  const courier = visitor ? COURIER_FROM_HOME[visitor.countryCode] : undefined;
  const money = (amountMinor: number) => formatMoney(amountMinor, cost.currency, LOCALE);
  const totalLocal = inVisitorMoney(cost.totalMinor, cost, visitor);
  const cheapestStocking = cost.storage.find((row) => row.stockingMinor !== null)?.stockingMinor ?? null;

  return (
    <section id="costs" className="pt-16 sm:pt-20">
      <Stamp>What one order costs</Stamp>
      <h2 className="mt-3.5 max-w-[820px] text-[40px] font-medium leading-[42px] tracking-[-1.6px] md:text-[52px] md:leading-[54px] md:tracking-[-2px]">
        {courier ? "Stop paying courier prices for every order." : "Every order sent from inside your customer's country."}
      </h2>
      <MarketPicker markets={markets} chosen={chosen} onChoose={setChosenCode} />
      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr_1.1fr]">
        {courier ? (
          <div className="motion-rise rounded-tile bg-paper px-6 py-7 shadow-[inset_0_0_0_1.5px_var(--line)]">
            <span className="block text-stamp uppercase text-ink-faint">Sending each order from home</span>
            <p className="mt-4 text-small text-ink-faint">From</p>
            <p className="mt-1 text-[40px] font-medium leading-none tracking-[-1.4px] text-ink-soft">{whole(courier.fromMinor, courier.currency)}</p>
            <p className="mt-4 text-small text-ink-soft">For one small parcel by international courier, and your customer still waits.</p>
          </div>
        ) : null}
        <div className={`motion-rise rounded-tile bg-yellow px-6 py-7 text-cocoa ${courier ? "" : "lg:col-span-2"}`}>
          <span className="block text-stamp uppercase text-cocoa/70">With {BRAND.name}, from stock near your customer</span>
          <p className="mt-4 text-small text-cocoa/70">About</p>
          <p className="mt-1 text-[40px] font-medium leading-none tracking-[-1.4px]">{totalLocal ?? money(cost.totalMinor)}</p>
          <p className="mt-2 text-small text-cocoa/80">{totalLocal ? `about ${money(cost.totalMinor)} per order` : "per order"}, delivered in about 2 to 3 days.</p>
          <ul className="mt-5 flex flex-col gap-1.5 border-t border-cocoa/15 pt-4 text-small">
            <li className="flex justify-between gap-3">
              <span>Picking and packing</span>
              <span className="font-medium">{money(cost.packingMinor)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Postage, from</span>
              <span className="font-medium">{money(cost.postageMinor)}</span>
            </li>
          </ul>
          <p className="mt-3 text-meta text-cocoa/70">
            {money(cost.extraItemMinor)} for each extra item in the same parcel, up to {money(cost.packingCapMinor)} for packing. Postage shown is {cost.postageService}.
          </p>
        </div>
        <div className="motion-rise rounded-tile bg-paper px-6 py-7 shadow-[inset_0_0_0_1.5px_var(--line)]">
          <span className="block text-stamp uppercase text-ink-faint">Storage</span>
          <ul className="mt-4 flex flex-col gap-2 text-small">
            {cost.storage.map((row) => (
              <li key={row.tier} className="flex justify-between gap-3">
                <span>
                  {STORAGE_TIER_LABELS[row.tier].label} box
                  <span className="block text-meta text-ink-faint">{STORAGE_TIER_LABELS[row.tier].hint}</span>
                </span>
                <span className="shrink-0 font-medium">{money(row.monthlyMinor)}/month</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-1 border-t border-line pt-3 text-meta text-ink-soft">
            {cheapestStocking !== null ? (
              <p>
                Stocking fee when a box arrives, from {money(cheapestStocking)}
                {cost.firstShipmentFree ? ". Free on your first shipment." : "."}
              </p>
            ) : null}
            <p>You stop paying for a box as soon as it&apos;s empty.</p>
          </div>
          <Link href="/pricing" className="mt-4 inline-block text-small font-medium">
            See full pricing →
          </Link>
        </div>
      </div>
      <p className="mt-4 max-w-[820px] text-meta text-ink-faint">
        Courier prices change often. Postage depends on each parcel&apos;s size and weight, and you see the exact price before an order is sent.
        {totalLocal ? " Conversions use today's exchange rate." : ""}
      </p>
    </section>
  );
}
