import type { TaxDeadlineView } from "@/shared";

import type { Tone } from "@/components/ui/tone";

const SOON_DAYS = 30;

export function dueLabel(daysLeft: number): string {
  if (daysLeft < 0) {
    return `${-daysLeft} ${daysLeft === -1 ? "day" : "days"} overdue`;
  }
  if (daysLeft === 0) {
    return "Due today";
  }
  return `Due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
}

export function dueTone(daysLeft: number): Tone {
  if (daysLeft < 0) {
    return "pink";
  }
  return daysLeft <= SOON_DAYS ? "yellow" : "sky";
}

export function dueDot(deadline: Pick<TaxDeadlineView, "daysLeft">): string {
  if (deadline.daysLeft < 0) {
    return "bg-magenta-deep";
  }
  return deadline.daysLeft <= SOON_DAYS ? "bg-orange" : "bg-blue";
}

export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
