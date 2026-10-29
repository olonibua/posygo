"use client";

import type { TaxCountrySummary, TaxDeadlineView } from "@/shared";
import Link from "next/link";

import { StatusPill } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { Paper } from "@/components/ui/surfaces";
import { countryName } from "@/features/onboarding/display";

import { useTaxOverview } from "./tax-api";
import { TaxCalendar } from "./tax-calendar";
import { dueLabel, dueTone, shortDate } from "./tax-display";
import { ThresholdCard } from "./threshold-card";

export function TaxOverviewPage() {
  const overview = useTaxOverview();
  const data = overview.data;
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Money" title="Tax & compliance" lead="What the company files in each country, and when." />
      {data && data.thresholds.length > 0 ? (
        <section aria-label="Registration limits" className="grid gap-4 md:grid-cols-2">
          {data.thresholds.map((threshold) => (
            <ThresholdCard key={threshold.countryCode} threshold={threshold} />
          ))}
        </section>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Upcoming deadlines={data?.upcoming ?? []} loading={overview.isLoading} />
        <TaxCalendar deadlines={data?.upcoming ?? []} />
      </div>
      <section aria-labelledby="tax-countries" className="flex flex-col gap-3">
        <h2 id="tax-countries" className="text-h3">
          Countries
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.countries ?? []).map((country) => (
            <CountryTile key={country.countryCode} country={country} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Upcoming({ deadlines, loading }: { deadlines: TaxDeadlineView[]; loading: boolean }) {
  return (
    <Paper className="px-5 py-5 sm:px-6">
      <h2 className="text-h3">Coming up</h2>
      {deadlines.length === 0 ? (
        <p className="mt-3 text-small text-ink-soft">{loading ? "Loading…" : "Nothing due in the next 90 days."}</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-line">
          {deadlines.map((deadline) => (
            <li key={deadline.id}>
              <Link href={`/admin/tax/${deadline.countryCode}`} className="flex items-center justify-between gap-3 py-3 no-underline hover:opacity-80">
                <span className="min-w-0">
                  <b className="block truncate text-small font-semibold">{deadline.obligationTitle}</b>
                  <span className="text-[13px] text-ink-soft">
                    {countryName(deadline.countryCode)} · {shortDate(deadline.dueOn)}
                  </span>
                </span>
                <StatusPill tone={dueTone(deadline.daysLeft)}>{dueLabel(deadline.daysLeft)}</StatusPill>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Paper>
  );
}

function CountryTile({ country }: { country: TaxCountrySummary }) {
  const summary =
    country.obligations === 0 ? "Not set up yet" : `${country.obligations} ${country.obligations === 1 ? "obligation" : "obligations"}${country.nextDueOn ? ` · next ${shortDate(country.nextDueOn)}` : ""}`;
  return (
    <Link href={`/admin/tax/${country.countryCode}`} className="group rounded-tile border border-line bg-paper px-5 py-4 no-underline transition-[border-color,translate] duration-200 hover:-translate-y-px hover:border-ink-faint">
      <div className="flex items-center justify-between gap-2">
        <b className="text-body font-semibold">{country.countryName}</b>
        {country.overdue > 0 ? <StatusPill tone="pink">{country.overdue} overdue</StatusPill> : country.dueSoon > 0 ? <StatusPill tone="yellow">{country.dueSoon} due soon</StatusPill> : null}
      </div>
      <p className="mt-1 text-[13px] text-ink-soft">{summary}</p>
    </Link>
  );
}
