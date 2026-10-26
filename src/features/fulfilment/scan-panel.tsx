"use client";

import type { ScanResultView } from "@/shared";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, errorMessage } from "@/features/receiving/api-errors";
import { cn } from "@/lib/cn";

interface ScanPanelProps {
  remaining: number;
  busy: boolean;
  error: unknown;
  last: ScanResultView | undefined;
  onScan: (code: string) => void;
  onReset: () => void;
}

export function ScanPanel({ remaining, busy, error, last, onScan, onReset }: ScanPanelProps) {
  const [code, setCode] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!busy) {
      input.current?.focus();
    }
  }, [busy]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = code.trim();
    if (value) {
      onScan(value);
      setCode("");
    }
  }

  const problem = fieldError(error, "code") ?? (error ? errorMessage(error) : null);
  return (
    <Paper className="px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <Stamp>Scan each unit</Stamp>
        <Button variant="ghost" onClick={onReset} disabled={busy}>
          Start again
        </Button>
      </div>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Barcode or lot label" hint="Scan with the reader, or type the code and press Enter.">
            {({ id, describedBy }) => (
              <Input ref={input} id={id} aria-describedby={describedBy} autoComplete="off" value={code} maxLength={64} onChange={(event) => setCode(event.target.value)} className="font-mono" />
            )}
          </Field>
        </div>
        <Button type="submit" variant="yellow" loading={busy} className="sm:mb-[22px]">
          Scan
        </Button>
      </form>
      <div aria-live="polite" className="mt-3 min-h-[44px]">
        {problem ? (
          <p className="rounded-card bg-pink px-4 py-2.5 text-small text-cocoa">{problem}</p>
        ) : last ? (
          <p className={cn("rounded-card px-4 py-2.5 text-small text-cocoa", last.complete ? "bg-lime" : "bg-sky")}>
            {last.productName}: {last.scannedQuantity} of {last.quantity}
            {last.complete ? " — done" : ""}
          </p>
        ) : null}
      </div>
      <p className="mt-1 text-meta text-ink-faint">{remaining === 0 ? "Everything is scanned. Record the parcel below." : `${remaining} ${remaining === 1 ? "unit" : "units"} still to scan.`}</p>
    </Paper>
  );
}
