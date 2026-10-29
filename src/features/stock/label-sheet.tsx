"use client";

import type { LabelView } from "@/shared";
import { type CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Barcode } from "@/components/ui/barcode";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/form-controls";

import { LABEL_SIZES, type LabelSize, labelScale, labelSizeById } from "./label-sizes";

const SIZE_KEY = "posygo.label-size";

interface SheetLabel extends LabelView {
  key: string;
}

function useLabelSize(): [LabelSize, (id: string) => void] {
  const [size, setSize] = useState<LabelSize>(() => labelSizeById(null));
  useEffect(() => {
    try {
      setSize(labelSizeById(window.localStorage.getItem(SIZE_KEY)));
    } catch {
      return;
    }
  }, []);
  const choose = (id: string) => {
    setSize(labelSizeById(id));
    try {
      window.localStorage.setItem(SIZE_KEY, id);
    } catch {
      return;
    }
  };
  return [size, choose];
}

function Label({ label, size }: { label: SheetLabel; size: LabelSize }) {
  const scale = labelScale(size);
  const mm = (value: number) => `${value * scale}mm`;
  const style: CSSProperties = { width: `${size.widthMm}mm`, height: `${size.heightMm}mm`, padding: mm(2.5), gap: mm(1) };
  return (
    <div className="print-label flex flex-col justify-center overflow-hidden bg-white text-black" style={style}>
      <p className="truncate font-semibold leading-tight" style={{ fontSize: mm(3.4) }}>
        {label.productName}
      </p>
      {label.variantLabel ? (
        <p className="truncate leading-tight" style={{ fontSize: mm(2.8) }}>
          {label.variantLabel}
        </p>
      ) : null}
      <div className="w-full [&_svg]:h-full" style={{ height: mm(13) }}>
        <Barcode value={label.barcode} />
      </div>
      <p className="truncate font-mono leading-tight" style={{ fontSize: mm(2.6) }}>
        {label.code}
        {label.quantity === null ? "" : ` · ${label.quantity} units`}
      </p>
    </div>
  );
}

function usePrintedPageSize(size: LabelSize): void {
  useEffect(() => {
    if (typeof CSSStyleSheet === "undefined" || !("adoptedStyleSheets" in document)) {
      return;
    }
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`@page { size: ${size.widthMm}mm ${size.heightMm}mm; margin: 0; }`);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    return () => {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter((adopted) => adopted !== sheet);
    };
  }, [size]);
}

function PrintCopy({ labels, size }: { labels: readonly SheetLabel[]; size: LabelSize }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  usePrintedPageSize(size);
  if (!mounted) {
    return null;
  }
  return createPortal(
    <div id="label-print" aria-hidden>
      {labels.map((label) => (
        <Label key={label.key} label={label} size={size} />
      ))}
    </div>,
    document.body,
  );
}

export function LabelSheet({ labels, copies = 1 }: { labels: readonly LabelView[]; copies?: number }) {
  const [size, chooseSize] = useLabelSize();
  const sheet = labels.flatMap((label) => Array.from({ length: copies }, (_, index) => ({ ...label, key: `${label.code}-${index}` })));
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-[220px]">
          <Field label="Label size" hint="Match the labels in your printer.">
            {({ id, describedBy }) => (
              <Select id={id} aria-describedby={describedBy} value={size.id} onChange={(event) => chooseSize(event.target.value)}>
                {LABEL_SIZES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <Button onClick={() => window.print()}>Print {sheet.length === 1 ? "label" : `${sheet.length} labels`}</Button>
      </div>
      <ul className="flex flex-wrap gap-4">
        {sheet.map((label) => (
          <li key={label.key} className="overflow-hidden rounded-[6px] shadow-[0_0_0_1px_var(--line),0_8px_20px_-14px_#11111159]">
            <Label label={label} size={size} />
          </li>
        ))}
      </ul>
      <PrintCopy labels={sheet} size={size} />
    </div>
  );
}
