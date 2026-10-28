"use client";

import type { ProductRowView } from "@/shared";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import type { Column } from "@/components/ui/data-table";
import { formatDate } from "@/lib/format";

import { pageCount, STOCK_STATE_DISPLAY } from "./vendor-display";

export function DirectoryPager({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const pages = pageCount(total, pageSize);
  if (pages <= 1) {
    return null;
  }
  return (
    <nav aria-label="Pages" className="flex items-center justify-end gap-3 text-small">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="text-ink-soft">
        Page {page} of {pages}
      </span>
      <Button variant="ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </nav>
  );
}

export function productColumns({ showVendor }: { showVendor: boolean }): Column<ProductRowView>[] {
  const columns: Column<ProductRowView>[] = [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <span>
          <span className="block font-medium">
            {row.name}
            {row.variantLabel ? <span className="text-ink-soft"> · {row.variantLabel}</span> : null}
          </span>
          <span className="font-mono text-meta text-ink-faint">{row.code}</span>
        </span>
      ),
    },
    {
      key: "vendor",
      header: "Vendor",
      render: (row) => (
        <Link href={`/admin/vendors/${row.vendorId}`} className="text-ink">
          {row.businessName}
        </Link>
      ),
    },
    {
      key: "added",
      header: "Added by",
      render: (row) => (
        <span>
          <span className="block">{row.addedByEmail ?? <span className="text-ink-faint">Not recorded</span>}</span>
          <span className="text-meta text-ink-faint">{formatDate(row.addedAt, "en-GB")}</span>
        </span>
      ),
    },
    { key: "stock", header: "Stock", render: (row) => <StatusPill tone={STOCK_STATE_DISPLAY[row.stockState].tone}>{STOCK_STATE_DISPLAY[row.stockState].label}</StatusPill> },
    { key: "stored", header: "In storage", align: "right", render: (row) => row.unitsInStorage },
    { key: "incoming", header: "On the way", align: "right", render: (row) => row.unitsOnTheWay },
  ];
  return showVendor ? columns : columns.filter((column) => column.key !== "vendor");
}
