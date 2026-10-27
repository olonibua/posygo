import type { InboundInput } from "@/shared";

import { trackingNumberFix } from "@/features/assistant/guidance/fixes";
import { describePage, type PageKnowledgeOf } from "@/features/assistant/knowledge/types";

const SHIPMENT: Omit<PageKnowledgeOf<InboundInput>, "route"> = {
  title: "Send stock in",
  purpose: "Tell the hub what stock you're sending, so every unit can be counted against your list when it arrives.",
  steps: [
    "Say how it's travelling: loose boxes by courier, or pallets.",
    "Pick the date you expect it to arrive, and add the carrier and tracking number if you have them.",
    "List every product and how many units of each are coming.",
    "Count your boxes by size. Each box is stored and charged on its own.",
    "Save the draft, check the charge, then submit. The stocking fee and first month of storage are taken from your wallet when you submit.",
  ],
  fields: {
    warehouseId: { labels: [], meaning: "The hub your stock goes to. We pick it for your market, and you'll see its address after you submit." },
    shippingMode: { labels: ["How is it travelling?"], meaning: "Loose boxes are parcels sent by courier. Pallets are freight on one or more pallets. It changes which box sizes you can declare." },
    expectedArrivalDate: {
      labels: ["Expected arrival"],
      meaning: "The day you expect the delivery to reach the hub, so they can plan space and staff.",
      mistakes: ["A date in the past isn't accepted.", "It must be within the next six months."],
    },
    carrier: { labels: ["Carrier"], meaning: "The delivery company bringing your stock, for example Royal Mail or DHL. Optional.", example: "Royal Mail" },
    trackingNumber: {
      labels: ["Tracking number"],
      meaning: "The tracking number from your carrier, so the hub can follow the delivery. Optional.",
      mistakes: ["Only letters, numbers, spaces and dashes are allowed, between 4 and 60 characters."],
      fix: trackingNumberFix,
    },
    lines: {
      labels: [/^Product \d+$/, "Units"],
      meaning: "Each product in the shipment and how many units of it are coming. The hub counts against this list, so a mismatch is reported to you.",
      mistakes: ["Each product can only appear once; add the units together instead.", "Only active products show here. Add new products to your catalogue first."],
    },
    boxCounts: {
      labels: ["Small", "Medium", "Large", "Extra large", "Pallet"],
      meaning: "How many boxes of each size are coming. Small fits up to a shoebox, medium a moving box, large a wardrobe box. Each box is stored and charged separately.",
      mistakes: ["At least one box is needed.", "Pallets can only be declared when the shipment travels on pallets."],
    },
    notes: { labels: ["Notes for the hub"], meaning: "Anything the hub should know before opening your boxes, like fragile items or unusual packaging. Optional." },
  },
  related: [
    { href: "/products/new", label: "Add a product" },
    { href: "/wallet", label: "Top up your wallet" },
    { href: "/pricing", label: "Prices" },
  ],
};

export const NEW_SHIPMENT_KNOWLEDGE = describePage<InboundInput>({ ...SHIPMENT, route: "/inbound/new" });
export const EDIT_SHIPMENT_KNOWLEDGE = describePage<InboundInput>({ ...SHIPMENT, route: "/inbound/[id]/edit" });
