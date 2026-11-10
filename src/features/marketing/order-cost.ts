import type { PublicPriceListView } from "@/shared";

export const POSTAGE_FROM_MINOR: Readonly<Record<string, { minor: number; service: string }>> = {
  CA: { minor: 1073, service: "Canada Post Xpresspost, 1 kg, nearby addresses" },
  GB: { minor: 375, service: "Royal Mail Tracked 48, up to 2 kg" },
  IE: { minor: 900, service: "An Post standard parcel, up to 2 kg" },
};

export const COURIER_FROM_HOME: Readonly<Record<string, { currency: string; fromMinor: number }>> = { NG: { currency: "NGN", fromMinor: 6_500_000 } };

export interface OrderCost {
  currency: string;
  packingMinor: number;
  extraItemMinor: number;
  packingCapMinor: number;
  postageMinor: number;
  postageService: string;
  totalMinor: number;
}

export function orderCost(prices: PublicPriceListView): OrderCost | null {
  const postage = POSTAGE_FROM_MINOR[prices.countryCode];
  if (!postage) {
    return null;
  }
  const { fulfilment, shippingMarkupBps } = prices.schedule;
  const postageMinor = Math.round((postage.minor * (10_000 + shippingMarkupBps)) / 10_000);
  return {
    currency: prices.currency,
    packingMinor: fulfilment.baseMinor,
    extraItemMinor: fulfilment.perAdditionalUnitMinor,
    packingCapMinor: fulfilment.maxMinor,
    postageMinor,
    postageService: postage.service,
    totalMinor: fulfilment.baseMinor + postageMinor,
  };
}

export function convertMinor(amountMinor: number, rate: number, roundTo: number): number {
  return Math.round((amountMinor * rate) / roundTo) * roundTo;
}
