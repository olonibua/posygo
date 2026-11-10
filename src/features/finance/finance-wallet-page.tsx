"use client";

import { hasPermission, type WalletView } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { AdjustmentForm } from "./adjustment-form";
import { WALLET_STATUS_DISPLAY } from "./finance-display";
import { LedgerTable } from "./ledger-table";
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
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="ledger-heading" className="flex flex-col gap-3">
          <h2 id="ledger-heading" className="text-h3">
            Ledger
          </h2>
          <LedgerTable entries={ledger} currency={wallet.currency} locale={locale} />
        </section>
        <div className="flex flex-col gap-5">
          {hasPermission(user.role, "finance.adjust") && wallet.status !== "CLOSED" ? <WalletAdjustmentForm wallet={wallet} locale={locale} /> : null}
          {hasPermission(user.role, "finance.approve") && (wallet.status === "ACTIVE" || wallet.status === "FROZEN" || wallet.status === "STORAGE_OVERDUE") ? <FreezeForm wallet={wallet} /> : null}
        </div>
      </div>
    </div>
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

function WalletAdjustmentForm({ wallet, locale }: { wallet: WalletView; locale: string }) {
  return <AdjustmentForm request={useRequestAdjustment(wallet.id)} currency={wallet.currency} locale={locale} audience="vendor" />;
}
