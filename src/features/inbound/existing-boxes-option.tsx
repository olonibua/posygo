"use client";

import { ChoiceChip } from "@/components/ui/choice-chip";
import { useVendorBoxes, vendorBoxPhotoPath } from "@/features/inventory/storage-boxes";
import { BoxCheckSummary } from "@/features/stock/box-check-summary";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";

import type { InboundFieldProps } from "./inbound-fields";

export function ExistingBoxesOption({ values, set, errorFor }: InboundFieldProps) {
  const boxes = useVendorBoxes();
  const hub = boxes.data?.hubs.find((entry) => entry.warehouseId === values.warehouseId);
  if (!hub || values.shippingMode === "PALLET") {
    return null;
  }
  const summary = hub.boxes.map((group) => `${group.count} ${STORAGE_TIER_LABELS[group.tier].label.toLowerCase()}`).join(", ");
  return (
    <div className="flex flex-col gap-3 rounded-card bg-paper-sunk px-4 py-4">
      <p className="text-small">
        You already have {summary} {hub.boxes.reduce((total, group) => total + group.count, 0) === 1 ? "box" : "boxes"} at {hub.warehouseName} with {hub.unitsStored} units in.
      </p>
      <BoxCheckSummary check={hub.latestCheck} photoPath={vendorBoxPhotoPath} />
      <div>
        <ChoiceChip tone="lime" selected={Boolean(values.intoExistingBoxes)} onToggle={() => set({ intoExistingBoxes: !values.intoExistingBoxes })}>
          Put this shipment in my existing boxes
        </ChoiceChip>
      </div>
      {values.intoExistingBoxes ? (
        <p className="text-meta text-ink-soft">
          Still choose a box below in case it doesn&apos;t fit. You pay for it now, and get it back in full if the hub fits everything into your existing boxes.
        </p>
      ) : null}
      {errorFor("intoExistingBoxes") ? (
        <p role="alert" className="text-meta text-danger">
          {errorFor("intoExistingBoxes")}
        </p>
      ) : null}
    </div>
  );
}
