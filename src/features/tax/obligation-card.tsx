"use client";

import { TAX_CADENCE_LABELS, type TaxObligationView, type UpdateTaxObligationInput } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper } from "@/components/ui/surfaces";
import { errorMessage } from "@/features/receiving/api-errors";
import { cn } from "@/lib/cn";

import { DueDateForm, FileDeadlineForm } from "./deadline-forms";
import { useTaxChange } from "./tax-api";
import { dueLabel, dueTone, shortDate } from "./tax-display";

type Open = "file" | "date" | null;

export function ObligationCard({ obligation }: { obligation: TaxObligationView }) {
  const [open, setOpen] = useState<Open>(null);
  const update = useTaxChange<UpdateTaxObligationInput>(() => ({ path: `/v1/admin/tax/obligations/${obligation.id}`, method: "PATCH" }));
  const { next } = obligation;
  const last = obligation.history[0];
  const done = !next && obligation.cadence === "ONCE" && last;

  return (
    <Paper role="article" aria-label={obligation.title} className={cn("flex flex-col gap-4 px-6 py-5", !obligation.active && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-body font-semibold">{obligation.title}</h3>
          <p className="text-[13px] text-ink-soft">
            {obligation.authority} · {TAX_CADENCE_LABELS[obligation.cadence]} · {obligation.dueRule}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {obligation.confirmed ? <StatusPill tone="lime">Checked</StatusPill> : <StatusPill tone="sky">To check</StatusPill>}
          {next ? <StatusPill tone={dueTone(next.daysLeft)}>{dueLabel(next.daysLeft)}</StatusPill> : done ? <StatusPill tone="lime">Done</StatusPill> : <StatusPill tone="yellow">No due date</StatusPill>}
        </div>
      </div>
      <p className="text-small text-ink-soft">{obligation.description}</p>
      <dl className="grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-3">
        <Detail label="Next due" value={next ? shortDate(next.dueOn) : "—"} />
        <Detail label="Last filed" value={last?.filedOn ? `${shortDate(last.filedOn)}${last.reference ? ` · ${last.reference}` : ""}` : "—"} />
        <Detail label="Owner" value={obligation.owner ?? "—"} />
      </dl>
      <FormAlert message={errorMessage(update.error)} />
      {obligation.active ? (
        <div className="flex flex-wrap items-center gap-2">
          {next ? (
            <Button variant="yellow" onClick={() => setOpen(open === "file" ? null : "file")}>
              Mark filed
            </Button>
          ) : null}
          {done ? null : (
            <Button variant="ghost" onClick={() => setOpen(open === "date" ? null : "date")}>
              {next ? "Change date" : "Set due date"}
            </Button>
          )}
          {obligation.confirmed ? null : (
            <Button variant="ghost" loading={update.isPending} onClick={() => update.mutate({ confirmed: true })}>
              Mark as checked
            </Button>
          )}
          {obligation.guidanceUrl ? (
            <a href={obligation.guidanceUrl} target="_blank" rel="noreferrer" className="ml-auto text-[13px] font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
              Guidance
            </a>
          ) : null}
        </div>
      ) : null}
      {open === "file" && next ? <FileDeadlineForm obligation={obligation} onClose={() => setOpen(null)} /> : null}
      {open === "date" ? <DueDateForm obligation={obligation} onClose={() => setOpen(null)} /> : null}
    </Paper>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 sm:flex-col sm:gap-0">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
