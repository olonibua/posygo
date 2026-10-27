import { describePage } from "@/features/assistant/knowledge/types";

export const SANDBOX_CHECKOUT_KNOWLEDGE = describePage({
  route: "/wallet/sandbox-checkout",
  title: "Test payment",
  purpose: "A practice checkout for markets set up for testing. No card is charged and no real money moves.",
  steps: ["Check the amount that will be added to your wallet and the total.", "Choose Complete test payment to finish, or Cancel to go back to your wallet."],
  fields: {},
  related: [{ href: "/wallet", label: "Wallet" }],
});
