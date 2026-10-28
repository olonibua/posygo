import { describePage } from "@/features/assistant/knowledge/types";

export const CLAIMS_KNOWLEDGE = describePage({
  route: "/claims",
  title: "Claims",
  purpose: "Problems with your stock in the country you've chosen at the top of the page, and what we decided about each one.",
  steps: [
    "Use the country menu at the top of the page to see claims in another country.",
    "To report a problem, open the order or the stock it's about and choose Report a problem.",
    "Follow each claim here as we look into it.",
    "Read the assessment and decision notes to see who was responsible.",
    "Unless the loss was found to be your own responsibility, the agreed amount is added to your wallet as wallet credit, which you can use for any fees.",
  ],
  fields: {},
  related: [
    { href: "/orders", label: "Orders" },
    { href: "/inventory", label: "Your stock" },
    { href: "/wallet", label: "Wallet" },
  ],
});
