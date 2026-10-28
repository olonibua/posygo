import type { createApiKeySchema, ReportClaimInput, VendorOrderActionInput } from "@/shared";
import type { z } from "zod";

import { describePage } from "@/features/assistant/knowledge/types";
import { REPORT_PROBLEM_FIELDS } from "@/features/custody/report-problem.knowledge";

type CancelInput = Extract<VendorOrderActionInput, { action: "CANCEL" }>;

export const ORDERS_KNOWLEDGE = describePage<Record<"group" | "search" | "from" | "to", unknown>>({
  route: "/orders",
  title: "Orders",
  purpose: "Every order in the country you've chosen at the top of the page, from waiting to be packed through to delivered.",
  steps: [
    "Use the country menu at the top of the page to see another country's orders.",
    "Check the tiles for orders to pack, being shipped, on the way, and any that need funds.",
    "Choose a tab, or search, to find an order.",
    "Open an order to see its timeline, parcel and tracking.",
    "Create a new order, import a spreadsheet, or download your orders as a CSV.",
  ],
  fields: {
    group: {
      labels: ["Filter orders"],
      meaning:
        "To pack shows orders waiting at the hub or on hold. Shipping covers packed orders while the label is sorted. On the way means the carrier has it. Finished covers delivered, cancelled and returned orders.",
    },
    search: {
      labels: ["Search"],
      meaning: "Finds orders by order number, your own reference, tracking number or recipient name.",
      mistakes: ["Type at least 2 characters before the search starts.", "Up to 64 characters."],
    },
    from: { labels: ["From"], meaning: "The first day to include in the CSV download. It starts 30 days back." },
    to: { labels: ["To"], meaning: "The last day to include in the CSV download. It starts as today." },
  },
  related: [
    { href: "/orders/new", label: "Create an order" },
    { href: "/orders/import", label: "Import orders from a spreadsheet" },
    { href: "/wallet", label: "Top up your wallet" },
  ],
});

export const ORDER_KNOWLEDGE = describePage<ReportClaimInput & CancelInput>({
  route: "/orders/[id]",
  title: "Order",
  purpose: "One order: its products, where it's going, what it cost, and every step from packing to delivery.",
  steps: [
    "Check the status and timeline to see where the order has got to.",
    "If shipping needs funds, add money to your wallet, then pay for shipping here so the label is bought.",
    "Once it's shipped, open the tracking page or start a return.",
    "If something went wrong after it shipped, choose Report a problem.",
    "To stop an order, choose Cancel order, or Ask to cancel once packing has started.",
  ],
  fields: {
    ...REPORT_PROBLEM_FIELDS,
    action: {
      labels: [],
      meaning:
        "Whether you cancel the order straight away or ask the hub to cancel it. Cancelling puts the stock back on the shelf and returns the fulfilment fee to your wallet. Once packing has started, the hub decides, and if they can stop it everything you paid for the order is returned.",
    },
    reason: { labels: ["Reason"], meaning: "Why you want the order cancelled. It's kept on the order." },
    note: { labels: ["Note (optional)"], meaning: "Anything else the hub should know about the cancellation. Optional.", mistakes: ["Up to 500 characters."] },
  },
  related: [
    { href: "/orders", label: "All orders" },
    { href: "/wallet", label: "Top up your wallet" },
    { href: "/returns", label: "Returns" },
    { href: "/claims", label: "Claims" },
  ],
});

export const IMPORT_ORDERS_KNOWLEDGE = describePage<Record<"file", unknown>>({
  route: "/orders/import",
  title: "Import orders",
  purpose: "Create many orders at once from a spreadsheet saved as a CSV file. They're created in the country you've chosen at the top of the page.",
  steps: [
    "Check the country at the top of the page. Every order in the file is sent from your stock there.",
    "Download the template and fill in one row per product.",
    "Give rows for the same order the same order reference. The address only needs to be on the first row.",
    "Top up your wallet first, as each order takes its fulfilment fee when it's created.",
    "Choose your CSV file and import it.",
    "Check the results. Orders that couldn't be created are listed with the reason; the rest go through.",
  ],
  fields: {
    file: {
      labels: ["Choose a CSV file", /^Choose a CSV file/, /Up to \d+ rows and \d+ orders per file/],
      meaning:
        "Your orders as a CSV file, with the same column headings as the template. The country column can be left blank, or left out, and the country you've chosen is used. If you fill it in, it must be that country's two-letter code, like GB. Product codes must match your catalogue.",
      example: "SHOP-1001,Ada Obi,,+44 7700 900123,ada@example.com,1 High Street,,Manchester,,M1 1AA,GB,WIG-BW-16,1",
      mistakes: [
        "Keep the file under 250 KB, with up to 1000 rows and 300 orders. You can import up to 2000 orders a day.",
        "The heading row must match the template, with no extra columns. Only the country column can be left out.",
        "Addresses must be in the country you've chosen.",
        "Each row needs a product code and a quantity from 1 to 1000.",
        "Order references can use up to 64 letters, numbers or . _ : # / -",
        "Later rows of the same order must leave the address blank or repeat it exactly.",
        "Keep each value under 300 characters.",
      ],
    },
  },
  related: [
    { href: "/orders", label: "All orders" },
    { href: "/orders/new", label: "Create one order" },
    { href: "/wallet", label: "Top up your wallet" },
    { href: "/products", label: "Your product codes" },
  ],
});

export const INTEGRATIONS_KNOWLEDGE = describePage<z.infer<typeof createApiKeySchema>>({
  route: "/settings/integrations",
  title: "Integrations",
  purpose: "Connect your shop or system so its orders arrive here on their own, using a private key.",
  steps: [
    "Give the new key a name that says where it's used, and create it.",
    "Copy the key straight away. It's only shown once.",
    "Put the key on your shop's server and send orders as shown in the example. Each order names the country it's for, and the address must be in that country.",
    "Revoke a key you no longer use. Anything using it stops working immediately.",
  ],
  fields: {
    name: {
      labels: ["Name"],
      meaning: "A name for the key so you know where it's used. Each key places and reads orders for your business only.",
      example: "Shopify store",
      mistakes: ["Use 2 to 60 characters.", "You can have up to 10 active keys. Revoke one to make room."],
    },
  },
  related: [
    { href: "/orders", label: "Orders" },
    { href: "/products", label: "Your product codes" },
  ],
});
