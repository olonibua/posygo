"use client";

import type { OrderLineView, ScanResultView } from "@/shared";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, errorMessage } from "@/features/receiving/api-errors";
import { cn } from "@/lib/cn";

import { CameraScanner } from "./camera-scanner";

interface ScanPanelProps {
  lines: readonly OrderLineView[];
  remaining: number;
  busy: boolean;
  error: unknown;
  last: ScanResultView | undefined;
  onScan: (code: string) => void;
  onReset: () => void;
}

function resultText(last: ScanResultView | undefined): string | null {
  return last ? `${last.productName}: ${last.scannedQuantity} of ${last.quantity}${last.complete ? " — done" : ""}` : null;
}

export function ScanPanel({ lines, remaining, busy, error, last, onScan, onReset }: ScanPanelProps) {
  const [code, setCode] = useState("");
  const [camera, setCamera] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const unlabelled = lines.filter((line) => line.barcodes.length === 0 && line.lotCodes.length > 0 && line.scannedQuantity < line.quantity);
  const fill = (lotCode: string) => {
    setCode(lotCode);
    input.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!busy && !camera) {
      input.current?.focus({ preventScroll: true });
    }
  }, [busy, camera]);

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
      <p className="mt-2 text-small text-ink-soft">Check every item going in the box by scanning its barcode or the lot label stuck on it when it arrived.</p>

      <Button variant="yellow" size="lg" className="mt-4 w-full justify-center" onClick={() => setCamera(true)}>
        Scan with camera
      </Button>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Barcode or lot label" hint="Or use a barcode reader, or type the code and press Enter.">
            {({ id, describedBy }) => (
              <Input ref={input} id={id} aria-describedby={describedBy} autoComplete="off" value={code} maxLength={64} onChange={(event) => setCode(event.target.value)} className="font-mono" />
            )}
          </Field>
        </div>
        <Button type="submit" variant={code.trim() ? "yellow" : "ghost"} loading={busy} disabled={!code.trim()} className="sm:mb-[22px]">
          Add code
        </Button>
      </form>

      <div aria-live="polite" className="mt-3 min-h-[44px]">
        {problem ? (
          <p className="rounded-card bg-pink px-4 py-2.5 text-small text-cocoa">{problem}</p>
        ) : last ? (
          <p className={cn("rounded-card px-4 py-2.5 text-small text-cocoa", last.complete ? "bg-lime" : "bg-sky")}>{resultText(last)}</p>
        ) : null}
      </div>

      {unlabelled.length > 0 ? (
        <section aria-labelledby="no-barcode" className="mt-3 rounded-card bg-paper-sunk px-4 py-4">
          <p id="no-barcode" className="text-small font-medium">
            No barcode on the product?
          </p>
          <p className="mt-1 text-meta text-ink-soft">Find the lot label on the item and check it matches. Tap the code to put it in the box above, then tap Add code.</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {unlabelled.map((line) => (
              <li key={line.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="min-w-0 text-small">
                  <span className="font-medium">{line.productName}</span>{" "}
                  <span className="text-ink-faint">
                    {line.scannedQuantity} of {line.quantity}
                  </span>
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {line.lotCodes.map((lotCode) => (
                    <button
                      key={lotCode}
                      type="button"
                      onClick={() => fill(lotCode)}
                      aria-pressed={code === lotCode}
                      className={cn(
                        "rounded-[10px] border-[1.5px] px-2.5 py-1.5 font-mono text-[13px] transition-colors duration-200",
                        code === lotCode ? "border-ink bg-white" : "border-line-strong bg-paper hover:border-ink",
                      )}
                    >
                      {lotCode}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-3 text-meta text-ink-faint">{remaining === 0 ? "Everything is scanned. Record the parcel below." : `${remaining} ${remaining === 1 ? "unit" : "units"} still to scan.`}</p>
      {camera ? (
        <CameraScanner
          onCode={(value) => {
            setCamera(false);
            fill(value);
          }}
          onClose={() => setCamera(false)}
        />
      ) : null}
    </Paper>
  );
}
