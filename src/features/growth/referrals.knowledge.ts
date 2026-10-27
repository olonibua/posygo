import { describePage } from "@/features/assistant/knowledge/types";

export const REFERRALS_KNOWLEDGE = describePage({
  route: "/settings/referrals",
  title: "Refer a business",
  purpose: "Share your code with other sellers. When they join with it and their first stock arrives at a hub, you both get wallet credit.",
  steps: [
    "Copy your invite link and send it to another seller.",
    "Once they sign up with your code and their first stock arrives at a hub, you both get the wallet credit shown at the top of the page.",
    "Track how many joined and how much credit you've earned.",
  ],
  fields: {},
  related: [{ href: "/wallet", label: "Wallet" }],
});
