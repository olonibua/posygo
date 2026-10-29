"use client";

import type { ExportKind } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { type RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { Icon } from "@/components/ui/icon";
import { useAnchorPlacement } from "@/components/ui/use-anchor-placement";
import { errorMessage } from "@/features/receiving/api-errors";
import { useCountryScope } from "@/features/seller-countries/selected-country";
import { downloadCsv } from "@/lib/api/download";
import { cn } from "@/lib/cn";

const DAY_MS = 86_400_000;
const GAP = 10;
const WIDTH = 380;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

interface Range {
  from: string;
  to: string;
}

const PRESETS: ReadonlyArray<{ label: string; range: () => Range }> = [
  { label: "Last 7 days", range: () => daysBack(7) },
  { label: "Last 30 days", range: () => daysBack(30) },
  { label: "Last 90 days", range: () => daysBack(90) },
  { label: "This year", range: () => ({ from: `${new Date().getUTCFullYear()}-01-01`, to: isoDay(new Date()) }) },
];

const PANEL_TITLES: Record<ExportKind, string> = { orders: "Download orders", ledger: "Download statement", inventory: "Download stock" };

function daysBack(days: number): Range {
  return { from: isoDay(new Date(Date.now() - days * DAY_MS)), to: isoDay(new Date()) };
}

function rangeLabel({ from, to }: Range): string {
  const format = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  return `${format(from)} – ${format(to)}`;
}

function useDownload(kind: ExportKind, onDone: () => void) {
  const { code, path } = useCountryScope();
  const prefix = `${kind}-${(code ?? "").toLowerCase()}`;
  return useMutation({
    mutationFn: (range: Range | null) =>
      range
        ? downloadCsv(path(`/v1/vendor/exports/${kind}.csv?from=${range.from}&to=${range.to}`), `${prefix}-${range.from}-to-${range.to}.csv`)
        : downloadCsv(path(`/v1/vendor/exports/${kind}.csv`), `${prefix}-${isoDay(new Date())}.csv`),
    onSuccess: onDone,
  });
}

export function ExportButton({ kind, label, className }: { kind: ExportKind; label: string; className?: string }) {
  const dated = kind !== "inventory";
  const anchor = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const download = useDownload(kind, () => setOpen(false));

  return (
    <span ref={anchor} className={cn("inline-flex flex-col items-end gap-1", className)}>
      <Button
        variant="ghost"
        data-export-trigger
        aria-expanded={dated ? open : undefined}
        aria-haspopup={dated ? "dialog" : undefined}
        loading={!dated && download.isPending}
        onClick={() => (dated ? setOpen(!open) : download.mutate(null))}
      >
        {label}
        {dated ? <Icon name="chevronDown" className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} /> : null}
      </Button>
      {dated ? null : <FormAlert message={errorMessage(download.error)} />}
      {dated && open ? <RangePanel anchor={anchor} title={PANEL_TITLES[kind]} download={download} onClose={() => setOpen(false)} /> : null}
    </span>
  );
}

interface RangePanelProps {
  anchor: RefObject<HTMLSpanElement | null>;
  title: string;
  download: ReturnType<typeof useDownload>;
  onClose: () => void;
}

function RangePanel({ anchor, title, download, onClose }: RangePanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const place = useAnchorPlacement(anchor, GAP, WIDTH);
  const [range, setRange] = useState<Range>(() => daysBack(30));
  close.current = onClose;
  const preset = PRESETS.find((item) => {
    const candidate = item.range();
    return candidate.from === range.from && candidate.to === range.to;
  });
  const valid = Boolean(range.from && range.to && range.from <= range.to);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && close.current();
    const closeOnTapOutside = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!panel.current?.contains(target) && !target?.closest("[data-export-trigger]")) {
        close.current();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnTapOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnTapOutside);
    };
  }, []);

  if (!place) {
    return null;
  }
  return createPortal(
    <div
      ref={panel}
      role="dialog"
      aria-label={title}
      style={{ top: place.top, right: place.right }}
      className="motion-pop absolute z-[45] w-[min(380px,calc(100vw-32px))] rounded-[18px] border border-line bg-white p-5 shadow-[0_24px_60px_-18px_#11111140] print:hidden"
    >
      <div className="flex items-center justify-between">
        <b className="text-body font-semibold">{title}</b>
        <span className="rounded-full bg-paper-sunk px-2.5 py-1 text-[12px] font-semibold text-ink-soft">CSV</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={preset === item}
            onClick={() => setRange(item.range())}
            className={cn(
              "rounded-chip border px-3 py-1.5 text-[13px] font-medium transition-colors duration-200",
              preset === item ? "border-ink bg-ink text-on-ink" : "border-line-strong bg-paper text-ink hover:border-ink-faint",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label="From">
          {({ id }) => <Input id={id} type="date" className="px-3" value={range.from} max={range.to} onChange={(event) => setRange({ ...range, from: event.target.value })} />}
        </Field>
        <Field label="To">
          {({ id }) => <Input id={id} type="date" className="px-3" value={range.to} min={range.from} onChange={(event) => setRange({ ...range, to: event.target.value })} />}
        </Field>
      </div>

      <p className="mt-3 text-[13px] text-ink-faint">{valid ? rangeLabel(range) : "Pick a start date before the end date."}</p>
      <div className="mt-3">
        <FormAlert message={errorMessage(download.error)} />
      </div>
      <Button variant="yellow" className="mt-1 w-full justify-center" loading={download.isPending} disabled={!valid} onClick={() => download.mutate(range)}>
        Download
      </Button>
    </div>,
    document.body,
  );
}
