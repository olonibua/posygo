"use client";

import type { StockCountView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FileDrop } from "@/components/ui/file-drop";
import { FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper } from "@/components/ui/surfaces";
import { SkeletonLines } from "@/components/ui/skeleton";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { uploadPrivateFile } from "@/lib/api/uploads";
import { formatDateTime } from "@/lib/format";

import { STOCK_COUNT_DISPLAY } from "../partner-display";
import { useHubStockCounts, useHubStockCountSubmit } from "../use-partners";

const VIDEO = "video/mp4,video/quicktime";

export function HubStockCountsPage() {
  const counts = useHubStockCounts();
  const open = (counts.data ?? []).filter((count) => count.status === "REQUESTED");
  const done = (counts.data ?? []).filter((count) => count.status !== "REQUESTED");
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Your hub" title="Stock counts" lead="Now and then we ask you to count a few items on video. Count what's on the shelf, film it in one take, and send the numbers you see." />
      {counts.isLoading ? <SkeletonLines /> : null}
      {!counts.isLoading && open.length === 0 ? <EmptyState title="Nothing to count" body="We'll email you when we need a count. You'll usually have two days." /> : null}
      {open.map((count) => (
        <CountForm key={count.id} count={count} />
      ))}
      {done.length > 0 ? (
        <Paper className="px-6 py-5">
          <ul className="flex flex-col divide-y divide-line text-small">
            {done.map((count) => (
              <li key={count.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span>
                  {count.lines.length} lines · asked {formatDateTime(count.createdAt, "en-GB")}
                  {count.resolutionNote ? <span className="block text-ink-faint">{count.resolutionNote}</span> : null}
                </span>
                <StatusPill tone={STOCK_COUNT_DISPLAY[count.status].tone}>{STOCK_COUNT_DISPLAY[count.status].label}</StatusPill>
              </li>
            ))}
          </ul>
        </Paper>
      ) : null}
    </div>
  );
}

function CountForm({ count }: { count: StockCountView }) {
  const [videoFileId, setVideoFileId] = useState("");
  const [counted, setCounted] = useState<Record<string, string>>({});
  const submit = useHubStockCountSubmit();
  const complete = count.lines.every((line) => counted[line.id]?.trim());
  const send = () => submit.mutate({ id: count.id, videoFileId, lines: count.lines.map((line) => ({ lineId: line.id, countedQuantity: Number(counted[line.id]) })) });

  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body font-semibold">Due {formatDateTime(count.dueAt, "en-GB")}</p>
        <StatusPill tone="yellow">Waiting for your count</StatusPill>
      </div>
      {count.note ? <p className="text-small text-ink-soft">{count.note}</p> : null}
      <FormAlert message={formError(submit.error) ?? fieldError(submit.error, "lines") ?? null} />
      <table className="w-full text-small">
        <thead>
          <tr className="text-left text-ink-faint">
            <th className="py-2 font-normal">Item</th>
            <th className="py-2 font-normal">Where</th>
            <th className="w-32 py-2 font-normal">You counted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {count.lines.map((line) => (
            <tr key={line.id}>
              <td className="py-2">
                <span className="block font-medium">{line.productName}</span>
                <span className="font-mono text-meta text-ink-faint">
                  {line.productCode} · lot {line.lotCode}
                </span>
              </td>
              <td className="py-2">{line.location ?? "—"}</td>
              <td className="py-2">
                <Input
                  aria-label={`Count for ${line.productName}`}
                  inputMode="numeric"
                  value={counted[line.id] ?? ""}
                  onChange={(event) => setCounted((current) => ({ ...current, [line.id]: event.target.value.replace(/\D/g, "") }))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <FileDrop
        label="Video of the count"
        hint="MP4 or MOV, up to 200 MB. Show each item and its label."
        accept={VIDEO}
        error={fieldError(submit.error, "videoFileId")}
        onFile={async (file) => setVideoFileId(await uploadPrivateFile(file, "STOCK_COUNT"))}
      />
      <div className="flex justify-end">
        <Button variant="lime" loading={submit.isPending} disabled={!videoFileId || !complete} onClick={send}>
          Send count
        </Button>
      </div>
    </Paper>
  );
}
