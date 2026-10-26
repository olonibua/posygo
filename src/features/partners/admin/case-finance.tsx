"use client";

import { type PartnerDetailView, type PartnerPayoutView, type RecordSecurityInput, SECURITY_KINDS, type StatementRange } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Input, Select } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { MoneyField } from "@/features/finance/money-field";
import { toMinor } from "@/features/finance/money-input";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { PAYOUT_ACCOUNT_DISPLAY } from "../partner-display";
import { StatementPanel } from "../partner-parts";
import { useAdminPartnerMutation, useAdminStatement } from "../use-partners";

export function DepositPanel({ partner, locale }: { partner: PartnerDetailView; locale: string }) {
  const [form, setForm] = useState({ kind: "DEPOSIT" as RecordSecurityInput["kind"], amount: "", reference: "", expiresOn: "" });
  const record = useAdminPartnerMutation((input: RecordSecurityInput) => ({ path: `/v1/admin/partners/${partner.id}/securities`, body: input }), "Receipt recorded");
  const release = useAdminPartnerMutation((input: { id: string; note: string }) => ({ path: `/v1/admin/partners/${partner.id}/securities/${input.id}/release`, body: { note: input.note } }));
  const confirm = useAdminPartnerMutation((id: string) => ({ path: `/v1/admin/partners/${partner.id}/securities/${id}/confirm` }), "Receipt confirmed");
  const held = partner.securities.filter((security) => !security.releasedAt && security.confirmedAt).reduce((total, security) => total + security.amountMinor, 0);
  const closed = partner.status === "TERMINATED" || partner.status === "REJECTED";
  const operating = ["ACTIVE", "SUSPENDED", "OFFBOARDING"].includes(partner.status);
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    record.mutate(
      { kind: form.kind, amountMinor: toMinor(form.amount, partner.currency) ?? 0, reference: form.reference, expiresOn: form.expiresOn || undefined },
      { onSuccess: () => setForm({ kind: "DEPOSIT", amount: "", reference: "", expiresOn: "" }) },
    );
  }

  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <Stamp>
        Deposit (optional) · {formatMoney(held, partner.currency, locale)} confirmed of {formatMoney(partner.requiredDepositMinor, partner.currency, locale)}
      </Stamp>
      <p className="text-meta text-ink-faint">Each receipt is confirmed against the bank statement by someone other than the person who recorded it.</p>
      <FormAlert message={formError(release.error) ?? formError(confirm.error)} />
      {partner.securities.length > 0 ? (
        <ul className="flex flex-col divide-y divide-line text-small">
          {partner.securities.map((security) => (
            <li key={security.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <span>
                <b className="font-medium">{security.kind === "DEPOSIT" ? "Deposit" : "Bond"}</b> · {formatMoney(security.amountMinor, security.currency, locale)} · {security.reference}
                {security.expiresOn ? ` · until ${formatDate(security.expiresOn, locale)}` : ""}
              </span>
              {security.releasedAt ? (
                <StatusPill tone="cocoa">Released</StatusPill>
              ) : !security.confirmedAt ? (
                <Button variant="lime" loading={confirm.isPending && confirm.variables === security.id} onClick={() => confirm.mutate(security.id)}>
                  Confirm received
                </Button>
              ) : operating ? (
                <StatusPill tone="lime">Held</StatusPill>
              ) : (
                <Button
                  variant="ghost"
                  loading={release.isPending && release.variables?.id === security.id}
                  onClick={() => release.mutate({ id: security.id, note: "Returned to partner after closure" })}
                >
                  Release
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {closed ? null : (
        <form noValidate onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <div className="sm:col-span-2">
            <FormAlert message={formError(record.error)} />
          </div>
          <Field label="Type">
            {({ id }) => (
              <Select id={id} value={form.kind} onChange={(event) => set({ kind: event.target.value as RecordSecurityInput["kind"] })}>
                {SECURITY_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind === "DEPOSIT" ? "Cash deposit" : "Bond or guarantee"}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <MoneyField label="Amount received" currency={partner.currency} value={form.amount} onChange={(amount) => set({ amount })} error={fieldError(record.error, "amountMinor")} />
          <Field label="Bank or bond reference" error={fieldError(record.error, "reference")}>
            {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.reference} onChange={(event) => set({ reference: event.target.value })} />}
          </Field>
          <Field label="Expires" hint="Bonds only." error={fieldError(record.error, "expiresOn")}>
            {({ id, describedBy }) => <Input id={id} type="date" aria-describedby={describedBy} value={form.expiresOn} onChange={(event) => set({ expiresOn: event.target.value })} />}
          </Field>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" variant="lime" loading={record.isPending}>
              Record receipt
            </Button>
          </div>
        </form>
      )}
    </Paper>
  );
}

export function PayoutAccountPanel({ partner, locale }: { partner: PartnerDetailView; locale: string }) {
  const account = partner.payoutAccount;
  const display = account ? PAYOUT_ACCOUNT_DISPLAY[account.status] : null;
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <Stamp>Payout account</Stamp>
      {account && display ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 text-small">
            <span className="font-medium">{account.bankSummary ?? "No bank account added yet"}</span>
            <StatusPill tone={display.tone}>{display.label}</StatusPill>
          </div>
          <p className="text-meta text-ink-faint">
            Held by {account.provider === "PRACTICE" ? "the practice payment provider" : "Stripe Connect"}. We never store account numbers.
            {account.detailsChangedAt ? ` Bank details last changed ${formatDateTime(account.detailsChangedAt, locale)}; payouts requested before then can't be approved.` : ""}
          </p>
        </>
      ) : (
        <p className="text-small text-ink-soft">The partner hasn&apos;t set up payouts yet.</p>
      )}
    </Paper>
  );
}

export function EarningsPanel({ partner, locale }: { partner: PartnerDetailView; locale: string }) {
  const [range, setRange] = useState<StatementRange>({});
  const [form, setForm] = useState({ amount: "", note: "" });
  const statement = useAdminStatement(partner.id, range, true);
  const payout = useAdminPartnerMutation<{ amountMinor: number; note: string }, PartnerPayoutView>((input) => ({ path: `/v1/admin/partners/${partner.id}/payouts`, body: input }));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    payout.mutate(
      { amountMinor: toMinor(form.amount, partner.currency) ?? 0, note: form.note },
      {
        onSuccess: () => {
          setForm({ amount: "", note: "" });
          toast.success("Payout requested", "A second person in finance approves it.");
          void statement.refetch();
        },
      },
    );
  }

  return (
    <section aria-labelledby="earnings-heading" className="flex flex-col gap-4">
      <h2 id="earnings-heading" className="text-h3">
        Earnings and payouts
      </h2>
      <StatementPanel statement={statement.data} range={range} onRange={setRange} locale={locale} loading={statement.isLoading} />
      <Paper className="px-6 py-5">
        <Stamp>Request a payout</Stamp>
        <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-3 md:items-end">
          <div className="md:col-span-3">
            <FormAlert message={formError(payout.error)} />
          </div>
          <MoneyField
            label="Amount"
            currency={partner.currency}
            value={form.amount}
            onChange={(amount) => setForm((current) => ({ ...current, amount }))}
            error={fieldError(payout.error, "amountMinor")}
          />
          <Field label="Note" error={fieldError(payout.error, "note")}>
            {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />}
          </Field>
          <Button type="submit" variant="yellow" loading={payout.isPending} disabled={partner.payoutAccount?.status !== "ACTIVE"}>
            Request payout
          </Button>
        </form>
      </Paper>
    </section>
  );
}
