import type { CancellationDecisionInput, PackagingPresetInput, PackInput, scanSchema, StaffOrderActionInput } from "@/shared";
import type { z } from "zod";

import { describePage } from "@/features/assistant/knowledge/types";

type StaffAction<Action extends StaffOrderActionInput["action"]> = Omit<Extract<StaffOrderActionInput, { action: Action }>, "action">;

export const ORDER_QUEUE_KNOWLEDGE = describePage<Record<"search", unknown>>({
  route: "/admin/orders",
  title: "Orders",
  purpose: "The hub's list of vendor orders to pick, scan, pack, label and hand to the carrier.",
  steps: [
    "Choose which orders to see, for example To pack or Choose shipping.",
    "Search by order, tracking number, vendor or recipient name if you're looking for one order.",
    "Open an order to scan its units, record the parcel and buy its label.",
    "Check Cancellation requests for vendors asking to cancel an order.",
  ],
  fields: {
    search: { labels: ["Search"], meaning: "Finds orders by order reference, tracking number, vendor or recipient name.", mistakes: ["Type at least 2 characters before the search is used."] },
  },
  related: [{ href: "/admin/packaging", label: "Packaging" }],
});

export const ORDER_KNOWLEDGE = describePage<
  z.infer<typeof scanSchema> & PackInput & StaffAction<"SELECT_RATE"> & StaffAction<"HAND_OFF"> & StaffAction<"HOLD"> & StaffAction<"CANCEL"> & CancellationDecisionInput
>({
  route: "/admin/orders/[id]",
  title: "Order",
  purpose: "Work through one order: scan every unit, record the parcel, buy the label and hand it to the carrier.",
  steps: [
    "Scan each unit's barcode or lot label until nothing is left to scan.",
    "Choose the package, weigh the sealed parcel and record the pack.",
    "Get shipping rates, pick one and buy the label. The vendor's wallet is charged for shipping.",
    "Print the label, photograph the sealed parcel and mark it as handed to the carrier.",
    "If something is wrong, put the order on hold with a reason, or cancel it.",
  ],
  fields: {
    code: {
      labels: ["Barcode or lot label"],
      meaning: "The code on the unit you're packing. Scan it with the reader, or type it and press Enter. Each scan counts one unit.",
      mistakes: ["Up to 64 characters.", "Every unit must be scanned before the parcel can be recorded. Press Start again to clear the scans."],
    },
    presetId: {
      labels: ["Package", "Another size"],
      meaning: "The box or mailer you packed the order in. Choose Another size to enter the parcel's size yourself.",
      mistakes: ["Choose a package or enter its size."],
    },
    dimensions: {
      labels: ["Length (cm)", "Width (cm)", "Height (cm)"],
      meaning: "The parcel's size in centimetres, only when you chose Another size. It goes to the carrier with the weight.",
      mistakes: ["Each side can be up to 200 cm."],
    },
    weightGrams: { labels: ["Weight on the scale (g)"], meaning: "The weight of the sealed parcel in grams, read from the scale.", mistakes: ["Up to 70 kg."] },
    notes: { labels: ["Notes (optional)"], meaning: "Anything worth recording about how the parcel was packed. Optional." },
    rateId: {
      labels: ["Shipping options"],
      meaning: "The carrier service to buy a label from. The vendor pays the carrier's price plus our handling, taken from their wallet when you buy the label.",
    },
    photoFileIds: {
      labels: ["Photo of the sealed parcel", /^Photo of the sealed parcel \d+$/, "Choose file"],
      meaning: "A photo of the sealed parcel with the label showing clearly. Partner hubs must add one before handing the parcel over, and it's needed before they're paid for the order.",
    },
    sealNumber: { labels: ["Tamper seal number"], meaning: "For high-value parcels only: close the parcel with a numbered seal and enter the number.", mistakes: ["At least 3 characters."] },
    reason: {
      labels: ["Reason the vendor will see", "Reason"],
      meaning: "When putting the order on hold, why it's held; the vendor sees it. When cancelling, pick the reason from the list.",
      mistakes: ["A hold reason must be at least 10 characters."],
    },
    note: {
      labels: ["Note", "Note for the record"],
      meaning: "A note kept on the order when you cancel it, or when you approve or reject a vendor's request to cancel.",
      mistakes: ["At least 10 characters."],
    },
    approve: { labels: [], meaning: "Whether you approve or reject the vendor's request to cancel. You choose with the Approve and Reject buttons." },
  },
  related: [
    { href: "/admin/orders", label: "All orders" },
    { href: "/admin/packaging", label: "Packaging" },
  ],
});

export const PACKAGING_KNOWLEDGE = describePage<PackagingPresetInput & Record<"market", unknown>>({
  route: "/admin/packaging",
  title: "Packaging",
  purpose: "The boxes and mailers packers choose from in each market. Their sizes go to the carrier with the weighed parcel.",
  steps: [
    "Pick the market, if you look after more than one.",
    "Check the list of packaging in use.",
    "Add new packaging with its name, code, type and size.",
    "Retire packaging the hubs no longer stock, or bring it back later.",
  ],
  fields: {
    market: { labels: ["Market"], meaning: "The market whose packaging you're looking at. Each market has its own list." },
    label: { labels: ["Name"], meaning: "The name packers see when choosing the package.", example: "Small mailer", mistakes: ["Between 2 and 60 characters."] },
    code: { labels: ["Code"], meaning: "A short code for the package.", mistakes: ["Use 2 to 24 letters, numbers or dashes."] },
    kind: { labels: ["Type"], meaning: "Whether it's a box or a mailer." },
    lengthMm: { labels: ["Length (cm)"], meaning: "The package's length in centimetres.", mistakes: ["Up to 200 cm."] },
    widthMm: { labels: ["Width (cm)"], meaning: "The package's width in centimetres.", mistakes: ["Up to 200 cm."] },
    heightMm: { labels: ["Height (cm)"], meaning: "The package's height in centimetres.", mistakes: ["Up to 200 cm."] },
    active: { labels: [], meaning: "Whether packers can choose it. New packaging is in use straight away; use Retire or Bring back to change it." },
  },
  related: [{ href: "/admin/orders", label: "Orders" }],
});
