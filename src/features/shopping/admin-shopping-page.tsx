"use client";

import { hasPermission, type ShoppingStatus } from "@/shared";
import { useState } from "react";

import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { localeFor } from "@/lib/format";

import { QuoteForm } from "./quote-form";
import { ShoppingCard } from "./shopping-card";
import { ArrivalPhotos, PurchaseForm, StaffCancel } from "./staff-actions";
import { useStaffShopping } from "./use-shopping";

const FILTERS: ReadonlyArray<{ value: ShoppingStatus; label: string }> = [
  { value: "REQUESTED", label: "To price" },
  { value: "QUOTED", label: "Waiting for payment" },
  { value: "EXPIRED", label: "Price ran out" },
  { value: "PAID", label: "To buy" },
  { value: "BUYING", label: "Bought" },
  { value: "ARRIVED", label: "At the warehouse" },
  { value: "SHIPPED", label: "Sent" },
  { value: "CANCELLED", label: "Cancelled" },
];

const CANCELLABLE: ShoppingStatus[] = ["REQUESTED", "QUOTED", "EXPIRED", "PAID", "BUYING"];
const QUOTABLE: ShoppingStatus[] = ["REQUESTED", "QUOTED", "EXPIRED"];

export function AdminShoppingPage() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<ShoppingStatus>("REQUESTED");
  const requests = useStaffShopping("admin", filter);
  const canManage = hasPermission(user.role, "shopping.manage");
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Operations" title="Personal shopping" lead="Buyers send links to things they want. Price them, buy them once paid, and the warehouse sends everything on in one parcel." />
      <FilterTabs label="Filter requests" options={FILTERS} value={filter} onChange={setFilter} />
      {requests.isLoading ? (
        <LoadingRows columns={2} />
      ) : (requests.data ?? []).length === 0 ? (
        <EmptyState title="Nothing here" body="Requests move through these tabs as they're priced, paid for and sent." />
      ) : (
        <ul className="stagger flex flex-col gap-4">
          {requests.data!.map((request) => (
            <li key={request.id}>
              <ShoppingCard request={request} locale={localeFor(request.countryCode)}>
                {request.notes ? <p className="text-small text-ink-soft">Buyer&apos;s note: {request.notes}</p> : null}
                <ArrivalPhotos request={request} />
                {canManage && QUOTABLE.includes(request.status) ? <QuoteForm request={request} /> : null}
                {canManage && !request.disputeOpen && (request.status === "PAID" || request.status === "BUYING") ? <PurchaseForm request={request} /> : null}
                {canManage && CANCELLABLE.includes(request.status) ? <StaffCancel request={request} /> : null}
              </ShoppingCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
