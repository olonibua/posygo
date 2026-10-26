"use client";

import type { ActivationReadiness, PartnerLedgerEntryView, PartnerStatementView, PartnerStatus, ScorecardView, StatementRange } from "@/shared";

import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";

import { ENTRY_TYPE_LABELS, PARTNER_STATUS_DISPLAY, READINESS_LABELS } from "./partner-display";

const NOTE_TONE: Record<PartnerStatus, "sky" | "yellow" | "lime" | "pink"> = {
  APPLIED: "sky",
  VERIFYING: "sky",
  UNDER_REVIEW: "yellow",
  ACTIVE: "lime",
  SUSPENDED: "pink",
  OFFBOARDING: "yellow",
  TERMINATED: "pink",
  REJECTED: "pink",
};

export function PartnerStatusNote({ status, reason }: { status: PartnerStatus; reason: string | null }) {
  const display = PARTNER_STATUS_DISPLAY[status];
  return (
    <NotebookNote tone={NOTE_TONE[status]} tilt="none" className="py-4 pl-[42px] pr-5 text-small">
      <span className="flex flex-wrap items-center gap-2">
        <StatusPill tone={display.tone}>{display.label}</StatusPill>
        <span>{display.note}</span>
      </span>
      {reason ? <span className="mt-2 block text-ink-soft">Note from our team: {reason}</span> : null}
    </NotebookNote>
  );
}

export function ReadinessList({ readiness, optional }: { readiness: ActivationReadiness; optional: { deposit: boolean; insurance: boolean } }) {
  const entries = (Object.entries(READINESS_LABELS) as Array<[keyof ActivationReadiness, string]>).filter(
    ([key]) => !(key === "deposit" && optional.deposit) && !(key === "insurance" && optional.insurance),
  );
  return (
    <Paper className="px-6 py-5">
      <Stamp>Ready to approve</Stamp>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {entries.map(([key, label]) => (
          <li key={key} className="flex items-center gap-2.5 text-small">
            <span
              aria-hidden
              className={cn("grid h-6 w-6 place-items-center rounded-full text-[13px]", readiness[key] ? "bg-lime text-ink" : "bg-paper text-ink-faint shadow-[inset_0_0_0_1.5px_var(--line-strong)]")}
            >
              {readiness[key] ? "✓" : ""}
            </span>
            <span className={readiness[key] ? "text-ink" : "text-ink-soft"}>{label}</span>
            <span className="sr-only">{readiness[key] ? "done" : "still needed"}</span>
          </li>
        ))}
      </ul>
    </Paper>
  );
}

export function StatementPanel({
  statement,
  range,
  onRange,
  locale,
  loading,
}: {
  statement: PartnerStatementView | undefined;
  range: StatementRange;
  onRange: (range: StatementRange) => void;
  locale: string;
  loading: boolean;
}) {
  const currency = statement?.currency ?? "GBP";
  const money = (amount: number) => formatMoney(amount, currency, locale);
  const columns: Column<PartnerLedgerEntryView>[] = [
    { key: "when", header: "When", render: (entry) => <span className="whitespace-nowrap text-ink-soft">{formatDateTime(entry.createdAt, locale)}</span> },
    {
      key: "what",
      header: "What",
      render: (entry) => (
        <span>
          <span className="block font-medium">{ENTRY_TYPE_LABELS[entry.type]}</span>
          <span className="text-meta text-ink-faint">
            {entry.description}
            {entry.releaseOn ? ` · released ${formatDate(entry.releaseOn, locale)}` : ""}
          </span>
        </span>
      ),
    },
    { key: "bucket", header: "Balance", render: (entry) => <StatusPill tone={entry.bucket === "HELD" ? "yellow" : "lime"}>{entry.bucket === "HELD" ? "Held" : "Available"}</StatusPill> },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (entry) => (
        <span className={cn("font-medium tabular-nums", entry.amountMinor > 0 ? "text-success" : "text-ink")}>
          {entry.amountMinor > 0 ? "+" : "−"}
          {money(Math.abs(entry.amountMinor))}
        </span>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-5">
      <StatTileGrid>
        <StatTile label="Available" value={money(statement?.availableMinor ?? 0)} note="Ready to be paid out" tone="lime" dots={["teal"]} />
        <StatTile label="Held back" value={money(statement?.heldMinor ?? 0)} note="Released after the holdback period" tone="yellow" />
        <StatTile label="Earned in range" value={money(statement?.earnedMinor ?? 0)} tone="sky" />
        <StatTile label="Paid in range" value={money(statement?.paidMinor ?? 0)} tone="teal" />
      </StatTileGrid>
      <div className="grid max-w-md grid-cols-2 gap-3">
        <Field label="From">
          {({ id }) => <Input id={id} type="date" value={range.from ?? statement?.from ?? ""} onChange={(event) => onRange({ ...range, from: event.target.value || undefined })} />}
        </Field>
        <Field label="To">{({ id }) => <Input id={id} type="date" value={range.to ?? statement?.to ?? ""} onChange={(event) => onRange({ ...range, to: event.target.value || undefined })} />}</Field>
      </div>
      {statement && statement.awaitingEvidence.length > 0 ? (
        <NotebookNote tone="yellow" tilt="none" className="py-4 pl-[42px] pr-5 text-small">
          <b className="font-medium">Waiting for a dispatch photo.</b> Pay for these orders is held until a photo of the sealed parcel is added from the order page:{" "}
          {statement.awaitingEvidence.map((order) => order.reference).join(", ")}
        </NotebookNote>
      ) : null}
      <DataTable
        caption="Earnings"
        columns={columns}
        rows={statement?.entries ?? []}
        rowKey={(entry) => entry.id}
        loading={loading}
        empty={<EmptyState title="Nothing in this range" body="Receiving, pick and pack, and storage earnings appear here as the work is done." />}
      />
    </div>
  );
}

function share(value: number | null, suffix = "%"): string {
  return value === null ? "—" : `${value.toLocaleString("en-GB", { maximumFractionDigits: 1 })}${suffix}`;
}

export function ScorecardPanel({ scorecard, tierName }: { scorecard: ScorecardView | undefined; tierName: string }) {
  if (!scorecard) {
    return null;
  }
  const next = scorecard.nextTier;
  return (
    <div className="flex flex-col gap-4">
      <StatTileGrid>
        <StatTile label="Orders shipped" value={String(scorecard.ordersShipped)} note={`${scorecard.cleanOrders} with full evidence`} tone="sky" />
        <StatTile label="Photo evidence" value={share(scorecard.evidenceCompliancePct)} note="Orders with a dispatch photo" tone="lime" />
        <StatTile label="Dispatch time" value={share(scorecard.medianDispatchHours, " h")} note="Median, order to hand-off" tone="teal" />
        <StatTile
          label="Count accuracy"
          value={share(scorecard.countAccuracyPct)}
          note={`${scorecard.countsMatched} matched · ${scorecard.countsFlagged} flagged · ${scorecard.countsMissed} missed`}
          tone="yellow"
        />
        <StatTile label="Damage and loss" value={share(scorecard.lossRatePct)} note={`${scorecard.shortUnits} units short or damaged`} tone="pink" />
        {scorecard.mysteryPassed === null ? null : <StatTile label="Test orders" value={`${scorecard.mysteryPassed} passed`} note={`${scorecard.mysteryFailed ?? 0} failed`} tone="cocoa" />}
      </StatTileGrid>
      <Paper className="px-6 py-5 text-small">
        <Stamp>Tier · {tierName}</Stamp>
        {next ? (
          <p className="mt-2">
            Next: <b className="font-medium">{next.name}</b>.{" "}
            {next.blocked
              ? `On hold: ${next.blocked.toLowerCase()}.`
              : [
                  next.ordersNeeded > 0 ? `${next.ordersNeeded} more clean orders` : null,
                  next.countsNeeded > 0 ? `${next.countsNeeded} more matched counts` : null,
                  next.daysNeeded > 0 ? `${next.daysNeeded} more days` : null,
                ]
                  .filter(Boolean)
                  .join(", ") || "Ready to move up at the next daily check."}
          </p>
        ) : (
          <p className="mt-2">You&apos;re on the highest tier.</p>
        )}
      </Paper>
    </div>
  );
}
