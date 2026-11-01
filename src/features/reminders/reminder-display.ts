import type { ReminderView } from "@/shared";

export function timingLabel(days: readonly number[]): string {
  const parts = days.map(String);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
  return `After ${list} ${days[days.length - 1] === 1 ? "day" : "days"}`;
}

export function resultsLabel(reminder: ReminderView): string {
  const { sent, completed } = reminder.last30Days;
  return sent === 0 ? "None sent in the last 30 days" : `${sent} sent · ${completed} then did it (last 30 days)`;
}
