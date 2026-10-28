"use client";

import { PRODUCT_STOCK_STATES, type ProductStockState } from "@/shared";
import { useDeferredValue, useState } from "react";

import { DataTable } from "@/components/ui/data-table";
import { Field, Input } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";

import { DirectoryPager, productColumns } from "./directory-parts";
import { useProductDirectory } from "./use-vendor-directory";
import { STOCK_STATE_DISPLAY } from "./vendor-display";

type StockFilter = "ALL" | ProductStockState;

const STOCK_FILTERS: ReadonlyArray<{ value: StockFilter; label: string }> = [
  { value: "ALL", label: "All" },
  ...PRODUCT_STOCK_STATES.map((state) => ({ value: state, label: STOCK_STATE_DISPLAY[state].label })),
];

const COLUMNS = productColumns({ showVendor: true });

export function ProductsPage() {
  const [stock, setStock] = useState<StockFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const q = useDeferredValue(search.trim());
  const products = useProductDirectory({ q: q || undefined, stock: stock === "ALL" ? undefined : stock, page });

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Operations" title="Products" lead="Every product vendors have added, who added it, and where its stock is." />
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <FilterTabs
          label="Filter by stock"
          options={STOCK_FILTERS}
          value={stock}
          onChange={(value) => {
            setStock(value);
            setPage(1);
          }}
        />
        <div className="md:w-[300px]">
          <Field label="Search products">
            {({ id }) => (
              <Input
                id={id}
                type="search"
                placeholder="Product name or code"
                value={search}
                maxLength={100}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            )}
          </Field>
        </div>
      </div>
      <DataTable
        caption="Products"
        columns={COLUMNS}
        rows={products.data?.items ?? []}
        rowKey={(row) => row.id}
        loading={products.isLoading}
        empty={<EmptyState title="No products here" body="Products appear here as soon as a vendor adds them." />}
      />
      {products.data ? <DirectoryPager page={products.data.page} pageSize={products.data.pageSize} total={products.data.total} onChange={setPage} /> : null}
    </div>
  );
}
