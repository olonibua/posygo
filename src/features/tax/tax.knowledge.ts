import type { CreateTaxObligationInput, FileTaxDeadlineInput, ScheduleTaxDeadlineInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const TAX_KNOWLEDGE = describePage({
  route: "/admin/tax",
  title: "Tax & compliance",
  purpose: "Everything the company has to file or pay in each country, with due dates, overdue items and how close fees are to a registration limit.",
  steps: [
    "Check Coming up for anything overdue or due in the next 90 days.",
    "Watch the registration limits. They compare fees charged in the last 12 months with the VAT or GST limit.",
    "Open a country to set due dates, mark filings as done or add obligations.",
  ],
  fields: {},
  related: [
    { href: "/admin/finance", label: "Finance" },
    { href: "/admin/email-alerts", label: "Email alerts" },
  ],
});

export const TAX_COUNTRY_KNOWLEDGE = describePage<CreateTaxObligationInput & FileTaxDeadlineInput & ScheduleTaxDeadlineInput>({
  route: "/admin/tax/[code]",
  title: "Country tax obligations",
  purpose: "The filings and payments for one country. Reminders go out 30, 7 and 1 days before each due date, then daily while it's overdue.",
  steps: [
    "Add the starter checklist, or add your own obligations.",
    "Set the due date for each one. Most dates depend on the company's year end.",
    "When something is filed, mark it as filed with the date and reference. The next due date is added for you.",
    "Mark each item as checked once your accountant or tax adviser has confirmed it applies.",
  ],
  fields: {
    title: { labels: ["Title"], meaning: "A short name for the filing or payment, for example VAT return.", mistakes: ["Use at least 3 characters."] },
    authority: { labels: ["Authority"], meaning: "Who the filing goes to, for example HMRC or Companies House." },
    description: { labels: ["What it is"], meaning: "A plain description of what has to be filed or paid, and when it applies." },
    cadence: { labels: ["How often"], meaning: "How often it repeats. Once means it doesn't repeat, so no next date is added after filing." },
    dueRule: { labels: ["When it's due"], meaning: "The rule for the deadline, for example 9 months after the year end. It's shown as a reminder when you set dates." },
    firstDueOn: { labels: ["First due date"], meaning: "The first deadline, if you know it. You can set it later instead." },
    owner: { labels: ["Owner"], meaning: "Who looks after this, for example your accountant or a team member." },
    guidanceUrl: { labels: ["Guidance link"], meaning: "A link to the official guidance, so anyone can check the rules.", mistakes: ["Enter a full web address starting with https://"] },
    filedOn: { labels: ["Filed on"], meaning: "The date it was actually filed or paid." },
    reference: { labels: ["Reference"], meaning: "The submission or payment reference from the authority, kept for your records." },
    note: { labels: ["Note"], meaning: "Anything worth remembering about this filing, for example who submitted it." },
    dueOn: { labels: ["Due date"], meaning: "The deadline for this filing. Reminders are based on this date." },
  },
  related: [{ href: "/admin/tax", label: "Tax & compliance" }],
});
