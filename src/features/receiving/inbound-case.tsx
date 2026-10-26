"use client";

import { hasPermission, type InboundAction } from "@/shared";
import { useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { INBOUND_ACTION_LABELS } from "@/features/stock/display";
import { InboundFacts, InboundLinesTable, InboundStatusPill, MessageThread, PhotoList } from "@/features/stock/inbound-parts";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { ActionBar } from "./action-bar";
import { errorMessage } from "./api-errors";
import { ReasonForm } from "./reason-form";
import { ReceiveForm } from "./receive-form";
import { type ReasonAction, useInboundCase } from "./use-inbound-case";

const REASON_ACTIONS: readonly InboundAction[] = ["HOLD", "REJECT", "REQUEST_RETURN"];

export function InboundCase({ inboundId }: { inboundId: string }) {
  const user = useCurrentUser();
  const canReceive = hasPermission(user.role, "inbound.receive");
  const { detail, act, receive, message, openPhoto } = useInboundCase(inboundId);
  const [pending, setPending] = useState<InboundAction | null>(null);
  const inbound = detail.data;

  if (!inbound) {
    return detail.isError ? <p className="text-ink-soft">{"This shipment isn't available to you."}</p> : <PageSkeleton />;
  }

  function choose(action: InboundAction) {
    if (action === "CHECK_IN" || action === "RELEASE") {
      act.mutate({ action });
      return;
    }
    setPending(action);
  }

  const counted = inbound.receivedAt !== null;
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp={`Inbound · ${inbound.businessName}`}
        title={inbound.reference}
        action={
          <span className="flex items-center gap-3">
            {counted ? (
              <ButtonLink href={`/admin/receiving/${inbound.id}/labels`} variant="ghost">
                Print lot labels
              </ButtonLink>
            ) : null}
            <InboundStatusPill status={inbound.status} />
          </span>
        }
      />
      <FormAlert message={errorMessage(act.error) ?? errorMessage(openPhoto.error)} />
      {inbound.statusReason ? (
        <NotebookNote tone="pink" tilt="none" className="max-w-[720px]">
          <Stamp className="text-cocoa">Reason given</Stamp>
          <p className="mt-2 text-small">{inbound.statusReason}</p>
        </NotebookNote>
      ) : null}
      {inbound.status === "ON_HOLD" && inbound.charges.holdChargeMinor !== null ? (
        <NotebookNote tone="sky" tilt="none" className="max-w-[720px]">
          {inbound.charges.holdPaidAt
            ? "The vendor has paid the hold charge."
            : `Waiting for the vendor to pay a ${formatMoney(inbound.charges.holdChargeMinor, inbound.charges.currency, localeFor(inbound.countryCode))} hold charge. Releasing the hold waives it.`}
        </NotebookNote>
      ) : null}
      {pending ? null : <ActionBar actions={inbound.actions} busy={act.isPending} onChoose={choose} />}
      {pending && REASON_ACTIONS.includes(pending) ? (
        <ReasonForm
          title={INBOUND_ACTION_LABELS[pending]}
          busy={act.isPending}
          onCancel={() => setPending(null)}
          chargeCurrency={pending === "HOLD" && !user.partnerId ? inbound.charges.currency : undefined}
          onSubmit={(reason, chargeMinor) => act.mutate({ action: pending as ReasonAction, reason, chargeMinor }, { onSuccess: () => setPending(null) })}
        />
      ) : null}
      {pending === "COMPLETE" ? (
        <ReceiveForm
          inbound={inbound}
          busy={receive.isPending}
          error={receive.error}
          onCancel={() => setPending(null)}
          onSubmit={(input) => receive.mutate(input, { onSuccess: () => setPending(null) })}
        />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5">
          <InboundLinesTable inbound={inbound} />
          {inbound.receivingNote ? (
            <NotebookNote tone="sky" tilt="none">
              <Stamp className="text-cocoa">Receiving note</Stamp>
              <p className="mt-2 text-small">{inbound.receivingNote}</p>
            </NotebookNote>
          ) : null}
          <MessageThread
            messages={inbound.messages}
            viewer="platform"
            onSend={canReceive ? (body) => message.mutateAsync(body) : undefined}
            sending={message.isPending}
            error={errorMessage(message.error)}
          />
        </div>
        <div className="flex flex-col gap-5">
          <InboundFacts inbound={inbound} />
          <PhotoList photos={inbound.photos} lines={inbound.lines} onOpen={(fileId) => openPhoto.mutate(fileId)} />
        </div>
      </div>
    </div>
  );
}
