import type { VendorReturnStatus } from "@/shared";

import type { Tone } from "@/components/ui/tone";

export const RETURN_STATUS: Record<VendorReturnStatus, { label: string; vendorHint: string; tone: Tone }> = {
  REQUESTED: { label: "On its way back", vendorHint: "Ask your customer to send it to the address below with the return reference on the parcel.", tone: "sky" },
  RECEIVED: { label: "Arrived, needs your say", vendorHint: "Tell us what to do with each item.", tone: "yellow" },
  INSTRUCTED: { label: "Being processed", vendorHint: "The warehouse is following your instructions.", tone: "orange" },
  COMPLETED: { label: "Done", vendorHint: "Anything you chose to restock is back in your stock.", tone: "lime" },
  CANCELLED: { label: "Cancelled", vendorHint: "The handling fee went back to your wallet.", tone: "cocoa" },
  EXPIRED: { label: "Closed, nothing arrived", vendorHint: "The handling fee went back to your wallet.", tone: "cocoa" },
};
