import { describePage } from "@/features/assistant/knowledge/types";

export const ACTIVATION_SANDBOX_KNOWLEDGE = describePage({
  route: "/verification/sandbox-checkout",
  title: "Test payment",
  purpose: "A practice checkout for the activation fee in markets set up for testing. No card is charged and no real money moves.",
  steps: ["Check the activation fee.", "Choose Complete test payment to finish and make your account live, or Cancel to go back to verification."],
  fields: {},
  related: [{ href: "/verification", label: "Verification" }],
});
