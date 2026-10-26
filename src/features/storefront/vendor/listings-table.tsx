"use client";

import type { ListingView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { formError } from "@/features/receiving/api-errors";
import { toMajorText, toMinor } from "@/features/finance/money-input";
import { toast } from "@/lib/toast/toast-store";

import { useListings, useSetListing } from "../use-storefront";

export function ListingsTable({ currency, editable }: { currency: string; editable: boolean }) {
  const listings = useListings();
  const save = useSetListing();
  const [prices, setPrices] = useState<Record<string, string>>({});

  const priceText = (row: ListingView) => prices[row.productId] ?? (row.retailPriceMinor ? toMajorText(row.retailPriceMinor, currency) : "");

  function toggle(row: ListingView, listed: boolean) {
    const retailPriceMinor = toMinor(priceText(row), currency);
    if (listed && !retailPriceMinor) {
      toast.error("Set a price first", `${row.name} needs a price before buyers can see it.`);
      return;
    }
    save.mutate(
      { productId: row.productId, input: { listed, ...(retailPriceMinor ? { retailPriceMinor } : {}) } },
      { onSuccess: () => toast.success(listed ? `${row.name} is in your store` : `${row.name} is hidden from your store`) },
    );
  }

  const columns: Column<ListingView>[] = [
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
    { key: "stock", header: "In stock", align: "right", render: (row) => <span className="tabular-nums">{row.available}</span> },
    {
      key: "price",
      header: `Price (${currency})`,
      render: (row) => (
        <Input
          aria-label={`Price for ${row.name}`}
          inputMode="decimal"
          className="max-w-[140px]"
          disabled={!editable}
          value={priceText(row)}
          onChange={(event) => setPrices((current) => ({ ...current, [row.productId]: event.target.value }))}
          onBlur={() => row.listed && prices[row.productId] !== undefined && toggle(row, true)}
        />
      ),
    },
    { key: "status", header: "In store", render: (row) => (row.listed ? <StatusPill tone="lime">Listed</StatusPill> : <StatusPill tone="sky">Hidden</StatusPill>) },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) =>
        editable ? (
          <Button variant={row.listed ? "ghost" : "lime"} disabled={save.isPending && save.variables?.productId === row.productId} onClick={() => toggle(row, !row.listed)}>
            {row.listed ? "Hide" : "List"}
          </Button>
        ) : null,
    },
  ];

  return (
    <section aria-labelledby="listings-heading" className="flex flex-col gap-3">
      <h2 id="listings-heading" className="text-h3">
        What you sell
      </h2>
      <FormAlert message={formError(save.error)} />
      <DataTable
        caption="Products for your store"
        columns={columns}
        rows={listings.data ?? []}
        rowKey={(row) => row.productId}
        loading={listings.isLoading}
        empty={<EmptyState title="No products yet" body="Add products to your catalogue first, then list them here with a price." />}
      />
    </section>
  );
}
