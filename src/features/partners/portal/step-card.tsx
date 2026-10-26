"use client";

import type { PartnerCheckView, PartnerDetailView } from "@/shared";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Paper } from "@/components/ui/surfaces";
import { formatDateTime } from "@/lib/format";

import { CHECK_DISPLAY, CHECK_STATUS_DISPLAY } from "../partner-display";

export interface StepProps {
  partner: PartnerDetailView;
  check: PartnerCheckView;
  editable: boolean;
  locale: string;
}

export function StepCard({ check, locale, children, extra }: { check: PartnerCheckView; locale: string; children?: ReactNode; extra?: ReactNode }) {
  const display = CHECK_DISPLAY[check.kind];
  const status = CHECK_STATUS_DISPLAY[check.status];
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body font-semibold">{display.label}</p>
          <p className="text-small text-ink-soft">{display.ask}</p>
        </div>
        <span className="shrink-0">
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
        </span>
      </div>
      {check.reviewNote ? <p className="rounded-card bg-yellow px-3.5 py-2.5 text-small">Note from our team: {check.reviewNote}</p> : null}
      {check.submittedAt && !children ? <p className="text-meta text-ink-faint">Sent {formatDateTime(check.submittedAt, locale)}</p> : null}
      {extra}
      {children}
    </Paper>
  );
}

export function useEditing(check: PartnerCheckView) {
  return useState(check.status === "NOT_STARTED" || check.status === "REJECTED");
}

export function Replace({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end">
      <Button variant="ghost" onClick={onClick}>
        Change
      </Button>
    </div>
  );
}
