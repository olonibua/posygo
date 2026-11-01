import type { UpdateReminderInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const REMINDERS_KNOWLEDGE = describePage({
  route: "/admin/reminders",
  title: "Reminder emails",
  purpose: "Emails that go out on their own when a seller or partner stops at a step, such as not confirming their email or not sending a first shipment.",
  steps: [
    "Open a reminder to see who it's for and when it goes out.",
    "Switch it on once you're happy with the wording.",
    "Check the results: how many were sent in the last 30 days and how many people then finished the step.",
  ],
  fields: {},
  related: [{ href: "/admin/support", label: "Email log" }],
});

export const REMINDER_EDITOR_KNOWLEDGE = describePage<UpdateReminderInput>({
  route: "/admin/reminders/[key]",
  title: "Edit a reminder email",
  purpose: "Turn one reminder on or off, choose when it goes out and change its wording. Reminders stop as soon as the person finishes the step, nobody gets more than one every 3 days, and every email has a link to stop them.",
  steps: ["Choose the days for up to 3 reminders.", "Write the subject and message. Use {name} for the business or partner's name.", "Send yourself a test, then save."],
  fields: {
    enabled: { labels: ["Send this reminder automatically"], meaning: "When ticked, the reminder goes out on its own twice a day to people at this step." },
    delaysDays: { labels: ["Send it after (days at this step)", "Reminder 1", "Reminder 2", "Reminder 3"], meaning: "How many days after reaching the step each reminder goes out.", mistakes: ["Each reminder must come later than the one before.", "Use 1 to 120 days."] },
    subject: { labels: ["Subject"], meaning: "The email subject line.", mistakes: ["Use 3 to 120 characters."] },
    body: { labels: ["Message"], meaning: "The email text. {name} is replaced with the business name for sellers or the first name for partners.", mistakes: ["Use 20 to 2,000 characters."] },
  },
  related: [{ href: "/admin/reminders", label: "Reminder emails" }],
});

export const STOP_REMINDERS_KNOWLEDGE = describePage({
  route: "/reminders/stop",
  title: "Stop reminder emails",
  purpose: "Opened from the link at the bottom of a reminder email. It stops all reminder emails for that address. Emails about your account, orders and payments still arrive.",
  steps: ["Open the link from the reminder email.", "Wait for the page to confirm reminders are stopped."],
  fields: {},
  related: [{ href: "/", label: "Posygo home" }],
});
