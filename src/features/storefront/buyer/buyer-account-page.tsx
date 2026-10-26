"use client";

import type { StorefrontOrderView } from "@/shared";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";
import { BuyerShopping } from "@/features/shopping/buyer-shopping";
import { formatDate, formatMoney, localeFor } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { OrderReceipt } from "../shop/order-receipt";
import { RETURN_STATUS_DISPLAY } from "../storefront-display";
import { BuyerSignInForm } from "./buyer-sign-in";
import { useBuyer, useBuyerOrders, useBuyerSignOut, useRequestReturn } from "./use-buyer";

function ReturnRequest({ order }: { order: StorefrontOrderView }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const request = useRequestReturn(order.id);
  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-small text-ink-soft">You can ask to return this until {formatDate(order.returnsUntil!, localeFor(order.destinationCountryCode))}.</span>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          Return this order
        </Button>
      </div>
    );
  }
  return (
    <div className="motion-rise flex flex-col gap-3 border-t border-line pt-4">
      <FormAlert message={formError(request.error)} />
      <Field label="What went wrong?" hint="The store reads this before deciding. Most decide within a few days." error={fieldError(request.error, "reason")}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[90px]" maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} />
        )}
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="yellow"
          loading={request.isPending}
          disabled={reason.trim().length < 10}
          onClick={() => request.mutate(reason.trim(), { onSuccess: () => toast.success("Return requested", "We've let the store know.") })}
        >
          Send return request
        </Button>
      </div>
    </div>
  );
}

function ReturnHistory({ order }: { order: StorefrontOrderView }) {
  const locale = localeFor(order.destinationCountryCode);
  return (
    <ul className="flex flex-col gap-2 border-t border-line pt-4">
      {order.returns.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-1 text-small">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Return {entry.reference}</span>
            <StatusPill tone={RETURN_STATUS_DISPLAY[entry.status].tone}>{RETURN_STATUS_DISPLAY[entry.status].label}</StatusPill>
            {entry.refundMinor ? <span className="tabular-nums text-ink-soft">{formatMoney(entry.refundMinor, order.currency, locale)}</span> : null}
          </span>
          {entry.decisionNote ? <span className="text-ink-soft">Store: {entry.decisionNote}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function OrderList() {
  const orders = useBuyerOrders(true);
  if (orders.isLoading) {
    return <PageSkeleton label="Finding your orders" />;
  }
  if (orders.isError) {
    return <FormAlert message={errorMessage(orders.error)} />;
  }
  if ((orders.data ?? []).length === 0) {
    return <EmptyState title="No orders yet" body="Orders you pay for on any store here show up in this list." />;
  }
  return (
    <ul className="stagger flex flex-col gap-4">
      {orders.data!.map((order) => (
        <li key={order.id}>
          <OrderReceipt order={order}>
            {order.trackingNumber ? (
              <a href={`/track/${encodeURIComponent(order.trackingNumber)}`} className="text-small underline underline-offset-4">
                Track your parcel
              </a>
            ) : null}
            {order.returns.length > 0 ? <ReturnHistory order={order} /> : null}
            {order.canRequestReturn ? <ReturnRequest order={order} /> : null}
          </OrderReceipt>
        </li>
      ))}
    </ul>
  );
}

const TABS = [
  { value: "orders", label: "Store orders" },
  { value: "shopping", label: "Shopping requests" },
] as const;

export function BuyerAccountPage() {
  const buyer = useBuyer();
  const params = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>(() => (params.has("paid") || params.get("tab") === "shopping" ? "shopping" : "orders"));
  const signOut = useBuyerSignOut();
  if (buyer.isLoading) {
    return <PageSkeleton label="Opening your account" />;
  }
  if (!buyer.data) {
    return (
      <div className="flex flex-col gap-7">
        <PageHeader stamp="Your orders" title="See what you've ordered" lead="Track parcels, ask for returns, and pay for things we're shopping for you." />
        <BuyerSignInForm />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader stamp="Your orders" title={buyer.data.name ? `Hello, ${buyer.data.name.split(" ")[0]}` : "Your orders"} lead={`Signed in as ${buyer.data.email}.`} />
        <Button variant="ghost" loading={signOut.isPending} onClick={() => signOut.mutate()}>
          Sign out
        </Button>
      </div>
      <FilterTabs label="Show" options={TABS} value={tab} onChange={setTab} />
      {tab === "orders" ? <OrderList /> : <BuyerShopping />}
    </div>
  );
}
