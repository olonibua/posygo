import { type InboundDetailView, type InboundInput, type ShippingMode, STORAGE_TIERS, type StorageTier } from "@/shared";

export interface LineRow {
  productId: string;
  quantity: string;
}

export interface InboundValues {
  warehouseId: string;
  shippingMode: ShippingMode;
  expectedArrivalDate: string;
  carrier: string;
  trackingNumber: string;
  boxCounts: Record<StorageTier, string>;
  lines: LineRow[];
  notes: string;
}

const NO_BOXES = Object.fromEntries(STORAGE_TIERS.map((tier) => [tier, ""])) as Record<StorageTier, string>;

export function tiersFor(mode: ShippingMode): readonly StorageTier[] {
  return mode === "PALLET" ? STORAGE_TIERS : STORAGE_TIERS.filter((tier) => tier !== "PALLET");
}

export function emptyInbound(today: string): InboundValues {
  return { warehouseId: "", shippingMode: "LOOSE", expectedArrivalDate: today, carrier: "", trackingNumber: "", boxCounts: { ...NO_BOXES }, lines: [{ productId: "", quantity: "" }], notes: "" };
}

export function inboundToValues(inbound: InboundDetailView): InboundValues {
  return {
    warehouseId: inbound.warehouseId,
    shippingMode: inbound.shippingMode,
    expectedArrivalDate: inbound.expectedArrivalDate,
    carrier: inbound.carrier ?? "",
    trackingNumber: inbound.trackingNumber ?? "",
    boxCounts: Object.fromEntries(STORAGE_TIERS.map((tier) => [tier, inbound.declaredBoxCounts[tier] ? String(inbound.declaredBoxCounts[tier]) : ""])) as Record<StorageTier, string>,
    lines: inbound.lines.map((line) => ({ productId: line.productId, quantity: String(line.declaredQuantity) })),
    notes: inbound.notes ?? "",
  };
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function valuesToInput(values: InboundValues): InboundInput {
  const boxCounts = Object.fromEntries(
    tiersFor(values.shippingMode)
      .map((tier) => [tier, Number(values.boxCounts[tier] || 0)] as const)
      .filter(([, count]) => count > 0),
  );
  return {
    warehouseId: optional(values.warehouseId ?? ""),
    shippingMode: values.shippingMode,
    expectedArrivalDate: values.expectedArrivalDate,
    carrier: optional(values.carrier),
    trackingNumber: optional(values.trackingNumber),
    boxCounts,
    notes: optional(values.notes),
    lines: values.lines.filter((line) => line.productId !== "").map((line) => ({ productId: line.productId, quantity: Number(line.quantity || 0) })),
  };
}
