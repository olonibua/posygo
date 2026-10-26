"use client";

import { hasPermission, type StorefrontReturnStatus } from "@/shared";
import { useState } from "react";

import { FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { ReturnCases } from "../returns/return-cases";
import { useStoreReturns } from "../use-store-returns";

const FILTERS: ReadonlyArray<{ value: StorefrontReturnStatus; label: string }> = [
  { value: "REQUESTED", label: "Waiting for a decision" },
  { value: "APPROVED", label: "Refund pending" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "REJECTED", label: "Turned down" },
];

export function AdminStoreReturnsPage() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<StorefrontReturnStatus>("REQUESTED");
  const returns = useStoreReturns("admin", filter);
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Money"
        title="Store returns"
        lead="Stores decide their own returns. Step in when a store is slow to answer or a refund didn't go through. The vendor's payout stays held while a return is open."
      />
      <FilterTabs label="Filter returns" options={FILTERS} value={filter} onChange={setFilter} />
      <ReturnCases cases={returns.data ?? []} loading={returns.isLoading} audience="admin" canDecide={hasPermission(user.role, "storefronts.manage")} />
    </div>
  );
}
