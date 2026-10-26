"use client";

import { hasPermission, type StockCountView } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Checkbox, Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime } from "@/lib/format";

import { STOCK_COUNT_DISPLAY } from "../partner-display";
import { useAdminPartnerMutation, useAdminStockCount, useAdminStockCounts } from "../use-partners";

type Filter = StockCountView["status"];

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "FLAGGED", label: "Didn't match" },
  { value: "MISSED", label: "Missed" },
  { value: "REQUESTED", label: "Waiting" },
  { value: "MATCHED", label: "Matched" },
];

export function StockCountsPage() {
  const [filter, setFilter] = useState<Filter>("FLAGGED");
  const [selected, setSelected] = useState<string | null>(null);
  const counts = useAdminStockCounts(filter);
  const columns: Column<StockCountView>[] = [
    {
      key: "partner",
      header: "Partner",
      render: (row) => (
        <Link href={`/admin/partners/${row.partnerId}`} className="font-medium text-ink">
          {row.legalName}
          <span className="block text-meta font-normal text-ink-faint">{row.warehouseName}</span>
        </Link>
      ),
    },
    { key: "lines", header: "Lines", render: (row) => `${row.lines.length}${row.mismatchedLines > 0 ? ` · ${row.mismatchedLines} off` : ""}` },
    { key: "due", header: "Due", render: (row) => <span className="text-ink-soft">{formatDateTime(row.dueAt, "en-GB")}</span> },
    { key: "status", header: "Status", render: (row) => <StatusPill tone={STOCK_COUNT_DISPLAY[row.status].tone}>{STOCK_COUNT_DISPLAY[row.status].label}</StatusPill> },
    {
      key: "open",
      header: "",
      align: "right",
      render: (row) => (
        <Button variant="ghost" onClick={() => setSelected(row.id)}>
          Open
        </Button>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Network"
        title="Stock counts"
        lead="Surprise counts filmed by partners. Counts that don't match our records, or aren't sent in time, are flagged for someone to look into and resolve."
      />
      <FilterTabs label="Filter counts" options={FILTERS} value={filter} onChange={setFilter} />
      <DataTable
        caption="Stock counts"
        columns={columns}
        rows={counts.data ?? []}
        rowKey={(row) => row.id}
        loading={counts.isLoading}
        empty={<EmptyState title="Nothing here" body="Request a count from a partner's page." />}
      />
      {selected ? <CountDetail countId={selected} /> : null}
    </div>
  );
}

function CountDetail({ countId }: { countId: string }) {
  const user = useCurrentUser();
  const count = useAdminStockCount(countId);
  const [note, setNote] = useState("");
  const [openClaims, setOpenClaims] = useState(true);
  const resolve = useAdminPartnerMutation<{ note: string; openClaims: boolean }, StockCountView>(
    (input) => ({ path: `/v1/admin/stock-counts/${countId}/resolve`, body: input }),
    (input) => (input.openClaims ? "Count resolved. Claims opened for the missing units." : "Count resolved"),
  );
  const video = useMutation({
    mutationFn: (input: { partnerId: string; fileId: string }) => apiRequest<{ url: string }>(`/v1/admin/partners/${input.partnerId}/files/${input.fileId}`),
    onSuccess: (result) => window.open(result.url, "_blank", "noopener,noreferrer"),
  });
  const data = count.data;
  if (!data) {
    return null;
  }
  const canResolve = hasPermission(user.role, "partners.review") && (data.status === "FLAGGED" || data.status === "MISSED") && !data.resolvedAt;
  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <Stamp>
        {data.legalName} · {data.warehouseName}
      </Stamp>
      <FormAlert message={errorMessage(video.error)} />
      <table className="w-full text-small">
        <thead>
          <tr className="text-left text-ink-faint">
            <th className="py-2 font-normal">Item</th>
            <th className="py-2 text-right font-normal">Our record</th>
            <th className="py-2 text-right font-normal">Counted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.lines.map((line) => (
            <tr key={line.id} className={line.countedQuantity !== null && line.countedQuantity !== line.expectedQuantity ? "bg-pink/40" : undefined}>
              <td className="py-2">
                {line.productName} <span className="font-mono text-meta text-ink-faint">{line.lotCode}</span>
              </td>
              <td className="py-2 text-right tabular-nums">{line.expectedQuantity ?? "—"}</td>
              <td className="py-2 text-right tabular-nums">{line.countedQuantity ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.videoFileId ? (
        <div>
          <Button variant="ghost" loading={video.isPending} onClick={() => data.videoFileId && video.mutate({ partnerId: data.partnerId, fileId: data.videoFileId })}>
            Watch the video
          </Button>
        </div>
      ) : null}
      {data.resolutionNote ? (
        <p className="rounded-card bg-cream px-3.5 py-2.5 text-small">
          Resolved: {data.resolutionNote}
          {data.claimsOpened > 0 ? (
            <Link href="/admin/claims" className="ml-1 font-medium underline decoration-line-strong underline-offset-4">
              {data.claimsOpened} {data.claimsOpened === 1 ? "claim" : "claims"} opened
            </Link>
          ) : null}
        </p>
      ) : null}
      {canResolve ? (
        <div className="flex flex-col gap-3 border-t border-line pt-3">
          <FormAlert message={formError(resolve.error)} />
          <Field label="What you found" hint="Recorded on the partner's file." error={fieldError(resolve.error, "note")}>
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[80px]" value={note} onChange={(event) => setNote(event.target.value)} />
            )}
          </Field>
          {data.status === "FLAGGED" ? (
            <Checkbox label="Open claims for the missing units so the vendors' wallets can be credited" checked={openClaims} onChange={(event) => setOpenClaims(event.target.checked)} />
          ) : null}
          <div className="flex justify-end">
            <Button variant="lime" loading={resolve.isPending} onClick={() => resolve.mutate({ note, openClaims: openClaims && data.status === "FLAGGED" }, { onSuccess: () => setNote("") })}>
              Mark resolved
            </Button>
          </div>
        </div>
      ) : null}
    </Paper>
  );
}
