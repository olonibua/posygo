"use client";

import type { PartnerDetailView } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";

import { StatusPill } from "@/components/ui/chip";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { AdjustmentForm } from "@/features/finance/adjustment-form";
import { ADJUSTMENT_STATUS_DISPLAY } from "@/features/finance/finance-display";
import { usePartnerAdjustments, useRequestPartnerAdjustment } from "@/features/finance/use-finance";
import { formatDateTime, formatMoney } from "@/lib/format";

import { ADMIN_KEY } from "../use-partners";

export function EarningsAdjustmentsPanel({ partner, locale, canAdjust }: { partner: PartnerDetailView; locale: string; canAdjust: boolean }) {
  const queryClient = useQueryClient();
  const request = useRequestPartnerAdjustment(partner.id);
  const adjustments = usePartnerAdjustments(partner.id);
  const rows = adjustments.data ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {canAdjust ? (
        <AdjustmentForm
          request={request}
          currency={partner.currency}
          locale={locale}
          audience="partner"
          onDone={() => void queryClient.invalidateQueries({ queryKey: [...ADMIN_KEY, partner.id] })}
        />
      ) : null}
      <Paper className="px-6 py-5">
        <Stamp>Adjustments</Stamp>
        {rows.length === 0 ? (
          <p className="mt-2 text-small text-ink-soft">No manual credits or debits yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-line text-small">
            {rows.map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-4 py-3">
                <span className="min-w-0">
                  <span className="block">{row.reason}</span>
                  <span className="text-meta text-ink-faint">
                    {formatDateTime(row.createdAt, locale)} · {row.requestedByEmail}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className={row.direction === "CREDIT" ? "text-success" : undefined}>
                    {row.direction === "CREDIT" ? "+" : "−"}
                    {formatMoney(row.amountMinor, row.currency, locale)}
                  </span>
                  <StatusPill tone={ADJUSTMENT_STATUS_DISPLAY[row.status].tone}>{ADJUSTMENT_STATUS_DISPLAY[row.status].label}</StatusPill>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Paper>
    </div>
  );
}
