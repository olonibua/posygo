import type { AcceptInvitationInput, LoginInput, MfaChallengeInput, MfaConfirmInput, ResetPasswordInput, VerifyEmailInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

const INVITE_TOKEN = { labels: [], meaning: "The invitation from your email link. It's read from the link automatically, so open the page from the email." };

const NEW_PASSWORD = {
  labels: ["Password"],
  meaning: "The password you'll sign in with from now on. At least 12 characters; a short sentence you'll remember works well.",
  mistakes: ["Fewer than 12 characters isn't accepted.", "The box stays locked until the invitation has been checked."],
};

export const LOGIN_KNOWLEDGE = describePage<LoginInput & MfaChallengeInput>({
  route: "/login",
  title: "Sign in",
  purpose: "Sign in to your account with your email and password, plus a code from your phone if you use two-factor.",
  steps: [
    "Enter the email you signed up with.",
    "Enter your password and press Sign in.",
    "If two-factor is on, type the 6-digit code from your authenticator app.",
    "Lost your phone? Choose to use a recovery code instead.",
  ],
  fields: {
    email: { labels: ["Email"], meaning: "The email address your account was created with." },
    password: { labels: ["Password"], meaning: "Your account password. Use the Show button to check what you've typed.", mistakes: ["Forgotten it? Use the reset link under the box."] },
    challengeToken: { labels: [], meaning: "A short-lived pass that links your code to this sign-in. If it runs out, you're sent back to enter your password again." },
    code: {
      labels: ["Authenticator code"],
      meaning: "The 6-digit code your authenticator app shows for this account. It changes over time, so type the one showing now.",
      mistakes: ["It must be exactly 6 digits."],
    },
    recoveryCode: {
      labels: ["Recovery code"],
      meaning: "One of the recovery codes you saved when you set up two-factor. Each one works once.",
      example: "ABCDE-12345",
      mistakes: ["Recovery codes look like ABCDE-12345: five letters or numbers, a dash, then five more."],
    },
  },
  related: [
    { href: "/forgot-password", label: "Reset your password" },
    { href: "/signup", label: "Create an account" },
    { href: "/account", label: "Shopper? See your orders" },
  ],
});

export const FORGOT_PASSWORD_KNOWLEDGE = describePage<Pick<LoginInput, "email">>({
  route: "/forgot-password",
  title: "Reset your password",
  purpose: "Ask for a link by email so you can choose a new password.",
  steps: ["Enter the email address of your account.", "Press Send reset link.", "Open the link in the email within 30 minutes and choose a new password."],
  fields: {
    email: {
      labels: ["Email"],
      meaning: "The email address you sign in with. If there's an account for it, we send a reset link there.",
      mistakes: ["For your safety we don't say whether an account exists, so check the address if nothing arrives."],
    },
  },
  related: [
    { href: "/login", label: "Back to sign in" },
    { href: "/signup", label: "Create an account" },
  ],
});

export const RESET_PASSWORD_KNOWLEDGE = describePage<ResetPasswordInput & { confirm: string }>({
  route: "/reset-password",
  title: "Choose a new password",
  purpose: "Set a new password using the link we emailed you. Every other session is signed out when you save.",
  steps: ["Open this page from the reset link in your email.", "Type your new password.", "Type it again to confirm it.", "Save, then sign in with the new password."],
  fields: {
    token: { labels: [], meaning: "The reset code from your email link. It's read from the link automatically.", mistakes: ["If the link has expired or was already used, ask for a new one."] },
    password: { labels: ["New password"], meaning: "Your new password. At least 12 characters; a short sentence you'll remember works well.", mistakes: ["Fewer than 12 characters isn't accepted."] },
    confirm: { labels: ["Confirm new password"], meaning: "The same new password again, to catch typing mistakes.", mistakes: ["Both boxes must match exactly."] },
  },
  related: [
    { href: "/forgot-password", label: "Get a new reset link" },
    { href: "/login", label: "Sign in" },
  ],
});

export const VERIFY_EMAIL_KNOWLEDGE = describePage<VerifyEmailInput>({
  route: "/verify-email",
  title: "Confirm your email",
  purpose: "Activate your new account by entering the 8-digit code we emailed you.",
  steps: ["Enter the email you signed up with.", "Enter the password you chose.", "Type the 8-digit code from your inbox.", "Press Confirm email. If the code has run out, send a new one."],
  fields: {
    email: { labels: ["Email"], meaning: "The email address you used to sign up. The code was sent here." },
    password: { labels: ["Password"], meaning: "The password you chose when you signed up, so we can sign you straight in." },
    code: {
      labels: ["Verification code"],
      meaning: "The 8-digit code from our email. It lasts 15 minutes.",
      mistakes: ["It must be exactly 8 digits.", "Expired? Press Send a new code and use the newest email."],
    },
  },
  related: [
    { href: "/signup", label: "Create an account" },
    { href: "/login", label: "Sign in" },
  ],
});

export const MFA_SETUP_KNOWLEDGE = describePage<MfaConfirmInput>({
  route: "/mfa/setup",
  title: "Set up two-factor",
  purpose: "Link an authenticator app to your account so every sign-in also needs a code from your phone.",
  steps: [
    "Scan the QR code with an authenticator app such as 1Password, Google Authenticator or Authy, or type the key shown.",
    "If asked, enter the 8-digit code we emailed you.",
    "Type the 6-digit code the app now shows.",
    "Press Turn on two-factor.",
    "Save the recovery codes somewhere safe. They aren't shown again.",
  ],
  fields: {
    code: {
      labels: ["6-digit code from the app"],
      meaning: "The current 6-digit code your authenticator app shows after scanning. It proves the app is set up correctly.",
      mistakes: ["It must be exactly 6 digits.", "The code changes over time, so type the one showing now."],
    },
    emailCode: {
      labels: ["8-digit code from your email"],
      meaning: "A code we email you to prove this set-up is really you.",
      mistakes: ["It must be exactly 8 digits.", 'Not arrived? Choose "Send a new code". Only the newest code works.'],
    },
  },
  related: [
    { href: "/settings/security", label: "Security settings" },
    { href: "/login", label: "Sign in" },
  ],
});

export const INVITE_KNOWLEDGE = describePage<AcceptInvitationInput>({
  route: "/invite",
  title: "Join your team",
  purpose: "Accept an invitation to join a seller's team by choosing a password.",
  steps: ["Open this page from the invitation email.", "Check the business and email shown are right.", "Choose a password and press Join the team."],
  fields: { token: INVITE_TOKEN, password: NEW_PASSWORD },
  related: [
    { href: "/login", label: "Sign in" },
    { href: "/forgot-password", label: "Reset your password" },
  ],
});

export const STAFF_INVITE_KNOWLEDGE = describePage<AcceptInvitationInput>({
  route: "/staff-invite",
  title: "Join the platform team",
  purpose: "Accept an invitation to join the platform team, then set up two-factor sign-in.",
  steps: ["Open this page from the invitation email.", "Check the role and email shown are right.", "Choose a password and press Continue.", "Set up your authenticator app on the next page."],
  fields: { token: INVITE_TOKEN, password: NEW_PASSWORD },
  related: [
    { href: "/login", label: "Sign in" },
    { href: "/mfa/setup", label: "Set up two-factor" },
  ],
});
