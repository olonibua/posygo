"use client";

import { WALLET_STATUSES, type WalletStatus, type WalletView } from "@/shared";
import { useState } from "react";

import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, Select } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { useAdminCountries } from "@/features/countries/admin-countries";
import { formatMoney, localeFor } from "@/lib/format";

import { WALLET_STATUS_DISPLAY } from "./finance-display";
import { FinanceTabs } from "./finance-tabs";
import { useAdjustments, useFinanceWallets } from "./use-finance";

type StatusFilter = "ALL" | WalletStatus;

export function FinanceWalletsPage() {
  const countries = useAdminCountries();
  const [countryCode, setCountryCode] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const all = useFinanceWallets({ countryCode: countryCode || undefined });
  const pending = useAdjustments("PENDING_APPROVAL");
  const wallets = all.data ?? [];
  const rows = status === "ALL" ? wallets : wallets.filter((wallet) => wallet.status === status);
  const count = (value: WalletStatus) => wallets.filter((wallet) => wallet.status === value).length;

  const columns: Column<WalletView>[] = [
    { key: "vendor", header: "Vendor", render: (wallet) => <span className="font-medium">{wallet.businessName}</span> },
    { key: "country", header: "Market", render: (wallet) => wallet.countryCode },
    { key: "status", header: "Status", render: (wallet) => <StatusPill tone={WALLET_STATUS_DISPLAY[wallet.status].tone}>{WALLET_STATUS_DISPLAY[wallet.status].label}</StatusPill> },
    { key: "balance", header: "Balance", align: "right", render: (wallet) => formatMoney(wallet.balanceMinor, wallet.currency, localeFor(wallet.countryCode)) },
    { key: "open", header: "", align: "right", render: (wallet) => <OpenLink href={`/admin/finance/wallets/${wallet.id}`} /> },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Finance" title="Vendor wallets" lead="Every vendor pays from a prepaid wallet in their market's currency. Balances only change through the ledger." />
      <FinanceTabs current="wallets" />
      <StatTileGrid>
        <StatTile tone="lime" label="Wallets" value={wallets.length} note={countryCode ? `In ${countryCode}` : "Across every market"} dots={["orange"]} />
        <StatTile tone="orange" label="Storage overdue" value={count("STORAGE_OVERDUE")} note="Couldn't pay a storage run" dots={["yellow"]} />
        <StatTile tone="pink" label="Paused" value={count("FROZEN")} note="Disputed or reversed payments" dots={["lime", "teal"]} />
        <StatTile tone="yellow" label="Adjustments waiting" value={pending.data?.length ?? 0} note="Need a second person" dots={["pink"]} />
      </StatTileGrid>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <FilterTabs
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={[{ value: "ALL", label: "All", count: wallets.length }, ...WALLET_STATUSES.map((value) => ({ value, label: WALLET_STATUS_DISPLAY[value].label, count: count(value) }))]}
        />
        <div className="w-full md:w-[260px]">
          <Field label="Market">
            {({ id }) => (
              <Select id={id} value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
                <option value="">Every market</option>
                {(countries.data ?? []).map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </div>
      <DataTable
        caption="Vendor wallets"
        columns={columns}
        rows={rows}
        rowKey={(wallet) => wallet.id}
        loading={all.isLoading}
        empty={<EmptyState title="No wallets" body="A wallet opens the first time a vendor tops up or is charged." />}
      />
    </div>
  );
}
