import { describePage } from "@/features/assistant/knowledge/types";

export const SECURITY_KNOWLEDGE = describePage({
  route: "/settings/security",
  title: "Sign-in and security",
  purpose: "Protect the account that controls your stock and money.",
  steps: [
    "Check whether two-factor sign-in with an authenticator app is on.",
    "If it's off, choose Turn on and follow the steps to add a code from your phone to every sign-in.",
    "Keep your recovery codes somewhere safe.",
  ],
  fields: {},
  related: [
    { href: "/mfa/setup", label: "Turn on two-factor sign-in" },
    { href: "/settings/team", label: "Your team" },
  ],
});
