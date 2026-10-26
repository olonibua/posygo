"use client";

import { COUNTRY_STATUSES, type CountryStatus, hasPermission } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate } from "@/lib/format";

import { type AdminCountry, COUNTRY_STATUS_DISPLAY, describeTax } from "./country-display";
import { PartnerProgrammeForm } from "./partner-programme-form";

type StatusFilter = "ALL" | CountryStatus;

export function useAdminCountries(enabled = true) {
  return useQuery({ queryKey: ["admin", "countries"], queryFn: () => apiRequest<AdminCountry[]>("/v1/admin/countries"), enabled });
}

export function CountriesSummary() {
  const countries = useAdminCountries();
  const count = (status: CountryStatus) => countries.data?.filter((country) => country.status === status).length ?? 0;
  return (
    <StatTileGrid>
      <StatTile tone="lime" label="Live markets" value={count("LIVE")} note="Accepting vendors" dots={["orange"]} />
      <StatTile tone="sky" label="Onboarding" value={count("ONBOARDING")} note="Partner being verified" dots={["yellow", "pink"]} />
      <StatTile tone="yellow" label="Prospective" value={count("PROSPECTIVE")} note="Researching" dots={["teal"]} />
      <StatTile tone="pink" label="Suspended" value={count("SUSPENDED")} note="New inbound paused" dots={["lime", "orange"]} />
    </StatTileGrid>
  );
}

export function AdminCountries() {
  const user = useCurrentUser();
  const countries = useAdminCountries();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [selected, setSelected] = useState<string | null>(null);
  const all = countries.data ?? [];
  const rows = filter === "ALL" ? all : all.filter((country) => country.status === filter);
  const selectedCountry = all.find((country) => country.code === selected);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Countries"
        title="Markets"
        lead="Every country is a configuration: currency, tax, address rules, identity checks and the partner programme. Going live needs at least one approved fulfilment hub."
      />
      <CountriesSummary />
      <div className="flex flex-col gap-3">
        <FilterTabs
          label="Filter by status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ALL", label: "All", count: all.length },
            ...COUNTRY_STATUSES.map((status) => ({ value: status, label: COUNTRY_STATUS_DISPLAY[status].label, count: all.filter((country) => country.status === status).length })),
          ]}
        />
        <DataTable
          caption="Countries on the network"
          columns={[
            ...COLUMNS,
            {
              key: "partners",
              header: "",
              align: "right",
              render: (row) => (
                <Button variant="ghost" onClick={() => setSelected(row.code)}>
                  Partner settings
                </Button>
              ),
            },
          ]}
          rows={rows}
          rowKey={(row) => row.code}
          empty={countries.isLoading ? "Loading countries…" : <EmptyState title="No countries match" body="Try another status filter." />}
        />
      </div>
      {selectedCountry ? <PartnerProgrammeForm key={selectedCountry.code} country={selectedCountry} editable={hasPermission(user.role, "countries.manage")} /> : null}
    </div>
  );
}

const COLUMNS: readonly Column<AdminCountry>[] = [
  { key: "code", header: "Code", render: (row) => <span className="font-mono text-[15px] font-medium">{row.code}</span> },
  { key: "name", header: "Country", render: (row) => row.name },
  { key: "currency", header: "Currency", render: (row) => row.currency },
  { key: "tax", header: "Tax", render: (row) => <span className="text-ink-soft">{describeTax(row.config.tax)}</span> },
  { key: "status", header: "Status", render: (row) => <StatusPill tone={COUNTRY_STATUS_DISPLAY[row.status].tone}>{COUNTRY_STATUS_DISPLAY[row.status].label}</StatusPill> },
  { key: "updated", header: "Updated", align: "right", render: (row) => <span className="text-ink-soft">{formatDate(row.updatedAt, "en-GB")}</span> },
];
