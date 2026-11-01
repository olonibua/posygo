import type { Metadata } from "next";

import { RemindersPage } from "@/features/reminders/reminders-page";

export const metadata: Metadata = { title: "Reminder emails" };

export default function Page() {
  return <RemindersPage />;
}
