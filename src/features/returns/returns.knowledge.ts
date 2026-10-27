import type { CreateVendorReturnInput, InstructVendorReturnInput, VendorReturnTrackingInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const RETURNS_KNOWLEDGE = describePage<VendorReturnTrackingInput & InstructVendorReturnInput & Record<"show", unknown>>({
  route: "/returns",
  title: "Returns",
  purpose: "Items your customers send back to the hub that shipped them. The hub counts and photographs them, and you decide what happens next.",
  steps: [
    "To start a return, open the order and choose Start a return.",
    "While a return is on its way back, give your customer the address shown and ask them to write the return reference on the parcel.",
    "Add the carrier and tracking number when you have them.",
    "When it arrives, check the count and photos, then say how many of each item go back on sale, are disposed of or are donated.",
  ],
  fields: {
    show: {
      labels: ["Show returns"],
      meaning: "In progress shows returns on their way back, waiting for your instructions or being processed. Finished shows completed, cancelled and closed returns.",
    },
    carrier: { labels: ["Carrier"], meaning: "The delivery company bringing the return back to the hub.", example: "Royal Mail", mistakes: ["Use 2 to 60 characters."] },
    trackingNumber: { labels: ["Tracking number"], meaning: "The tracking number for the return parcel, so the hub knows to expect it.", mistakes: ["Use 4 to 64 characters."] },
    lines: {
      labels: ["Back on sale", "Dispose", "Donate"],
      meaning:
        "For each item that arrived, how many units go back into your stock to sell, how many are thrown away and how many are given away. If you don't answer by the date shown, everything goes back on sale.",
      mistakes: ["Each item's three numbers must add up to the number that arrived."],
    },
  },
  related: [
    { href: "/orders", label: "Orders" },
    { href: "/inventory", label: "Your stock" },
  ],
});

export const NEW_RETURN_KNOWLEDGE = describePage<CreateVendorReturnInput>({
  route: "/returns/new",
  title: "Start a return",
  purpose: "Tell the hub which items from an order your customer is sending back, so they can count them when they arrive.",
  steps: [
    "Enter how many of each item are coming back.",
    "Say briefly why it's coming back.",
    "If your customer has already sent it, add the carrier and tracking number.",
    "Open the return. The handling fee shown is taken from your wallet straight away.",
  ],
  fields: {
    orderId: { labels: [], meaning: "The order the items came from. It's set when you choose Start a return on the order." },
    lines: {
      labels: [/^.+: how many$/],
      meaning: "How many units of this item are coming back. The line above shows how many were sent and how many can still be returned.",
      mistakes: ["Choose at least one item.", "Items that already have a return can't be chosen again."],
    },
    reason: {
      labels: ["Why is it coming back?"],
      meaning: "A short reason for the return. The hub sees it when the parcel arrives.",
      example: "Wrong size, customer wants to swap",
      mistakes: ["Write at least 5 characters, and up to 500."],
    },
    carrier: { labels: ["Carrier"], meaning: "The delivery company your customer used. Optional; you can add it later.", mistakes: ["Up to 60 characters."] },
    trackingNumber: { labels: ["Tracking number"], meaning: "The tracking number for the return parcel. Optional; you can add it later.", mistakes: ["Up to 64 characters."] },
  },
  related: [
    { href: "/returns", label: "All returns" },
    { href: "/orders", label: "Orders" },
    { href: "/wallet", label: "Top up your wallet" },
  ],
});
