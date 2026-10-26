"use client";

import { hasPermission, type VendorReturnStatus } from "@/shared";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { localeFor } from "@/lib/format";

import { ReturnCard } from "./return-card";
import { useReturns } from "./use-returns";
import { VendorReturnActions } from "./vendor-return-actions";

type View = "ACTIVE" | "DONE";

const ACTIVE: readonly VendorReturnStatus[] = ["REQUESTED", "RECEIVED", "INSTRUCTED"];
const VIEWS: ReadonlyArray<{ value: View; label: string }> = [
  { value: "ACTIVE", label: "In progress" },
  { value: "DONE", label: "Finished" },
];

export function VendorReturnsPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const highlight = useSearchParams().get("open");
  const [view, setView] = useState<View>("ACTIVE");
  const returns = useReturns("vendor");
  const canManage = hasPermission(user.role, "vendor.orders.manage");
  const shown = (returns.data ?? []).filter((entry) => ACTIVE.includes(entry.status) === (view === "ACTIVE")).sort((left, right) => Number(right.id === highlight) - Number(left.id === highlight));
  const waiting = (returns.data ?? []).filter((entry) => entry.status === "RECEIVED").length;
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Sell"
        title="Returns"
        lead={
          waiting > 0
            ? `${waiting} ${waiting === 1 ? "return has" : "returns have"} arrived and ${waiting === 1 ? "needs" : "need"} your instructions.`
            : "Items your customers send back come to the warehouse that shipped them. We count and photograph them, and you decide what happens next."
        }
      />
      <p className="max-w-2xl text-small text-ink-soft">
        To start a return, open the{" "}
        <Link href="/orders" className="font-medium underline decoration-line-strong underline-offset-4">
          order
        </Link>{" "}
        and choose Start a return.
      </p>
      <FilterTabs label="Show returns" options={VIEWS} value={view} onChange={setView} />
      {returns.isLoading ? (
        <LoadingRows columns={2} />
      ) : shown.length === 0 ? (
        <EmptyState title={view === "ACTIVE" ? "No returns in progress" : "No finished returns yet"} body="Returns you open show up here until they're done." />
      ) : (
        <ul className="stagger flex flex-col gap-4">
          {shown.map((entry) => (
            <li key={entry.id}>
              <ReturnCard entry={entry} side="vendor" locale={locale}>
                <VendorReturnActions entry={entry} canManage={canManage} locale={locale} />
              </ReturnCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
