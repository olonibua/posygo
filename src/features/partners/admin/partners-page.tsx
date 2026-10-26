"use client";

import { hasPermission, type PartnerStatus, type PartnerSummaryView } from "@/shared";
import { useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { countryName } from "@/features/onboarding/display";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate } from "@/lib/format";

import { PARTNER_STATUS_DISPLAY } from "../partner-display";
import { usePartnerList } from "../use-partners";

type Filter = "ALL" | PartnerStatus;

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "VERIFYING", label: "Verifying" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "ACTIVE", label: "Approved" },
  { value: "SUSPENDED", label: "Paused" },
  { value: "OFFBOARDING", label: "Closing" },
  { value: "REJECTED", label: "Not approved" },
];

const COLUMNS: readonly Column<PartnerSummaryView>[] = [
  {
    key: "partner",
    header: "Partner",
    render: (row) => (
      <span>
        <span className="block font-medium">
          {row.legalName}
          {row.founding ? <span className="ml-2 text-meta text-ink-faint">Founding</span> : null}
        </span>
        <span className="font-mono text-meta text-ink-faint">{row.reference}</span>
      </span>
    ),
  },
  { key: "where", header: "Where", render: (row) => `${row.city ?? "—"}, ${countryName(row.countryCode)}` },
  { key: "hub", header: "Hub", render: (row) => (row.warehouses.length > 0 ? row.warehouses.map((warehouse) => warehouse.code).join(", ") : <span className="text-ink-faint">None yet</span>) },
  { key: "tier", header: "Tier", render: (row) => (row.status === "ACTIVE" ? String(row.tierLevel) : "—") },
  { key: "status", header: "Status", render: (row) => <StatusPill tone={PARTNER_STATUS_DISPLAY[row.status].tone}>{PARTNER_STATUS_DISPLAY[row.status].label}</StatusPill> },
  { key: "since", header: "Applied", render: (row) => <span className="text-ink-soft">{formatDate(row.createdAt, "en-GB")}</span> },
  { key: "open", header: "", align: "right", render: (row) => <OpenLink href={`/admin/partners/${row.id}`} /> },
];

export function PartnersPage() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<Filter>("ALL");
  const partners = usePartnerList(filter === "ALL" ? undefined : filter);
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Network"
        title="Fulfilment partners"
        lead="People who run a fulfilment hub from home. Each one applies with a referee, passes identity and address checks, and starts on a low stock limit."
        action={
          <div className="flex gap-2">
            <ButtonLink href="/admin/partners/stock-counts" variant="ghost">
              Stock counts
            </ButtonLink>
            <ButtonLink href="/admin/partners/mystery-orders" variant="ghost">
              Test orders
            </ButtonLink>
            {hasPermission(user.role, "partners.finance") ? (
              <ButtonLink href="/admin/partners/payouts" variant="ghost">
                Payouts
              </ButtonLink>
            ) : null}
          </div>
        }
      />
      <FilterTabs label="Filter by status" options={FILTERS} value={filter} onChange={setFilter} />
      <DataTable
        caption="Partners"
        columns={COLUMNS}
        rows={partners.data ?? []}
        rowKey={(row) => row.id}
        loading={partners.isLoading}
        empty={<EmptyState title="No partners here" body="Applications from the partner page appear here as people move through verification." />}
      />
    </div>
  );
}
