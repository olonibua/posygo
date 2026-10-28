import type { SignupInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const SIGNUP_KNOWLEDGE = describePage<SignupInput>({
  route: "/signup",
  title: "Create your seller account",
  purpose: "Open a seller account, pick every country where you want to store stock, and confirm your email.",
  steps: [
    "Enter your business name.",
    "Pick every country you sell in. The first one you pick is your home country.",
    "Add your work email and a password.",
    "Accept the terms and create your account.",
    "Type the code we email you to confirm your address.",
  ],
  fields: {
    businessName: { labels: ["Business name"], meaning: "The name of your business, as you want it to appear to us and on invoices.", mistakes: ["At least 2 characters."] },
    countryCodes: {
      labels: ["Where do you want to store stock?", "Choose a country", "Add another country"],
      meaning:
        "The countries where we'll keep your stock. Orders in each country are sent from stock in that same country, so pick every country you sell in from the drop-down; each one is added to the list and the cross removes it. Your first pick is your home country, used for your business checks and the activation fee. You can add more later in Settings.",
      mistakes: ["Pick at least one country.", "Only countries that are open are listed. If none show, we haven't opened yet."],
    },
    email: { labels: ["Work email"], meaning: "The email you'll sign in with. We send a code to confirm it." },
    password: {
      labels: ["Password"],
      meaning: "At least 12 characters. A short sentence you'll remember works well.",
      mistakes: ["Passwords that have appeared in known data leaks aren't accepted."],
    },
    acceptTerms: { labels: [/^I agree/], meaning: "Confirms you accept the terms of service and the privacy policy." },
    referralCode: { labels: ["Referral code (optional)"], meaning: "A code from someone who invited you. You both get wallet credit when you start trading." },
  },
  related: [
    { href: "/pricing", label: "Prices" },
    { href: "/how-it-works", label: "How it works" },
  ],
});
