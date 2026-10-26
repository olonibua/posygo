"use client";

import { ADJUSTMENT_DIRECTIONS, type AdjustmentDirection, hasPermission, type WalletView } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { ADJUSTMENT_STATUS_DISPLAY, WALLET_STATUS_DISPLAY } from "./finance-display";
import { LedgerTable } from "./ledger-table";
import { MoneyField } from "./money-field";
import { toMinor } from "./money-input";
import { useFinanceWallet, useRequestAdjustment, useSetFrozen } from "./use-finance";

export function FinanceWalletPage({ walletId }: { walletId: string }) {
  const user = useCurrentUser();
  const detail = useFinanceWallet(walletId);
  const data = detail.data;
  if (!data) {
    return detail.isError ? <p className="text-ink-soft">{"This wallet isn't available."}</p> : <PageSkeleton />;
  }
  const { wallet, ledger } = data;
  const locale = localeFor(wallet.countryCode);
  const status = WALLET_STATUS_DISPLAY[wallet.status];
  const credits = ledger.filter((entry) => entry.amountMinor > 0).reduce((total, entry) => total + entry.amountMinor, 0);
  const debits = ledger.filter((entry) => entry.amountMinor < 0).reduce((total, entry) => total - entry.amountMinor, 0);
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp={`Wallet · ${wallet.countryCode}`}
        title={wallet.businessName}
        lead={status.note}
        action={
          <span className="flex items-center gap-3">
            <ButtonLink href="/admin/finance" variant="ghost">
              All wallets
            </ButtonLink>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </span>
        }
      />
      <StatTileGrid>
        <StatTile tone="lime" label="Balance" value={formatMoney(wallet.balanceMinor, wallet.currency, locale)} note={`Held in ${wallet.currency}`} dots={["orange"]} />
        <StatTile tone="sky" label="Paid in" value={formatMoney(credits, wallet.currency, locale)} note="Recent credits" dots={["yellow"]} />
        <StatTile tone="yellow" label="Charged" value={formatMoney(debits, wallet.currency, locale)} note="Recent charges" dots={["pink", "teal"]} />
        <StatTile
          tone="pink"
          label="Alert level"
          value={wallet.lowBalanceThresholdMinor > 0 ? formatMoney(wallet.lowBalanceThresholdMinor, wallet.currency, locale) : "Off"}
          note="Set by the vendor"
          dots={["lime"]}
        />
      </StatTileGrid>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section aria-labelledby="ledger-heading" className="flex flex-col gap-3">
          <h2 id="ledger-heading" className="text-h3">
            Ledger
          </h2>
          <LedgerTable entries={ledger} currency={wallet.currency} locale={locale} />
        </section>
        <div className="flex flex-col gap-5">
          {hasPermission(user.role, "finance.adjust") && wallet.status !== "CLOSED" ? <AdjustmentForm wallet={wallet} locale={locale} /> : null}
          {hasPermission(user.role, "finance.approve") && (wallet.status === "ACTIVE" || wallet.status === "FROZEN" || wallet.status === "STORAGE_OVERDUE") ? <FreezeForm wallet={wallet} /> : null}
        </div>
      </div>
    </div>
  );
}

function AdjustmentForm({ wallet, locale }: { wallet: WalletView; locale: string }) {
  const request = useRequestAdjustment(wallet.id);
  const [direction, setDirection] = useState<AdjustmentDirection>("CREDIT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const amountMinor = toMinor(amount, wallet.currency);
    if (!amountMinor) {
      setProblem("Enter an amount.");
      return;
    }
    setProblem(null);
    request.mutate(
      { direction, amountMinor, reason: reason.trim(), reference: reference.trim() || undefined },
      {
        onSuccess: () => {
          setAmount("");
          setReason("");
          setReference("");
        },
      },
    );
  }
  const result = request.data;
  return (
    <Paper className="px-6 py-6">
      <Stamp>Adjust balance</Stamp>
      <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <FormAlert message={problem ?? formError(request.error)} />
        {result ? (
          <p className="text-small text-success">
            {result.status === "APPLIED"
              ? `Applied: ${formatMoney(result.amountMinor, result.currency, locale)}.`
              : `${ADJUSTMENT_STATUS_DISPLAY[result.status].label}. A second person needs to approve it.`}
          </p>
        ) : null}
        <div role="group" aria-label="Direction" className="flex gap-2">
          {ADJUSTMENT_DIRECTIONS.map((value) => (
            <ChoiceChip key={value} tone={value === "CREDIT" ? "lime" : "pink"} selected={direction === value} onToggle={() => setDirection(value)}>
              {value === "CREDIT" ? "Credit" : "Charge"}
            </ChoiceChip>
          ))}
        </div>
        <MoneyField
          label="Amount"
          currency={wallet.currency}
          value={amount}
          onChange={setAmount}
          error={fieldError(request.error, "amountMinor")}
          hint="Large amounts wait for a second person to approve."
        />
        <Field label="Reason" hint="At least 10 characters. The vendor sees this on their statement." error={fieldError(request.error, "reason")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} value={reason} maxLength={300} onChange={(event) => setReason(event.target.value)} className="min-h-[80px]" />
          )}
        </Field>
        <Field label="Reference (optional)" hint="A ticket or claim number.">
          {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={reference} maxLength={120} onChange={(event) => setReference(event.target.value)} />}
        </Field>
        <Button type="submit" variant="yellow" loading={request.isPending}>
          Submit adjustment
        </Button>
      </form>
    </Paper>
  );
}

function FreezeForm({ wallet }: { wallet: WalletView }) {
  const setFrozen = useSetFrozen(wallet.id);
  const [reason, setReason] = useState("");
  const freezing = wallet.status !== "FROZEN";
  function submit(event: FormEvent) {
    event.preventDefault();
    setFrozen.mutate({ frozen: freezing, reason: reason.trim() }, { onSuccess: () => setReason("") });
  }
  return (
    <Paper className="px-6 py-6">
      <Stamp>{freezing ? "Pause charges" : "Resume charges"}</Stamp>
      <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <FormAlert message={formError(setFrozen.error)} />
        <p className="text-small text-ink-soft">{freezing ? "While paused, nothing can be charged to this wallet. Top-ups still arrive." : "Charges start again straight away."}</p>
        <Field label="Reason" hint="At least 10 characters, kept in the audit log." error={fieldError(setFrozen.error, "reason")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} value={reason} maxLength={300} onChange={(event) => setReason(event.target.value)} className="min-h-[72px]" />
          )}
        </Field>
        <Button type="submit" variant={freezing ? "ghost" : "lime"} loading={setFrozen.isPending} disabled={reason.trim().length < 10}>
          {freezing ? "Pause wallet" : "Resume wallet"}
        </Button>
      </form>
    </Paper>
  );
}
