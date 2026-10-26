"use client";

import { type CustodyAlertView, hasPermission } from "@/shared";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime, localeFor } from "@/lib/format";

import { ALERT_DISPLAY } from "./custody-display";
import { useCustodyAlerts, useCustodyMutation } from "./use-custody";

type Filter = "OPEN" | "RESOLVED";

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "OPEN", label: "Needs a look" },
  { value: "RESOLVED", label: "Resolved" },
];

export function CustodyAlertsPage() {
  const [filter, setFilter] = useState<Filter>("OPEN");
  const alerts = useCustodyAlerts(filter);
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Trust"
        title="Custody alerts"
        lead="Early warnings from across the network: parcels the carrier never scanned, counts that came up short, hubs losing stock, and hubs paused for low trust."
      />
      <FilterTabs label="Filter alerts" options={FILTERS} value={filter} onChange={setFilter} />
      {alerts.isLoading ? (
        <LoadingRows columns={3} />
      ) : (alerts.data ?? []).length === 0 ? (
        <EmptyState title={filter === "OPEN" ? "All quiet" : "Nothing resolved yet"} body="Alerts are raised by the daily checks and by stock counts." />
      ) : (
        <ul className="stagger grid gap-3 lg:grid-cols-2">
          {alerts.data!.map((alert) => (
            <li key={alert.id} className="motion-rise">
              <AlertCard alert={alert} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AlertCard({ alert }: { alert: CustodyAlertView }) {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const resolve = useCustodyMutation<string, CustodyAlertView>((text) => ({ path: `/v1/admin/custody-alerts/${alert.id}/resolve`, body: { note: text } }), "Alert resolved");
  const display = ALERT_DISPLAY[alert.kind];
  const canResolve = alert.status === "OPEN" && hasPermission(user.role, "claims.assess");
  return (
    <Paper className="motion-lift flex h-full flex-col gap-3 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusPill tone={display.tone}>{display.label}</StatusPill>
        <span className="text-meta text-ink-faint">{formatDateTime(alert.createdAt, localeFor(alert.countryCode))}</span>
      </div>
      <p className="text-body">{alert.message}</p>
      {alert.partnerId ? (
        <Link href={`/admin/partners/${alert.partnerId}`} className="text-small font-medium underline decoration-line-strong underline-offset-4">
          {alert.partnerName}
          {alert.warehouseName ? ` · ${alert.warehouseName}` : ""}
        </Link>
      ) : null}
      {alert.resolutionNote ? <p className="rounded-card bg-cream px-3.5 py-2.5 text-small">Resolved: {alert.resolutionNote}</p> : null}
      {canResolve && !open ? (
        <div className="mt-auto flex justify-end">
          <Button variant="ghost" onClick={() => setOpen(true)}>
            Resolve
          </Button>
        </div>
      ) : null}
      {canResolve && open ? (
        <div className="motion-rise flex flex-col gap-3 border-t border-line pt-3">
          <FormAlert message={formError(resolve.error)} />
          <Field label="What you did" error={fieldError(resolve.error, "note")}>
            {({ id, invalid }) => <Textarea id={id} aria-invalid={invalid} className="min-h-[72px]" value={note} onChange={(event) => setNote(event.target.value)} />}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="lime" loading={resolve.isPending} onClick={() => resolve.mutate(note)}>
              Mark resolved
            </Button>
          </div>
        </div>
      ) : null}
    </Paper>
  );
}
