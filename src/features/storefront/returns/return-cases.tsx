"use client";

import type { StoreReturnCaseView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { LoadingRows } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";
import { toMajorText, toMinor } from "@/features/finance/money-input";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { formatDate, formatMoney, localeFor } from "@/lib/format";

import { RETURN_STATUS_DISPLAY } from "../storefront-display";
import { type ReturnsAudience, useDecideReturn, useRetryReturnRefund } from "../use-store-returns";

function DecisionForm({ entry, audience }: { entry: StoreReturnCaseView; audience: ReturnsAudience }) {
  const { order } = entry;
  const left = Math.max(0, (audience === "vendor" ? (order.vendorShareMinor ?? order.totalMinor) : order.totalMinor) - order.refundedMinor);
  const locale = localeFor(order.destinationCountryCode);
  const [amount, setAmount] = useState(toMajorText(left, order.currency));
  const [note, setNote] = useState("");
  const decide = useDecideReturn(audience, entry.id);
  const refundMinor = toMinor(amount, order.currency);
  const ready = note.trim().length >= 3;
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <FormAlert message={formError(decide.error)} />
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <Field label="Refund" hint={`Up to ${formatMoney(left, order.currency, locale)}${audience === "vendor" ? ", your share of the sale" : ""}`} error={fieldError(decide.error, "refundMinor")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} inputMode="decimal" aria-describedby={describedBy} aria-invalid={invalid} value={amount} onChange={(event) => setAmount(event.target.value)} />
          )}
        </Field>
        <Field label="Message to the buyer" hint="Say what happens to the item, for example whether they can keep it." error={fieldError(decide.error, "note")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[72px]" maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} />
          )}
        </Field>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="ghost"
          loading={decide.isPending && decide.variables?.accept === false}
          disabled={!ready || decide.isPending}
          onClick={() => decide.mutate({ accept: false, note: note.trim() })}
        >
          Turn down
        </Button>
        <Button
          variant="yellow"
          loading={decide.isPending && decide.variables?.accept === true}
          disabled={!ready || !refundMinor || refundMinor > left || decide.isPending}
          onClick={() => refundMinor && decide.mutate({ accept: true, refundMinor, note: note.trim() })}
        >
          Accept and refund {refundMinor ? formatMoney(refundMinor, order.currency, locale) : ""}
        </Button>
      </div>
    </div>
  );
}

function RetryRefund({ entry, audience }: { entry: StoreReturnCaseView; audience: ReturnsAudience }) {
  const retry = useRetryReturnRefund(audience, entry.id);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-pink/30 px-4 py-3">
      <span className="text-small">The card refund didn&apos;t go through. The buyer is still owed this money.</span>
      <Button variant="ghost" loading={retry.isPending} onClick={() => retry.mutate(undefined)}>
        Try the refund again
      </Button>
    </div>
  );
}

function ReturnCase({ entry, audience, canDecide }: { entry: StoreReturnCaseView; audience: ReturnsAudience; canDecide: boolean }) {
  const { order } = entry;
  const locale = localeFor(order.destinationCountryCode);
  return (
    <Paper className="motion-rise flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          <span className="block font-medium">
            {entry.reference} · order {order.reference}
          </span>
          <span className="text-meta font-normal text-ink-faint">
            {audience === "admin" ? `${order.storeName} · ` : ""}
            {order.buyerName}, {order.recipientCity} · asked {formatDate(entry.createdAt, locale)}
          </span>
        </span>
        <StatusPill tone={RETURN_STATUS_DISPLAY[entry.status].tone}>{RETURN_STATUS_DISPLAY[entry.status].label}</StatusPill>
      </div>
      <p className="text-small">
        <span className="text-ink-soft">Items: </span>
        {order.lines.map((line) => `${line.quantity} × ${line.productName}`).join(", ")} · {formatMoney(order.totalMinor, order.currency, locale)} paid
      </p>
      <blockquote className="rounded-card bg-sky/30 px-4 py-3 text-small">{entry.reason}</blockquote>
      {entry.decisionNote ? <p className="text-small text-ink-soft">Decision: {entry.decisionNote}</p> : null}
      {canDecide && entry.status === "REQUESTED" ? <DecisionForm entry={entry} audience={audience} /> : null}
      {canDecide && entry.status === "APPROVED" ? <RetryRefund entry={entry} audience={audience} /> : null}
    </Paper>
  );
}

export function ReturnCases({ cases, loading, audience, canDecide }: { cases: StoreReturnCaseView[]; loading: boolean; audience: ReturnsAudience; canDecide: boolean }) {
  if (loading) {
    return <LoadingRows columns={3} />;
  }
  if (cases.length === 0) {
    return <EmptyState title="No returns here" body="When a buyer asks to return an order, it shows up here for a decision." />;
  }
  return (
    <ul className="stagger flex flex-col gap-3">
      {cases.map((entry) => (
        <li key={entry.id}>
          <ReturnCase entry={entry} audience={audience} canDecide={canDecide} />
        </li>
      ))}
    </ul>
  );
}
