import type { OutreachContactInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const OUTREACH_KNOWLEDGE = describePage<OutreachContactInput>({
  route: "/admin/outreach",
  title: "Partner outreach",
  purpose: "A list of businesses and people who could become fulfilment partners. Email them from hello@posygo.com and track who replies.",
  steps: [
    "Add contacts one at a time, or import a list pasted from a spreadsheet.",
    "Tick the contacts to email, choose a template and check the preview.",
    "Send, then update each contact's status as they reply.",
  ],
  fields: {
    business: { labels: ["Business"], meaning: "The business or person's name. Use {business} in an email to fill it in." },
    country: { labels: ["Country"], meaning: "Where they are. Use {country} in an email." },
    city: { labels: ["City (optional)"], meaning: "Their city. Use {city} in an email; it falls back to the country." },
    email: { labels: ["Email"], meaning: "Where outreach emails go. Each email address can only be on the list once." },
    kind: { labels: ["Type"], meaning: "What kind of business they are, such as a prep centre or cargo agent." },
    contactName: { labels: ["Contact name (optional)"], meaning: "The person to address. Use {name} in an email; it falls back to \"there\"." },
    phone: { labels: ["Phone (optional)"], meaning: "A number to call or message them on." },
    website: { labels: ["Website (optional)"], meaning: "Their website, for checking what they do." },
    notes: { labels: ["Notes (optional)", "Notes"], meaning: "Anything worth remembering, such as what they said when they replied." },
    source: { labels: ["Where you found them (optional)"], meaning: "Where the lead came from, such as a directory or a referral." },
  },
  related: [{ href: "/admin/reminders", label: "Reminder emails" }],
});

export const STOP_OUTREACH_KNOWLEDGE = describePage({
  route: "/outreach/stop",
  title: "Stop partner emails",
  purpose: "Takes someone off Posygo's partner outreach emails using the link at the bottom of an email.",
  steps: ["Open the \"Don't email me again\" link at the bottom of the email.", "Wait for the confirmation that you've been removed. If the link fails, reply to the email instead."],
  fields: {},
  related: [],
});
