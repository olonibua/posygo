"use client";

import { hasPermission } from "@/shared";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { ReportProblemForm } from "@/features/custody/report-problem-form";

import { CancelForm } from "./cancel-form";
import { CANCELLATION_REASON_LABELS, ORDER_ACTION_LABELS } from "./order-display";
import { ChargesCard, OrderLines, OrderStatusPill, OrderTimeline, ParcelCard, RecipientCard } from "./order-parts";
import { useVendorOrder } from "./use-vendor-orders";

type Pending = "CANCEL" | "REQUEST_CANCELLATION" | "REPORT" | null;

const SHIPPED = ["HANDED_OFF", "IN_TRANSIT", "DELIVERED", "EXCEPTION"];

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const canManage = hasPermission(user.role, "vendor.orders.manage");
  const { order, act } = useVendorOrder(orderId);
  const [pending, setPending] = useState<Pending>(null);
  const data = order.data;
  if (!data) {
    return order.isError ? <p className="text-ink-soft">{"This order isn't available."}</p> : <PageSkeleton />;
  }
  const actions = canManage ? data.actions : [];
  const awaiting = data.rates.find((rate) => rate.selected);
  const request = data.cancellation;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp={`Order${data.externalReference ? ` · ${data.externalReference}` : ""}`}
        title={data.reference}
        lead={`${data.totalUnits} ${data.totalUnits === 1 ? "unit" : "units"} from ${data.warehouseName} to ${data.recipientName} in ${data.recipientCity}.`}
        action={
          <span className="flex flex-wrap items-center gap-2.5">
            <OrderStatusPill status={data.status} />
            {data.label ? (
              <ButtonLink href={`/track/${encodeURIComponent(data.label.trackingNumber)}`} variant="ghost">
                Tracking page
              </ButtonLink>
            ) : null}
            {actions.includes("PAY_SHIPPING") ? (
              <Button variant="yellow" loading={act.isPending} onClick={() => act.mutate({ action: "PAY_SHIPPING" })}>
                Pay {awaiting?.chargeMinor ? formatMoney(awaiting.chargeMinor, awaiting.currency, locale) : ""} for shipping
              </Button>
            ) : null}
            {canManage && SHIPPED.includes(data.status) ? (
              <ButtonLink href={`/returns/new?order=${data.id}`} variant="ghost">
                Start a return
              </ButtonLink>
            ) : null}
            {canManage && SHIPPED.includes(data.status) ? (
              <Button variant="ghost" onClick={() => setPending("REPORT")}>
                Report a problem
              </Button>
            ) : null}
            {actions.includes("CANCEL") || actions.includes("REQUEST_CANCELLATION") ? (
              <Button variant="ghost" onClick={() => setPending(actions.includes("CANCEL") ? "CANCEL" : "REQUEST_CANCELLATION")}>
                {ORDER_ACTION_LABELS[actions.includes("CANCEL") ? "CANCEL" : "REQUEST_CANCELLATION"]}
              </Button>
            ) : null}
          </span>
        }
      />
      <FormAlert message={errorMessage(act.error)} />
      {pending === "REPORT" ? <ReportProblemForm subject={{ orderId: data.id }} title={`Order ${data.reference}`} maxQuantity={data.totalUnits} onClose={() => setPending(null)} /> : null}
      {pending === "CANCEL" || pending === "REQUEST_CANCELLATION" ? (
        <CancelForm
          title={pending === "CANCEL" ? "Cancel this order?" : "Ask us to cancel"}
          explanation={
            pending === "CANCEL"
              ? "The stock goes back on the shelf and the fulfilment fee is returned to your wallet."
              : "Packing has started, so the hub decides. If they can stop it, everything you paid for this order is returned."
          }
          noteRequired={false}
          busy={act.isPending}
          onCancel={() => setPending(null)}
          onSubmit={(reason, note) => act.mutate({ action: pending, reason, note }, { onSuccess: () => setPending(null) })}
        />
      ) : null}
      {data.status === "AWAITING_WALLET_FUNDING" ? (
        <NotebookNote tone="pink" tilt="none" className="max-w-[720px]">
          <Stamp className="text-cocoa">Shipping needs funds</Stamp>
          <p className="mt-2 text-small">
            The parcel is packed. {awaiting?.chargeMinor ? `${awaiting.carrier} ${awaiting.service} costs ${formatMoney(awaiting.chargeMinor, awaiting.currency, locale)}. ` : ""}
            Add funds to your wallet, then pay here and the label is bought straight away.
          </p>
          <ButtonLink href="/wallet" variant="yellow" className="mt-3">
            Add funds
          </ButtonLink>
        </NotebookNote>
      ) : null}
      {data.holdReason && data.status === "ON_HOLD" ? (
        <NotebookNote tone="pink" tilt="none" className="max-w-[720px]">
          <Stamp className="text-cocoa">On hold at the hub</Stamp>
          <p className="mt-2 text-small">{data.holdReason}</p>
        </NotebookNote>
      ) : null}
      {request ? (
        <NotebookNote tone={request.status === "REJECTED" ? "pink" : "sky"} tilt="none" className="max-w-[720px]">
          <Stamp className="text-cocoa">Cancellation {request.status === "PENDING" ? "requested" : request.status === "APPROVED" ? "approved" : "declined"}</Stamp>
          <p className="mt-2 text-small">
            {CANCELLATION_REASON_LABELS[request.reason]}
            {request.note ? `: ${request.note}` : ""}
          </p>
          {request.decisionNote ? <p className="mt-1 text-small">Hub: {request.decisionNote}</p> : null}
        </NotebookNote>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5">
          <OrderLines order={data} showScans={false} />
          <OrderTimeline events={data.events} locale={locale} />
        </div>
        <div className="flex flex-col gap-5">
          <RecipientCard recipient={data.recipient} />
          <ChargesCard order={data} locale={locale} />
          <ParcelCard order={data} locale={locale} />
        </div>
      </div>
    </div>
  );
}
