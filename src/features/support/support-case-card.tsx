"use client";

import { errorGuide, type SupportCaseView, type SupportReportView } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field, Textarea } from "@/components/ui/form-controls";
import { Paper } from "@/components/ui/surfaces";
import { fieldError } from "@/features/receiving/api-errors";
import { formatDateTime } from "@/lib/format";

import { useResolveSupportCase, useSupportCase } from "./use-support-cases";

const LOCALE = "en-GB";

function Report({ report }: { report: SupportReportView }) {
  const who = [report.reporter.email ?? "Not signed in", report.reporter.business, report.reporter.role].filter(Boolean).join(" · ");
  return (
    <li className="rounded-card bg-paper-sunk px-4 py-3 text-small">
      <p className="font-medium">{who}</p>
      <p className="text-meta text-ink-soft">
        {formatDateTime(report.at, LOCALE)}
        {report.correlationId ? ` · log reference ${report.correlationId}` : ""}
      </p>
      {report.message ? <p className="mt-2 whitespace-pre-line">{report.message}</p> : null}
      {report.trail.length > 0 ? (
        <ol className="mt-2 list-decimal pl-5 text-meta text-ink-soft">
          {report.trail.map((step) => (
            <li key={`${step.at}-${step.what}`}>{step.what}</li>
          ))}
        </ol>
      ) : null}
    </li>
  );
}

function ResolveForm({ caseId }: { caseId: string }) {
  const [note, setNote] = useState("");
  const resolve = useResolveSupportCase(caseId);
  function submit(event: FormEvent) {
    event.preventDefault();
    resolve.mutate({ note });
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field label="What was done" hint="Shown to everyone who reported it." error={fieldError(resolve.error, "note")}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[80px]" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
        )}
      </Field>
      <div>
        <Button type="submit" variant="yellow" loading={resolve.isPending}>
          Mark as resolved
        </Button>
      </div>
    </form>
  );
}

export function SupportCaseCard({ supportCase, canManage }: { supportCase: SupportCaseView; canManage: boolean }) {
  const [open, setOpen] = useState(false);
  const detail = useSupportCase(supportCase.id, open);
  const side = supportCase.errorCode ? errorGuide(supportCase.errorCode, supportCase.errorStatus ?? 0).side : null;
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-mono text-small font-semibold">{supportCase.reference}</span>
        <Chip size="sm" tone={supportCase.kind === "ERROR" ? "pink" : "sky"}>
          {supportCase.kind === "ERROR" ? "Error" : "Question"}
        </Chip>
        {side === "SYSTEM" ? (
          <Chip size="sm" tone="orange">
            Our side
          </Chip>
        ) : null}
        <span className="ml-auto text-meta text-ink-soft">
          {supportCase.reports} {supportCase.reports === 1 ? "report" : "reports"} · last {formatDateTime(supportCase.lastSeenAt, LOCALE)}
        </span>
      </div>
      <p className="text-small">
        <span className="text-ink-soft">Page </span>
        <span className="font-mono">{supportCase.page}</span>
        {supportCase.errorCode ? (
          <>
            <span className="text-ink-soft"> · </span>
            <span className="font-mono">
              {supportCase.errorCode} ({supportCase.errorStatus}) on {supportCase.endpoint}
            </span>
          </>
        ) : null}
      </p>
      {supportCase.resolutionNote ? <p className="text-small text-ink-soft">Resolved: {supportCase.resolutionNote}</p> : null}
      <div>
        <Button variant="ghost" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          {open ? "Hide details" : "Show details"}
        </Button>
      </div>
      {open && detail.data ? (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {detail.data.reportDetails.map((report) => (
              <Report key={report.id} report={report} />
            ))}
          </ul>
          {canManage && supportCase.status === "OPEN" ? <ResolveForm caseId={supportCase.id} /> : null}
        </div>
      ) : null}
    </Paper>
  );
}
