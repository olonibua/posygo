import type { ReportClaimInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";
import { REPORT_PROBLEM_FIELDS } from "@/features/custody/report-problem.knowledge";

export const INVENTORY_KNOWLEDGE = describePage<ReportClaimInput>({
  route: "/inventory",
  title: "Your stock",
  purpose: "Everything held for you in the country you've chosen at the top of the page, batch by batch, with every move it has made since it was counted in.",
  steps: [
    "Use the country menu at the top of the page to see stock in another country.",
    "Check the tiles for units ready to sell, damaged units and stock still being put away.",
    "Look through the list to see each batch's available and reserved units and its shelf.",
    "Choose History on a batch to see its full journey through the hub.",
    "If something is wrong with a batch, choose Report and tell us what happened.",
    "See which hubs hold your stock, and download the list as a CSV if you need it.",
  ],
  fields: REPORT_PROBLEM_FIELDS,
  related: [
    { href: "/inbound/new", label: "Send stock in" },
    { href: "/claims", label: "Claims" },
    { href: "/products", label: "Your products" },
  ],
});
