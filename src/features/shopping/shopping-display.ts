import type { ShoppingLineStatus, ShoppingStatus } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const SHOPPING_STATUS: Record<ShoppingStatus, { label: string; buyerHint: string; tone: Tone }> = {
  REQUESTED: { label: "Being priced", buyerHint: "We're checking each item. You'll get an email with the price, usually within one working day.", tone: "sky" },
  QUOTED: { label: "Ready to pay", buyerHint: "Choose a delivery speed and pay to confirm.", tone: "yellow" },
  PAID: { label: "Paid", buyerHint: "We're buying your items now.", tone: "lime" },
  BUYING: { label: "Buying", buyerHint: "Your items are on their way to our warehouse.", tone: "orange" },
  ARRIVED: { label: "At our warehouse", buyerHint: "Everything has arrived. We're packing it for you.", tone: "orange" },
  SHIPPED: { label: "On its way", buyerHint: "Your parcel has left our warehouse.", tone: "lime" },
  DELIVERED: { label: "Delivered", buyerHint: "Your parcel has been delivered.", tone: "lime" },
  CANCELLED: { label: "Cancelled", buyerHint: "This request is closed.", tone: "cocoa" },
  EXPIRED: { label: "Price ran out", buyerHint: "The price was held for 7 days. We'll send you a new one, or you can cancel.", tone: "cocoa" },
};

export const LINE_STATUS: Record<ShoppingLineStatus, string> = {
  REQUESTED: "Checking",
  QUOTED: "Available",
  UNAVAILABLE: "Can't get this",
  BOUGHT: "Bought",
  OUT_OF_STOCK: "Sold out, refunded",
  RECEIVED: "Arrived",
};
