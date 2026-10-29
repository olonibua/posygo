"use client";

import { hasPermission, type InboundSummaryView, OPEN_INBOUND_STATUSES, type VendorCountryFiguresView, type VendorCountryView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonLines } from "@/components/ui/skeleton";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";
import { formatMoney, greetingFor, localeFor } from "@/lib/format";

import { countryFlag } from "@/features/seller-countries/country-flag";
import { useCountryScope, useSelectedCountry, VENDOR_COUNTRIES_KEY } from "@/features/seller-countries/selected-country";

import { StepHint } from "@/components/ui/step-hint";

import { NextStepCard } from "./next-step-card";

const OVERVIEW_HINTS = {
  firstShipment: {
    id: "overview-first-shipment",
    title: "Start here",
    text: "Send us your stock: choose a hub, list the products and boxes, then post them. Once the hub checks them in, you can take orders.",
  },
  wallet: {
    id: "overview-wallet",
    title: "Your wallet",
    text: "Receiving, storage and delivery fees are paid from your wallet, in this country's currency. Keep it topped up so your orders keep moving.",
  },
};

export function VendorOverview() {
  const user = useCurrentUser();
  const { countries, country, allCountries, select } = useSelectedCountry();
  const locale = localeFor(user.countryCode);
  const canSendStock = user.vendorStatus === "ACTIVE" && hasPermission(user.role, "vendor.stock.manage");
  const figures = useQuery({ queryKey: [...VENDOR_COUNTRIES_KEY, "figures"], queryFn: () => apiRequest<VendorCountryFiguresView[]>("/v1/vendor/countries/figures") });
  const awaiting = useAwaitingShipments(hasPermission(user.role, "vendor.stock.read") && !allCountries);
  const current = figures.data?.find((entry) => entry.code === country?.code);
  const lead = allCountries
    ? "Each country has its own stock, orders and wallet. Choose one to see more."
    : country
      ? `Your stock in ${country.name}. Money here is in ${country.currency}.`
      : "Your stock, orders and wallet at a glance.";

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Overview"
        title={`${greetingFor(new Date())}, ${user.businessName ?? "there"}`}
        lead={lead}
        action={
          canSendStock ? (
            <StepHint {...OVERVIEW_HINTS.firstShipment}>
              <ButtonLink href="/inbound/new" variant="yellow" size="lg">
                New inbound shipment →
              </ButtonLink>
            </StepHint>
          ) : (
            <Button variant="yellow" size="lg" disabled>
              New inbound shipment →
            </Button>
          )
        }
      />
      {allCountries || !country ? null : (
        <StatTileGrid>
          <StatTile tone="sky" label="Awaiting receipt" value={awaiting} note={awaiting === 0 ? "No shipments on the way" : "Shipments on the way or at the dock"} dots={["yellow", "pink"]} />
          <StatTile tone="lime" label="Units in storage" value={figure(current?.unitsInStorage, locale)} note="Counted on arrival" dots={["orange"]} />
          <StatTile tone="yellow" label="Orders today" value={figure(current?.ordersToday, locale)} note={`In ${country.name}`} dots={["teal", "orange"]} />
          <StepHint {...OVERVIEW_HINTS.wallet} enabled={user.vendorStatus === "ACTIVE"} className="flex">
            <StatTile tone="pink" label="Wallet balance" value={money(current?.balanceMinor, country.currency, locale)} note={`Held in ${country.currency}`} dots={["lime"]} />
          </StepHint>
        </StatTileGrid>
      )}

      <NextStepCard vendorActive={user.vendorStatus === "ACTIVE"} />

      <section aria-labelledby="countries-heading" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="countries-heading" className="text-h3">
            {allCountries ? "All countries" : "Your countries"}
          </h2>
          {hasPermission(user.role, "vendor.markets.manage") ? (
            <Link href="/settings/markets" className="text-small">
              Add a country
            </Link>
          ) : null}
        </div>
        {figures.isLoading ? (
          <SkeletonLines lines={2} />
        ) : (
          <ul className="stagger grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {countries.map((entry) => (
              <li key={entry.code} className="motion-rise">
                <CountryCard
                  country={entry}
                  figures={figures.data?.find((row) => row.code === entry.code)}
                  selected={!allCountries && entry.code === country?.code}
                  locale={locale}
                  onSelect={() => select(entry.code)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CountryCard({ country, figures, selected, locale, onSelect }: { country: VendorCountryView; figures?: VendorCountryFiguresView; selected: boolean; locale: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Show ${country.name}`}
      onClick={onSelect}
      className={cn("motion-lift flex h-full w-full flex-col gap-3 rounded-card border-[1.5px] bg-paper px-5 py-4 text-left hover:border-ink", selected ? "border-cocoa" : "border-line")}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-[17px] font-medium">
          <span aria-hidden>{countryFlag(country.code)}</span> {country.name}
        </span>
        <Chip tone={country.home ? "lime" : "sky"} size="sm">
          {country.home ? `Home · ${country.currency}` : country.currency}
        </Chip>
      </span>
      <dl className="grid grid-cols-3 gap-2 text-small">
        <Figure label="Wallet" value={money(figures?.balanceMinor, country.currency, locale)} />
        <Figure label="In storage" value={figure(figures?.unitsInStorage, locale)} />
        <Figure label="Orders today" value={figure(figures?.ordersToday, locale)} />
      </dl>
    </button>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-meta text-ink-faint">{label}</dt>
      <dd className="truncate font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function figure(value: number | null | undefined, locale: string): string {
  return value === null || value === undefined ? "—" : value.toLocaleString(locale);
}

function money(minor: number | null | undefined, currency: string, locale: string): string {
  return minor === null || minor === undefined ? "—" : formatMoney(minor, currency, locale);
}

function useAwaitingShipments(enabled: boolean): number {
  const { code, ready, path } = useCountryScope();
  const inbound = useQuery({ queryKey: ["vendor", "inbound", "list", code], queryFn: () => apiRequest<InboundSummaryView[]>(path("/v1/vendor/inbound")), enabled: enabled && ready });
  return (inbound.data ?? []).filter((row) => OPEN_INBOUND_STATUSES.includes(row.status)).length;
}
