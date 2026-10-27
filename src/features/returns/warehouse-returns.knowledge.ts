import type { ReceiveVendorReturnInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const WAREHOUSE_RETURNS_KNOWLEDGE = describePage<ReceiveVendorReturnInput>({
  route: "/admin/returns",
  title: "Returns",
  purpose: "Parcels customers send back. Match the return reference on the parcel, count and photograph it, then follow the vendor's instructions.",
  steps: [
    "Find the return under Expected using the reference on the parcel.",
    "Count each item without looking at what was expected, add condition notes and photograph what arrived.",
    "Wait for the vendor to say what to do with each item.",
    "Under Ready to finish, put items back on the shelf, dispose of them or donate them as shown, then finish the return.",
  ],
  fields: {
    lines: { labels: [/ counted$/], meaning: "How many of this item are in the parcel. Count what you see, not what you expect.", mistakes: ["Up to 9999."] },
    notes: { labels: ["Condition notes (optional)"], meaning: "The state the items arrived in, for the vendor. Optional.", mistakes: ["Up to 1000 characters."] },
    photoFileIds: {
      labels: ["Photo of what arrived", /^Photo of what arrived \d+$/, "Choose file"],
      meaning: "Photos of the open parcel and the items in it.",
      mistakes: ["Add at least one photo.", "Up to 10 photos."],
    },
  },
  related: [
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/stock", label: "Stock" },
  ],
});
