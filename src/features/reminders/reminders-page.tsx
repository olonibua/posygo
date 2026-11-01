"use client";

import type { ReminderAudience, ReminderView } from "@/shared";
import Link from "next/link";

import { StatusPill } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

import { useReminders } from "./reminders-api";
import { resultsLabel, timingLabel } from "./reminder-display";

const GROUPS: ReadonlyArray<{ audience: ReminderAudience; title: string }> = [
  { audience: "SELLER", title: "Sellers" },
  { audience: "PARTNER", title: "Fulfilment partners" },
];

export function RemindersPage() {
  const reminders = useReminders();
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Growth"
        title="Reminder emails"
        lead="Emails that go out on their own when someone stops at a step. Each one stops as soon as they finish it, and nobody gets more than one every 3 days."
      />
      {reminders.isLoading ? <Skeleton className="h-[320px] w-full" /> : null}
      {GROUPS.map((group) => {
        const items = (reminders.data ?? []).filter((reminder) => reminder.audience === group.audience);
        return items.length ? (
          <section key={group.audience} aria-labelledby={`reminders-${group.audience}`} className="flex flex-col gap-3">
            <h2 id={`reminders-${group.audience}`} className="text-h3">
              {group.title}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((reminder) => (
                <ReminderTile key={reminder.key} reminder={reminder} />
              ))}
            </div>
          </section>
        ) : null;
      })}
    </div>
  );
}

function ReminderTile({ reminder }: { reminder: ReminderView }) {
  return (
    <Link
      href={`/admin/reminders/${reminder.key}`}
      className="flex flex-col gap-2 rounded-tile border border-line bg-paper px-5 py-4 no-underline transition-[border-color,translate] duration-200 hover:-translate-y-px hover:border-ink-faint"
    >
      <div className="flex items-start justify-between gap-3">
        <b className="text-body font-semibold">{reminder.title}</b>
        <StatusPill tone={reminder.enabled ? "lime" : "sky"}>{reminder.enabled ? "On" : "Off"}</StatusPill>
      </div>
      <p className="text-small text-ink-soft">{reminder.trigger}</p>
      <p className="text-meta font-normal text-ink-faint">
        {timingLabel(reminder.delaysDays)} · {reminder.waiting} {reminder.waiting === 1 ? "person" : "people"} at this step now
      </p>
      <p className="text-meta font-normal text-ink-faint">{resultsLabel(reminder)}</p>
    </Link>
  );
}
