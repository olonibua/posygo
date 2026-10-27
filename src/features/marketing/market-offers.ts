import { STORAGE_TIERS, type VendorFeeSchedule } from "@/shared";

import { STORAGE_TIER_LABELS } from "@/features/stock/display";

export function scheduleOffers(schedule: VendorFeeSchedule): Array<{ name: string; amountMinor: number }> {
  const storage = STORAGE_TIERS.flatMap((tier) => {
    const minor = schedule.monthlyStorage[tier];
    return minor === null ? [] : [{ name: `Monthly storage, ${STORAGE_TIER_LABELS[tier].label.toLowerCase()} box`, amountMinor: minor }];
  });
  return [{ name: "Packing an order", amountMinor: schedule.fulfilment.baseMinor }, { name: "Handling a return", amountMinor: schedule.returnsHandlingMinor }, ...storage];
}
