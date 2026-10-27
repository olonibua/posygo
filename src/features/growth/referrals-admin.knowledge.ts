import type { ReferralCampaignInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const ADMIN_REFERRALS_KNOWLEDGE = describePage<ReferralCampaignInput>({
  route: "/admin/referrals",
  title: "Referrals",
  purpose: "Campaign codes for events and partners, and every business that joined with a code. Wallet credit is given once the new vendor is trading and their first stock has arrived.",
  steps: [
    "To run a campaign, choose the market, a code, a name and the welcome credit, then create the code.",
    "Stop a campaign code when it should no longer work, or restart it.",
    "Check the sign-ups list to see who joined with a code and whether they've been credited.",
    "Cancel a sign-up's credit if a check finds a problem. Only sign-ups still waiting for first stock can be cancelled.",
  ],
  fields: {
    countryCode: { labels: ["Market"], meaning: "The market the campaign code works in. The welcome credit is in its currency." },
    code: { labels: ["Code"], meaning: "What new vendors type when they sign up.", mistakes: ["Use 3 to 40 letters, numbers and hyphens, starting with a letter or number."] },
    name: { labels: ["Name"], meaning: "A name for the campaign, such as the event or partner it's for.", mistakes: ["Between 3 and 80 characters."] },
    refereeCreditMinor: { labels: [/^Welcome credit/], meaning: "The wallet credit a new vendor gets for signing up with this code, once their first stock has arrived." },
    startsAt: { labels: [], meaning: "When the campaign starts. Not set on this form." },
    endsAt: { labels: [], meaning: "When the campaign ends. Not set on this form." },
    maxSignups: { labels: ["Sign-up limit (optional)"], meaning: "The most businesses that can sign up with this code. Leave it empty for no limit." },
  },
  related: [{ href: "/admin/fees", label: "Prices" }],
});
