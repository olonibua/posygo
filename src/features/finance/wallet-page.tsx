"use client";

import { hasPermission, type TopUpView } from "@/shared";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { ExportButton } from "@/features/notifications/export-button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime, formatMoney, localeFor } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { FeeSummary } from "./fee-summary";
import { TOP_UP_STATUS_DISPLAY, WALLET_STATUS_DISPLAY } from "./finance-display";
import { LedgerTable } from "./ledger-table";
import { MoneyField } from "./money-field";
import { toMajorText, toMinor } from "./money-input";
import { TopUpCard } from "./top-up-card";
import { useRefreshWhenPaid, useVendorFees, useVendorWallet, useWalletActivity, useWalletSettings } from "./use-vendor-wallet";

export function WalletPage() {
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "vendor.wallet.manage");
  const locale = localeFor(user.countryCode);
  const wallet = useVendorWallet();
  const fees = useVendorFees();
  const { ledger, topUps } = useWalletActivity();
  const params = useSearchParams();
  const returning = params.get("topUp");
  const cancelled = params.get("cancelled") === "1";
  const paidCount = topUps.data?.filter((topUp) => topUp.status === "SUCCEEDED").length;
  useRefreshWhenPaid(paidCount);

  const data = wallet.data;
  if (!data) {
    return wallet.isError ? <p className="text-ink-soft">{"Your wallet isn't available right now."}</p> : <PageSkeleton />;
  }
  const status = WALLET_STATUS_DISPLAY[data.status];
  const low = data.lowBalanceThresholdMinor > 0 && data.balanceMinor < data.lowBalanceThresholdMinor;
  const pending = topUps.data?.find((topUp) => topUp.id === returning && topUp.status === "PENDING");

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Wallet"
        title="Your wallet"
        lead={`Add funds before you send stock. Stocking, storage and fulfilment are taken from here in ${data.currency}, and every charge is listed below.`}
        action={<ExportButton kind="ledger" label="Download statement" />}
      />
      {returning && !cancelled ? (
        <NotebookNote tone="lime" tilt="none" className="max-w-[640px]">
          {pending ? "Thanks. We're waiting for your card payment to clear — this page updates on its own." : "Thanks. Your top-up has been added."}
        </NotebookNote>
      ) : null}
      {cancelled ? (
        <NotebookNote tone="pink" tilt="none" className="max-w-[640px]">
          The payment was cancelled and nothing was charged.
        </NotebookNote>
      ) : null}
      {data.status !== "ACTIVE" ? (
        <NotebookNote tone="pink" tilt="none" className="max-w-[640px]">
          <Stamp className="text-cocoa">{status.label}</Stamp>
          <p className="mt-2 text-small">{status.note}</p>
        </NotebookNote>
      ) : null}
      <StatTileGrid>
        <StatTile
          tone={low ? "orange" : "lime"}
          label="Balance"
          value={formatMoney(data.balanceMinor, data.currency, locale)}
          note={low ? "Below your alert level" : `Held in ${data.currency}`}
          dots={["yellow"]}
        />
        <StatTile
          tone="sky"
          label="Low balance alert"
          value={data.lowBalanceThresholdMinor > 0 ? formatMoney(data.lowBalanceThresholdMinor, data.currency, locale) : "Off"}
          note="We email you when the balance drops below this"
          dots={["pink", "orange"]}
        />
        <StatTile tone="yellow" label="Status" value={status.label} note={status.note} dots={["teal"]} />
        <StatTile tone="pink" label="Top-ups" value={paidCount ?? 0} note="Paid by card" dots={["lime", "orange"]} />
      </StatTileGrid>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5">
          <section aria-labelledby="activity-heading" className="flex flex-col gap-3">
            <h2 id="activity-heading" className="text-h3">
              Activity
            </h2>
            <LedgerTable entries={ledger.data ?? []} currency={data.currency} locale={locale} loading={ledger.isLoading} />
          </section>
          <TopUpHistory topUps={topUps.data ?? []} locale={locale} />
        </div>
        <div className="flex flex-col gap-5">
          {canManage ? <TopUpCard currency={data.currency} locale={locale} disabled={data.status === "CLOSED" || data.status === "FROZEN"} /> : null}
          {canManage ? <AlertSettings currency={data.currency} current={data.lowBalanceThresholdMinor} /> : null}
          {fees.data ? <FeeSummary schedule={fees.data.schedule} currency={fees.data.currency} locale={locale} /> : null}
        </div>
      </div>
    </div>
  );
}

function TopUpHistory({ topUps, locale }: { topUps: readonly TopUpView[]; locale: string }) {
  if (topUps.length === 0) {
    return null;
  }
  const columns: Column<TopUpView>[] = [
    { key: "when", header: "Started", render: (topUp) => <span className="whitespace-nowrap text-ink-soft">{formatDateTime(topUp.createdAt, locale)}</span> },
    { key: "status", header: "Status", render: (topUp) => <StatusPill tone={TOP_UP_STATUS_DISPLAY[topUp.status].tone}>{TOP_UP_STATUS_DISPLAY[topUp.status].label}</StatusPill> },
    { key: "net", header: "Added", align: "right", render: (topUp) => formatMoney(topUp.netMinor, topUp.currency, locale) },
    { key: "gross", header: "Card charged", align: "right", render: (topUp) => formatMoney(topUp.grossMinor, topUp.currency, locale) },
  ];
  return (
    <section aria-labelledby="top-ups-heading" className="flex flex-col gap-3">
      <h2 id="top-ups-heading" className="text-h3">
        Card payments
      </h2>
      <DataTable caption="Card payments" columns={columns} rows={topUps} rowKey={(topUp) => topUp.id} />
    </section>
  );
}

function AlertSettings({ currency, current }: { currency: string; current: number }) {
  const save = useWalletSettings();
  const [value, setValue] = useState(toMajorText(current, currency));
  const [problem, setProblem] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const minor = value.trim() === "" ? 0 : toMinor(value, currency);
    if (minor === null) {
      setProblem("Enter an amount, or 0 to turn alerts off.");
      return;
    }
    setProblem(null);
    save.mutate(minor, { onSuccess: () => toast.success("Alert saved", minor === 0 ? "Low balance emails are off." : undefined) });
  }
  return (
    <Paper className="px-6 py-6">
      <Stamp>Low balance alert</Stamp>
      <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <FormAlert message={problem ?? formError(save.error)} />
        <MoneyField label="Email me below" currency={currency} value={value} onChange={setValue} hint="Set to 0 to turn alerts off." error={fieldError(save.error, "lowBalanceThresholdMinor")} />
        <Button type="submit" variant="ghost" loading={save.isPending}>
          Save alert
        </Button>
      </form>
    </Paper>
  );
}
