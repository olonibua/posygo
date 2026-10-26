"use client";

import { hasPermission, type ProductStatus, type ProductView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { PRODUCTS_KEY } from "./product-editor-page";

export function ProductsPage() {
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "vendor.stock.manage");
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const products = useQuery({ queryKey: [...PRODUCTS_KEY, "list", status], queryFn: () => apiRequest<ProductView[]>(`/v1/vendor/products?status=${status}`) });

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const columns: Column<ProductView>[] = [
    {
      key: "select",
      header: "Labels",
      render: (row) => (
        <input type="checkbox" aria-label={`Select ${row.name} for labels`} className="h-[18px] w-[18px] accent-[var(--cocoa)]" checked={selected.has(row.id)} onChange={() => toggle(row.id)} />
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <span>
          <span className="block font-medium">{row.name}</span>
          <span className="font-mono text-meta text-ink-faint">{row.code}</span>
        </span>
      ),
    },
    { key: "tier", header: "Storage", render: (row) => STORAGE_TIER_LABELS[row.storageTier].label },
    { key: "available", header: "Available", align: "right", render: (row) => <span className="tabular-nums">{row.stock.available}</span> },
    { key: "damaged", header: "Damaged", align: "right", render: (row) => <span className={row.stock.damaged > 0 ? "font-semibold text-danger" : ""}>{row.stock.damaged}</span> },
    { key: "status", header: "Status", render: (row) => (row.status === "ACTIVE" ? <StatusPill tone="lime">Active</StatusPill> : <StatusPill tone="cocoa">Archived</StatusPill>) },
    { key: "open", header: "", align: "right", render: (row) => <OpenLink href={`/products/${row.id}`} /> },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Products"
        title="Your catalogue"
        lead="Everything you send to a hub starts here. Codes and barcodes help the team count your stock correctly."
        action={
          canManage ? (
            <ButtonLink href="/products/new" variant="yellow" size="lg">
              Add a product →
            </ButtonLink>
          ) : null
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          label="Filter products"
          value={status}
          onChange={(next) => {
            setStatus(next);
            setSelected(new Set());
          }}
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "ARCHIVED", label: "Archived" },
          ]}
        />
        <ButtonLink
          href={`/products/labels?ids=${[...selected].join(",")}`}
          variant="ghost"
          aria-disabled={selected.size === 0}
          className={selected.size === 0 ? "pointer-events-none opacity-60" : undefined}
        >
          Print labels{selected.size > 0 ? ` (${selected.size})` : ""}
        </ButtonLink>
      </div>
      <DataTable
        caption="Products"
        columns={columns}
        rows={products.data ?? []}
        rowKey={(row) => row.id}
        empty={
          products.isLoading ? (
            "Loading products…"
          ) : (
            <EmptyState
              title={status === "ACTIVE" ? "No products yet" : "Nothing archived"}
              body={status === "ACTIVE" ? "Add the products you plan to send so you can declare them on a shipment." : "Products you archive will show up here."}
            />
          )
        }
      />
    </div>
  );
}
