"use client";

import { hasPermission, type ReconciliationReportView } from "@/shared";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { FormAlert } from "@/components/ui/form-controls";
import { EmptyState, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Stamp } from "@/components/ui/surfaces";
import { errorMessage } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime } from "@/lib/format";

import { FinanceTabs } from "./finance-tabs";
import { useReconciliation } from "./use-finance";

const LOCALE = "en-GB";

export function ReconciliationPage() {
  const user = useCurrentUser();
  const { reports, run } = useReconciliation();
  const latest = reports.data?.[0];
  const columns: Column<ReconciliationReportView>[] = [
    { key: "when", header: "Checked", render: (report) => formatDateTime(report.ranAt, LOCALE) },
    { key: "wallets", header: "Wallets", align: "right", render: (report) => report.walletsChecked },
    {
      key: "result",
      header: "Result",
      render: (report) => (report.mismatches.length === 0 ? <StatusPill tone="lime">All match</StatusPill> : <StatusPill tone="pink">{`${report.mismatches.length} to investigate`}</StatusPill>),
    },
  ];
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Finance"
        title="Reconciliation"
        lead="Every night at 03:00 UTC each wallet balance is checked against the sum of its ledger. Any difference is logged for investigation."
        action={
          hasPermission(user.role, "finance.approve") ? (
            <Button variant="yellow" loading={run.isPending} onClick={() => run.mutate(undefined)}>
              Check now
            </Button>
          ) : null
        }
      />
      <FinanceTabs current="reconciliation" />
      <FormAlert message={errorMessage(run.error)} />
      {latest && latest.mismatches.length > 0 ? (
        <NotebookNote tone="pink" tilt="none" className="max-w-[720px]">
          <Stamp className="text-cocoa">Latest check found differences</Stamp>
          <ul className="mt-2 flex flex-col gap-2 text-small">
            {latest.mismatches.map((mismatch) => (
              <li key={mismatch.walletId} className="flex items-center justify-between gap-4">
                <span className="tabular-nums">
                  Balance {mismatch.balanceMinor} vs ledger {mismatch.ledgerSumMinor} (minor units)
                </span>
                <OpenLink href={`/admin/finance/wallets/${mismatch.walletId}`} />
              </li>
            ))}
          </ul>
        </NotebookNote>
      ) : null}
      <DataTable
        caption="Reconciliation checks"
        columns={columns}
        rows={reports.data ?? []}
        rowKey={(report) => report.id}
        loading={reports.isLoading}
        empty={<EmptyState title="No checks yet" body="The first check runs tonight, or press Check now." />}
      />
    </div>
  );
}
