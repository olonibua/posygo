"use client";

import type { TaxDeadlineView } from "@/shared";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { Paper } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";

import { dueDot, todayIso } from "./tax-display";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthDays(year: number, month: number): Array<string | null> {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const days = Array.from({ length: count }, (_, index) => new Date(Date.UTC(year, month, index + 1)).toISOString().slice(0, 10));
  return [...Array<null>(lead).fill(null), ...days];
}

export function TaxCalendar({ deadlines }: { deadlines: TaxDeadlineView[] }) {
  const today = todayIso();
  const [shown, setShown] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }));
  const days = useMemo(() => monthDays(shown.year, shown.month), [shown]);
  const byDay = useMemo(() => {
    const grouped = new Map<string, TaxDeadlineView[]>();
    for (const deadline of deadlines) {
      grouped.set(deadline.dueOn, [...(grouped.get(deadline.dueOn) ?? []), deadline]);
    }
    return grouped;
  }, [deadlines]);
  const title = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(shown.year, shown.month, 1)));
  const step = (by: number) => setShown(({ year, month }) => ({ year: year + Math.floor((month + by) / 12), month: (((month + by) % 12) + 12) % 12 }));

  return (
    <Paper className="px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-h3">{title}</h2>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" onClick={() => step(-1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper-sunk">
            <Icon name="back" className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Next month" onClick={() => step(1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper-sunk">
            <Icon name="back" className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[12px] font-medium text-ink-faint">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const due = day ? (byDay.get(day) ?? []) : [];
          return (
            <div
              key={day ?? `lead-${index}`}
              className={cn("flex min-h-[44px] flex-col gap-1 rounded-[10px] p-1.5 text-left sm:min-h-[64px]", day ? "bg-paper-sunk" : "", day === today && "ring-2 ring-ink")}
            >
              {day ? <span className="text-[12px] font-medium text-ink-soft">{Number(day.slice(8))}</span> : null}
              {due.map((deadline) => (
                <Link
                  key={deadline.id}
                  href={`/admin/tax/${deadline.countryCode}`}
                  title={`${deadline.obligationTitle} (${deadline.countryCode})`}
                  className="flex items-center gap-1 truncate rounded-[6px] bg-paper no-underline px-1 py-0.5 text-[11px] font-medium leading-4 hover:bg-white"
                >
                  <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dueDot(deadline))} />
                  <span className="truncate">
                    {deadline.countryCode} · {deadline.obligationTitle}
                  </span>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </Paper>
  );
}
