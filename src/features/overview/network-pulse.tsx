"use client";

import type { DashboardView, MoneyTotal, PublicCountry } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Select } from "@/components/ui/form-controls";
import { SkeletonLines } from "@/components/ui/skeleton";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

function totals(entries: MoneyTotal[], country: string | null): string {
  return entries.length === 0 ? "—" : entries.map((entry) => formatMoney(entry.amountMinor, entry.currency, localeFor(country))).join(" · ");
}

export function NetworkPulse() {
  const user = useCurrentUser();
  const [country, setCountry] = useState(user.countryCode ?? "");
  const countries = useQuery({ queryKey: ["countries", "live"], queryFn: () => apiRequest<PublicCountry[]>("/v1/countries", { authenticated: false }), enabled: !user.countryCode });
  const dashboard = useQuery({
    queryKey: ["admin", "dashboard", country],
    queryFn: () => apiRequest<DashboardView>(`/v1/admin/dashboard${country ? `?country=${country}` : ""}`),
    refetchInterval: 60_000,
  });
  const data = dashboard.data;
  return (
    <div className="flex flex-col gap-5">
      {!user.countryCode ? (
        <div className="max-w-[260px]">
          <Select aria-label="Market" value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="">Every market</option>
            {(countries.data ?? []).map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      <Paper className="motion-rise px-6 py-5">
        <Stamp>Needs someone</Stamp>
        {!data ? (
          <div className="mt-3">
            <SkeletonLines lines={3} />
          </div>
        ) : data.attention.length === 0 ? (
          <p className="mt-3 text-small text-ink-soft">Nothing is waiting on you right now.</p>
        ) : (
          <ul className="stagger mt-3 flex flex-col divide-y divide-line">
            {data.attention.map((item) => (
              <li key={item.key} className="motion-rise">
                <Link href={item.href} className="flex items-center justify-between gap-3 py-2.5 text-small no-underline hover:underline">
                  <span>{item.label}</span>
                  <span className="grid h-7 min-w-7 place-items-center rounded-full bg-yellow px-2 font-semibold tabular-nums text-cocoa">{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Paper>
      {data?.activity ? (
        <section aria-labelledby="pulse-heading" className="flex flex-col gap-3">
          <h2 id="pulse-heading" className="text-h3">
            Last 30 days
          </h2>
          <StatTileGrid>
            <StatTile label="New vendors" value={String(data.activity.newVendors)} tone="sky" />
            <StatTile label="Orders placed" value={String(data.activity.ordersCreated)} tone="yellow" />
            <StatTile label="Parcels sent" value={String(data.activity.ordersShipped)} tone="lime" />
            <StatTile label="Stock shipments received" value={String(data.activity.stockReceived)} tone="pink" />
          </StatTileGrid>
          <StatTileGrid>
            <StatTile label="Fees charged" value={totals(data.activity.feesCharged, data.countryCode)} tone="orange" />
            <StatTile label="Store sales" value={totals(data.activity.storeSales, data.countryCode)} tone="teal" />
            <StatTile label="Held in vendor wallets now" value={totals(data.activity.walletBalances, data.countryCode)} tone="blue" />
          </StatTileGrid>
        </section>
      ) : null}
    </div>
  );
}
