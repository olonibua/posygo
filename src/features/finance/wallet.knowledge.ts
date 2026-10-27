import type { StartTopUpInput, WalletSettingsInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const WALLET_KNOWLEDGE = describePage<StartTopUpInput & WalletSettingsInput>({
  route: "/wallet",
  title: "Wallet",
  purpose: "Your prepaid balance. Fees for stocking, storage, packing and shipping are taken from it as the work is done, and every charge is listed with what it was for.",
  steps: [
    "Add funds by card.",
    "Watch charges appear as the hub works on your stock and orders.",
    "Set a low balance alert so you're emailed before you run out.",
    "Download a statement whenever you need one.",
  ],
  fields: {
    amountMinor: { labels: ["Amount to add"], meaning: "How much to add to your wallet. The card payment includes the card processor's fee, shown before you pay." },
    lowBalanceThresholdMinor: { labels: ["Email me below"], meaning: "We email you when your balance drops below this amount. Set it to 0 to turn alerts off." },
  },
  related: [
    { href: "/pricing", label: "Prices" },
    { href: "/inbound/new", label: "Send stock in" },
  ],
});
