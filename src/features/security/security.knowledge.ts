import type { ChangeEmailInput, ChangePasswordInput } from "@/shared";

import { describePage, type FieldHelp } from "@/features/assistant/knowledge/types";

type SignInInput = ChangeEmailInput & ChangePasswordInput & { confirm: string };

export const SIGN_IN_STEPS = [
  "To change your email, press Change email, type the new address and your current password, then open the link we send to the new address within an hour. You'll sign in again afterwards.",
  "To change your password, press Change password, type your current password and the new one twice. Every other device is signed out.",
  "Check whether two-factor sign-in with an authenticator app is on. If it's off, choose Turn on and follow the steps.",
  "Keep your recovery codes somewhere safe.",
] as const;

export const SIGN_IN_FIELDS: Record<keyof SignInInput, FieldHelp> = {
  email: { labels: ["New email"], meaning: "The address you want to sign in with from now on. We send a confirmation link to it.", mistakes: ["An address another account already uses isn't accepted."] },
  currentPassword: { labels: ["Current password"], meaning: "The password you sign in with today, to prove it's you making the change." },
  password: { labels: ["New password"], meaning: "Your new password. At least 12 characters; a short sentence you'll remember works well.", mistakes: ["It can't be the password you use now."] },
  confirm: { labels: ["Confirm new password"], meaning: "The same new password again, to catch typing mistakes.", mistakes: ["Both boxes must match exactly."] },
};

export const SECURITY_KNOWLEDGE = describePage<SignInInput>({
  route: "/settings/security",
  title: "Sign-in and security",
  purpose: "Change your email or password, and protect the account that controls your stock and money.",
  steps: SIGN_IN_STEPS,
  fields: SIGN_IN_FIELDS,
  related: [
    { href: "/mfa/setup", label: "Turn on two-factor sign-in" },
    { href: "/settings/team", label: "Your team" },
  ],
});

export const CONFIRM_EMAIL_KNOWLEDGE = describePage({
  route: "/confirm-email",
  title: "Confirm your new email",
  purpose: "Finish changing your sign-in email. Opening the link from our email confirms it straight away.",
  steps: ["Open this page from the link we sent to your new address.", "Wait a moment while we confirm it.", "Sign in again with your new email."],
  fields: {},
  related: [{ href: "/login", label: "Sign in" }],
});
