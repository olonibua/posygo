import type { PublicPriceListView, StorageTier } from "@/shared";

export const POSTAGE_FROM_MINOR: Readonly<Record<string, { minor: number; service: string }>> = {
  CA: { minor: 1073, service: "Canada Post Xpresspost, 1 kg, nearby addresses" },
  GB: { minor: 375, service: "Royal Mail Tracked 48, up to 2 kg" },
  IE: { minor: 900, service: "An Post standard parcel, up to 2 kg" },
};

export const COURIER_FROM_HOME: Readonly<Record<string, { currency: string; fromMinor: number }>> = { NG: { currency: "NGN", fromMinor: 6_500_000 } };

const BOX_TIERS = ["SMALL", "MEDIUM", "LARGE", "X_LARGE"] as const satisfies readonly StorageTier[];

export interface OrderCost {
  currency: string;
  packingMinor: number;
  extraItemMinor: number;
  packingCapMinor: number;
  postageMinor: number;
  postageService: string;
  totalMinor: number;
  storage: { tier: (typeof BOX_TIERS)[number]; monthlyMinor: number; stockingMinor: number | null }[];
  firstShipmentFree: boolean;
}

export function orderCost(prices: PublicPriceListView): OrderCost | null {
  const postage = POSTAGE_FROM_MINOR[prices.countryCode];
  if (!postage) {
    return null;
  }
  const { fulfilment, shippingMarkupBps, monthlyStorage, onboarding, firstShipmentWaivesStocking } = prices.schedule;
  const postageMinor = Math.round((postage.minor * (10_000 + shippingMarkupBps)) / 10_000);
  const storage = BOX_TIERS.flatMap((tier) => {
    const monthlyMinor = monthlyStorage[tier];
    const rate = onboarding[tier];
    return monthlyMinor === null ? [] : [{ tier, monthlyMinor, stockingMinor: rate.negotiated ? null : rate.stockingMinor }];
  });
  return {
    currency: prices.currency,
    packingMinor: fulfilment.baseMinor,
    extraItemMinor: fulfilment.perAdditionalUnitMinor,
    packingCapMinor: fulfilment.maxMinor,
    postageMinor,
    postageService: postage.service,
    totalMinor: fulfilment.baseMinor + postageMinor,
    storage,
    firstShipmentFree: firstShipmentWaivesStocking,
  };
}

export function convertMinor(amountMinor: number, rate: number, roundTo: number): number {
  return Math.round((amountMinor * rate) / roundTo) * roundTo;
}
