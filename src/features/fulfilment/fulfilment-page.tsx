"use client";

import { hasPermission, type OrderAction } from "@/shared";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { DecisionForm } from "@/features/finance/decision-form";
import { CancelForm } from "@/features/orders/cancel-form";
import { CANCELLATION_REASON_LABELS, ORDER_ACTION_LABELS } from "@/features/orders/order-display";
import { ChargesCard, OrderLines, OrderStatusPill, OrderTimeline, ParcelCard, RecipientCard } from "@/features/orders/order-parts";
import { ReasonForm } from "@/features/receiving/reason-form";
import { errorMessage } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { localeFor } from "@/lib/format";

import { LabelCard } from "./label-card";
import { PackForm } from "./pack-form";
import { RatesPanel } from "./rates-panel";
import { ScanPanel } from "./scan-panel";
import { useFulfilment, usePackaging } from "./use-fulfilment";

type Pending = "HOLD" | "CANCEL" | null;

const SIMPLE_ACTIONS: readonly OrderAction[] = ["REPACK", "RELEASE", "RETRY_LABEL"];

export function FulfilmentPage({ orderId }: { orderId: string }) {
  const user = useCurrentUser();
  const { order, scan, resetScans, pack, act, decide, simulate, addPhotos } = useFulfilment(orderId);
  const [pending, setPending] = useState<Pending>(null);
  const data = order.data;
  const presets = usePackaging(data?.countryCode ?? null);
  if (!data) {
    return order.isError ? <p className="text-ink-soft">{"This order isn't available to you."}</p> : <PageSkeleton />;
  }
  const locale = localeFor(data.countryCode);
  const remaining = data.lines.reduce((total, line) => total + line.quantity - line.scannedQuantity, 0);
  const canDecide = hasPermission(user.role, "orders.cancel") && data.cancellation?.status === "PENDING";
  const showRates = data.actions.includes("FETCH_RATES") || data.actions.includes("SELECT_RATE");
  const viewOnly = !hasPermission(user.role, "orders.fulfil") && !data.label && data.status !== "CANCELLED";
  const busy = act.isPending;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp={`Order · ${data.businessName}`}
        title={data.reference}
        lead={`${data.totalUnits} ${data.totalUnits === 1 ? "unit" : "units"} from ${data.warehouseName}.`}
        action={
          <span className="flex flex-wrap items-center gap-2.5">
            <OrderStatusPill status={data.status} />
            <ButtonLink href="/admin/orders" variant="ghost">
              All orders
            </ButtonLink>
            {SIMPLE_ACTIONS.filter((action) => data.actions.includes(action)).map((action) => (
              <Button key={action} variant="ghost" loading={busy && act.variables?.action === action} onClick={() => act.mutate({ action } as { action: "REPACK" | "RELEASE" | "RETRY_LABEL" })}>
                {ORDER_ACTION_LABELS[action]}
              </Button>
            ))}
            {data.actions.includes("HOLD") ? (
              <Button variant="ghost" onClick={() => setPending("HOLD")}>
                {ORDER_ACTION_LABELS.HOLD}
              </Button>
            ) : null}
            {data.actions.includes("CANCEL") ? (
              <Button variant="ghost" onClick={() => setPending("CANCEL")}>
                {ORDER_ACTION_LABELS.CANCEL}
              </Button>
            ) : null}
          </span>
        }
      />
      <FormAlert message={errorMessage(act.error)} />
      {pending === "HOLD" ? (
        <ReasonForm title="Put this order on hold" busy={busy} onCancel={() => setPending(null)} onSubmit={(reason) => act.mutate({ action: "HOLD", reason }, { onSuccess: () => setPending(null) })} />
      ) : null}
      {pending === "CANCEL" ? (
        <CancelForm
          title="Cancel this order?"
          explanation="Stock goes back on the shelf, every charge is returned to the vendor's wallet, and a bought label is voided with the carrier."
          noteRequired
          busy={busy}
          onCancel={() => setPending(null)}
          onSubmit={(reason, note) => act.mutate({ action: "CANCEL", reason, note: note ?? "" }, { onSuccess: () => setPending(null) })}
        />
      ) : null}
      {data.status === "ON_HOLD" && data.holdReason ? (
        <NotebookNote tone="pink" tilt="none" className="max-w-[720px]">
          <Stamp className="text-cocoa">On hold</Stamp>
          <p className="mt-2 text-small">{data.holdReason}</p>
        </NotebookNote>
      ) : null}
      {data.status === "AWAITING_WALLET_FUNDING" ? (
        <NotebookNote tone="sky" tilt="none" className="max-w-[720px]">
          The vendor&rsquo;s wallet couldn&rsquo;t cover shipping, so they&rsquo;ve been emailed. The label is bought as soon as they pay; nothing else is needed from you.
        </NotebookNote>
      ) : null}
      {data.cancellation?.status === "PENDING" ? (
        <NotebookNote tone="yellow" tilt="none" className="max-w-[720px]">
          <Stamp className="text-cocoa">The vendor asked to cancel</Stamp>
          <p className="mb-4 mt-2 text-small">
            {CANCELLATION_REASON_LABELS[data.cancellation.reason]}
            {data.cancellation.note ? `: ${data.cancellation.note}` : ""}
          </p>
          {canDecide ? (
            <DecisionForm minNote={10} busy={decide.isPending} error={decide.error} onDecide={(approve, note) => decide.mutate({ approve, note })} />
          ) : (
            <p className="text-small">A country operations lead decides this.</p>
          )}
        </NotebookNote>
      ) : null}
      {viewOnly ? (
        <Paper className="max-w-[720px] px-6 py-5">
          <Stamp>View only</Stamp>
          <p className="mt-2 text-small text-ink-soft">
            The team at {data.warehouseName} packs this order. When they open it from Orders, they scan each item, pack the parcel and buy the label here.
          </p>
        </Paper>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-5">
          {data.actions.includes("RECORD_PACK") ? (
            <ScanPanel remaining={remaining} busy={scan.isPending} error={scan.error} last={scan.data} onScan={(code) => scan.mutate(code)} onReset={() => resetScans.mutate()} />
          ) : null}
          <OrderLines order={data} showScans />
          {data.actions.includes("RECORD_PACK") ? (
            <PackForm presets={presets.data ?? []} ready={remaining === 0} busy={pack.isPending} error={pack.error} onPack={(input) => pack.mutate(input)} />
          ) : null}
          {showRates ? (
            <RatesPanel order={data} locale={locale} busy={busy} onFetch={() => act.mutate({ action: "FETCH_RATES" })} onSelect={(rateId) => act.mutate({ action: "SELECT_RATE", rateId })} />
          ) : null}
          <LabelCard
            order={data}
            busy={busy || addPhotos.isPending}
            photoRequired={Boolean(user.partnerId)}
            photoError={addPhotos.error}
            handOffError={act.error}
            onHandOff={data.actions.includes("HAND_OFF") ? (photoFileIds, sealNumber) => act.mutate({ action: "HAND_OFF", photoFileIds, sealNumber }) : undefined}
            onAddPhotos={(fileIds) => addPhotos.mutate(fileIds)}
          />
          {data.label && !data.label.labelUrl && ["LABEL_PURCHASED", "HANDED_OFF", "IN_TRANSIT"].includes(data.status) ? (
            <Paper className="px-6 py-5">
              <Stamp>Practice carrier</Stamp>
              <p className="mt-2 text-small text-ink-soft">This market uses the practice carrier, so tracking updates are sent from here.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="ghost" loading={simulate.isPending} onClick={() => simulate.mutate({ status: "IN_TRANSIT", description: "Departed the sorting centre" })}>
                  Mark in transit
                </Button>
                <Button variant="ghost" loading={simulate.isPending} onClick={() => simulate.mutate({ status: "DELIVERED", description: "Delivered to the recipient" })}>
                  Mark delivered
                </Button>
              </div>
            </Paper>
          ) : null}
          <OrderTimeline events={data.events} locale={locale} />
        </div>
        <div className="flex flex-col gap-5">
          <RecipientCard recipient={data.recipient} />
          <ParcelCard order={data} locale={locale} />
          <ChargesCard order={data} locale={locale} />
        </div>
      </div>
    </div>
  );
}
