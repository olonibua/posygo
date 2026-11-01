import { REMINDER_KEYS, type ReminderKey } from "@/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReminderEditorPage } from "@/features/reminders/reminder-editor-page";

export const metadata: Metadata = { title: "Reminder emails" };

function isReminderKey(value: string): value is ReminderKey {
  return (REMINDER_KEYS as readonly string[]).includes(value);
}

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isReminderKey(key)) {
    notFound();
  }
  return <ReminderEditorPage reminderKey={key} />;
}
