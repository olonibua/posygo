"use client";

import type { LabelView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Field, Select } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LabelSheet } from "@/features/stock/label-sheet";
import { apiRequest } from "@/lib/api/client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const COPY_OPTIONS = [1, 2, 5, 10, 20, 50];

export function ProductLabelsPage() {
  const ids = (useSearchParams().get("ids") ?? "")
    .split(",")
    .filter((id) => UUID.test(id))
    .slice(0, 200);
  const [copies, setCopies] = useState(1);
  const labels = useQuery({
    queryKey: ["vendor", "labels", ids],
    queryFn: () => apiRequest<LabelView[]>("/v1/vendor/inventory/labels", { method: "POST", body: { productIds: ids } }),
    enabled: ids.length > 0,
  });

  return (
    <div className="flex flex-col gap-7">
      <div className="print:hidden">
        <PageHeader stamp="Products" title="Product labels" lead="Stick one on every unit before it ships, so the hub can scan it on arrival." />
      </div>
      <div className="max-w-[220px] print:hidden">
        <Field label="Copies of each">
          {({ id }) => (
            <Select id={id} value={copies} onChange={(event) => setCopies(Number(event.target.value))}>
              {COPY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      {ids.length === 0 ? <EmptyState title="No products chosen" body="Pick products on the Products page, then choose Print labels." /> : null}
      {labels.data ? <LabelSheet labels={labels.data} copies={copies} /> : null}
    </div>
  );
}
