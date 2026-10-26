"use client";

import type { LabelView } from "@/shared";

import { Button } from "@/components/ui/button";
import { Barcode } from "@/components/ui/barcode";

export function LabelSheet({ labels, copies = 1 }: { labels: readonly LabelView[]; copies?: number }) {
  const sheet = labels.flatMap((label) => Array.from({ length: copies }, (_, index) => ({ ...label, key: `${label.code}-${index}` })));
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end print:hidden">
        <Button onClick={() => window.print()}>Print labels</Button>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-2">
        {sheet.map((label) => (
          <li key={label.key} className="flex break-inside-avoid flex-col gap-1.5 rounded-card border border-line bg-white px-4 py-3 text-black print:rounded-none print:border-black">
            <p className="truncate text-[13px] font-semibold">{label.productName}</p>
            {label.variantLabel ? <p className="truncate text-[12px]">{label.variantLabel}</p> : null}
            <Barcode value={label.barcode} />
            <p className="font-mono text-[12px]">
              {label.code}
              {label.quantity === null ? "" : ` · ${label.quantity} units`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
