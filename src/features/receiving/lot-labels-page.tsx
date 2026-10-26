"use client";

import type { LabelView } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LabelSheet } from "@/features/stock/label-sheet";
import { apiRequest } from "@/lib/api/client";

export function LotLabelsPage({ inboundId }: { inboundId: string }) {
  const labels = useQuery({ queryKey: ["warehouse", "inbound", inboundId, "labels"], queryFn: () => apiRequest<LabelView[]>(`/v1/warehouse/inbound/${inboundId}/labels`) });
  return (
    <div className="flex flex-col gap-7">
      <div className="print:hidden">
        <PageHeader stamp="Receiving" title="Lot labels" lead="Stick one label on each lot before putting it away." />
      </div>
      {labels.isError ? <p className="text-ink-soft">These labels aren&apos;t available to you.</p> : null}
      {labels.data && labels.data.length === 0 ? <EmptyState title="No lots yet" body="Labels appear once the shipment has been counted." /> : null}
      {labels.data && labels.data.length > 0 ? <LabelSheet labels={labels.data} /> : null}
    </div>
  );
}
