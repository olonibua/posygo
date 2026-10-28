"use client";

import type { ExportKind } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { errorMessage } from "@/features/receiving/api-errors";
import { useCountryScope } from "@/features/seller-countries/selected-country";
import { downloadCsv } from "@/lib/api/download";
import { cn } from "@/lib/cn";

const DAY_MS = 86_400_000;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

export function ExportButton({ kind, label, className }: { kind: ExportKind; label: string; className?: string }) {
  const dated = kind !== "inventory";
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(() => ({ from: isoDay(new Date(Date.now() - 30 * DAY_MS)), to: isoDay(new Date()) }));
  const { code, path } = useCountryScope();
  const prefix = `${kind}-${(code ?? "").toLowerCase()}`;
  const download = useMutation({
    mutationFn: () =>
      dated
        ? downloadCsv(path(`/v1/vendor/exports/${kind}.csv?from=${range.from}&to=${range.to}`), `${prefix}-${range.from}-to-${range.to}.csv`)
        : downloadCsv(path(`/v1/vendor/exports/${kind}.csv`), `${prefix}-${isoDay(new Date())}.csv`),
    onSuccess: () => setOpen(false),
  });

  if (!dated || !open) {
    return (
      <span className={cn("inline-flex flex-col items-end gap-1", className)}>
        <Button variant="ghost" loading={download.isPending} onClick={() => (dated ? setOpen(true) : download.mutate())}>
          {label}
        </Button>
        <FormAlert message={errorMessage(download.error)} />
      </span>
    );
  }
  return (
    <div className={cn("motion-rise flex flex-wrap items-end gap-3 rounded-card border border-line bg-paper px-4 py-3", className)}>
      <Field label="From">
        {({ id }) => <Input id={id} type="date" className="w-[170px]" value={range.from} max={range.to} onChange={(event) => setRange({ ...range, from: event.target.value })} />}
      </Field>
      <Field label="To">{({ id }) => <Input id={id} type="date" className="w-[170px]" value={range.to} min={range.from} onChange={(event) => setRange({ ...range, to: event.target.value })} />}</Field>
      <Button variant="lime" loading={download.isPending} onClick={() => download.mutate()}>
        Download CSV
      </Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Close
      </Button>
      <FormAlert message={errorMessage(download.error)} />
    </div>
  );
}
