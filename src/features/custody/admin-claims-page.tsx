"use client";

import { type ClaimStatus as Status, type ClaimView, hasPermission } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper } from "@/components/ui/surfaces";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { ClaimFacts, ClaimStatus, claimSubject } from "./claim-details";
import { AssessClaimForm, DecideClaimForm } from "./claim-review-forms";
import { CLAIM_KIND_LABELS } from "./custody-display";
import { useClaim, useClaims } from "./use-custody";

const FILTERS: ReadonlyArray<{ value: Status; label: string }> = [
  { value: "OPEN", label: "New" },
  { value: "ASSESSED", label: "Awaiting decision" },
  { value: "SETTLED", label: "Settled" },
  { value: "REJECTED", label: "Not accepted" },
];

export function AdminClaimsPage() {
  const [filter, setFilter] = useState<Status>("OPEN");
  const [selected, setSelected] = useState<string | null>(null);
  const claims = useClaims("admin", filter);
  const chosen = useClaim(selected).data ?? null;
  const columns: Column<ClaimView>[] = [
    {
      key: "claim",
      header: "Claim",
      render: (row) => (
        <span className="font-medium">
          {claimSubject(row)}
          <span className="block text-meta font-normal text-ink-faint">
            {row.reference} · {row.vendorName}
          </span>
        </span>
      ),
    },
    { key: "what", header: "What", render: (row) => `${CLAIM_KIND_LABELS[row.kind]} · ${row.quantity}` },
    { key: "where", header: "Where", render: (row) => <span className="text-ink-soft">{row.partnerName ?? row.warehouseName}</span> },
    { key: "value", header: "Value", align: "right", render: (row) => <span className="tabular-nums">{formatMoney(row.amountMinor, row.currency, localeFor(row.countryCode))}</span> },
    { key: "status", header: "Status", render: (row) => <ClaimStatus claim={row} /> },
    {
      key: "open",
      header: "",
      align: "right",
      render: (row) => (
        <Button variant={row.id === selected ? "yellow" : "ghost"} onClick={() => setSelected(row.id)}>
          Open
        </Button>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Trust"
        title="Claims"
        lead="Missing, damaged or lost stock. One person assesses who is responsible, someone else decides, and the vendor's wallet is credited with the agreed amount."
      />
      <FilterTabs label="Filter claims" options={FILTERS} value={filter} onChange={setFilter} />
      <DataTable
        caption="Claims"
        columns={columns}
        rows={claims.data ?? []}
        rowKey={(row) => row.id}
        loading={claims.isLoading}
        empty={<EmptyState title="Nothing here" body="Claims come from vendor reports, short stock counts and transfers that arrive short." />}
      />
      {chosen ? <ClaimReview key={chosen.id} claim={chosen} /> : null}
    </div>
  );
}

function ClaimReview({ claim }: { claim: ClaimView }) {
  const user = useCurrentUser();
  const locale = localeFor(claim.countryCode);
  const canAssess = hasPermission(user.role, "claims.assess") && claim.status === "OPEN";
  const canDecide = hasPermission(user.role, "claims.decide") && (claim.status === "ASSESSED" || claim.status === "OPEN");
  return (
    <Paper className="motion-rise flex flex-col gap-4 px-6 py-5">
      <ClaimFacts claim={claim} locale={locale} />
      {canAssess ? <AssessClaimForm claim={claim} locale={locale} /> : null}
      {canDecide ? <DecideClaimForm claim={claim} /> : null}
    </Paper>
  );
}
