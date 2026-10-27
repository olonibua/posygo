import type { ShoppingArrivalInput, ShoppingCancelInput, ShoppingPurchaseInput, ShoppingQuoteInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const ADMIN_SHOPPING_KNOWLEDGE = describePage<ShoppingQuoteInput & ShoppingPurchaseInput & ShoppingCancelInput>({
  route: "/admin/shopping",
  title: "Personal shopping",
  purpose: "Buyers send links to things they want. Price them, buy them once paid, and the warehouse sends everything on in one parcel.",
  steps: [
    "Under To price, check each link and give the shop price and weight of one of each item, then send the price. We add our fee and delivery.",
    "The buyer has 7 days to pay before the price runs out.",
    "Under To buy, buy each item, mark it Bought or Sold out, and add the shop's order number.",
    "The warehouse books the items in and sends them on from Shopping parcels.",
  ],
  fields: {
    warehouseId: { labels: ["Deliver to warehouse"], meaning: "The warehouse the shops deliver to. Only open warehouses in the request's country are listed." },
    packagingPresetId: { labels: ["Box to send it in"], meaning: "The box the items will be sent on in. Its size is used to price delivery." },
    lines: {
      labels: [
        /: we can get this$/,
        "Shop price for one",
        "Weight of one (grams)",
        "Customs code",
        "Customs code (optional)",
        "Note for the buyer (optional)",
        /: outcome$/,
        "Shop's order number (optional)",
      ],
      meaning:
        "Each item the buyer asked for. When pricing: whether we can get it, the shop price and weight of one, a customs code (asked for when the parcel crosses a border) and a note for the buyer. When buying: whether it was bought or sold out, and the shop's order number. Anything sold out is refunded to the buyer straight away, with its share of our fee.",
      mistakes: ["Give a price and a weight for every item we can get.", "At least one item must be available to price.", "Customs codes are 6 to 10 digits."],
    },
    reason: {
      labels: ["Reason the buyer will see"],
      meaning: "Why the request is being cancelled. If the buyer has paid, everything not yet refunded goes back to their card.",
      mistakes: ["At least 5 characters."],
    },
  },
  related: [{ href: "/admin/shopping-desk", label: "Shopping parcels" }],
});

export const SHOPPING_DESK_KNOWLEDGE = describePage<ShoppingArrivalInput>({
  route: "/admin/shopping-desk",
  title: "Shopping parcels",
  purpose: "Items we've bought for buyers arrive here from shops. Book them in with photos, then send them on in one parcel.",
  steps: [
    "Wait until every shop parcel for a request is here.",
    "Count each item, photograph everything out of the shop packaging, and book it in.",
    "Pack it in one box and press Buy label and send. The buyer is told it's on its way.",
    "Mark it delivered once the carrier confirms.",
  ],
  fields: {
    lines: { labels: [/: how many arrived$/], meaning: "How many of this item arrived from the shop.", mistakes: ["Up to 99."] },
    photoFileIds: {
      labels: ["Photo of the items", /^Photo of the items \d+$/, "Choose file"],
      meaning: "Photos of everything that arrived, out of the shop packaging.",
      mistakes: ["Add at least one photo.", "Up to 10 photos."],
    },
  },
  related: [{ href: "/admin/shopping", label: "Personal shopping" }],
});
