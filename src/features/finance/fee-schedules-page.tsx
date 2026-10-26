"use client";

import { type FeeScheduleView, hasPermission } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, Select } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Stamp } from "@/components/ui/surfaces";
import { useAdminCountries } from "@/features/countries/admin-countries";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, localeFor } from "@/lib/format";

import { DecisionForm } from "./decision-form";
import { FeeScheduleForm } from "./fee-schedule-form";
import { FeeSummary } from "./fee-summary";
import { FEE_STATUS_DISPLAY } from "./finance-display";
import { FinanceTabs } from "./finance-tabs";
import { useFeeSchedules } from "./use-fee-schedules";

export function FeeSchedulesPage() {
  const user = useCurrentUser();
  const countries = useAdminCountries();
  const [chosen, setChosen] = useState("");
  const countryCode = chosen || (countries.data?.find((country) => country.status === "LIVE")?.code ?? countries.data?.[0]?.code ?? "");
  const { history, propose, decide } = useFeeSchedules(countryCode);
  const [editing, setEditing] = useState(false);
  const locale = localeFor(countryCode);
  const rows = history.data ?? [];
  const active = rows.find((row) => row.status === "ACTIVE");
  const proposed = rows.find((row) => row.status === "PROPOSED");
  const canPropose = hasPermission(user.role, "fees.propose");
  const canApprove = hasPermission(user.role, "fees.approve");

  const columns: Column<FeeScheduleView>[] = [
    { key: "version", header: "Version", render: (row) => <span className="font-medium">v{row.version}</span> },
    { key: "status", header: "Status", render: (row) => <StatusPill tone={FEE_STATUS_DISPLAY[row.status].tone}>{FEE_STATUS_DISPLAY[row.status].label}</StatusPill> },
    {
      key: "note",
      header: "Change",
      render: (row) => (
        <span>
          <span className="block">{row.note}</span>
          <span className="text-meta text-ink-faint">
            {row.proposedByEmail} · {formatDate(row.proposedAt, locale)}
            {row.decidedByEmail ? ` · decided by ${row.decidedByEmail}` : ""}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Finance"
        title="Prices"
        lead="Each market has its own price list. A change only takes effect once a second person approves it, and charges already taken keep the price they were made at."
        action={
          canPropose && active && !proposed && !editing ? (
            <Button variant="yellow" onClick={() => setEditing(true)}>
              Propose a change
            </Button>
          ) : null
        }
      />
      <FinanceTabs current="fees" />
      <div className="max-w-[320px]">
        <Field label="Market">
          {({ id }) => (
            <Select
              id={id}
              value={countryCode}
              onChange={(event) => {
                setChosen(event.target.value);
                setEditing(false);
              }}
            >
              {(countries.data ?? []).map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      {proposed ? (
        <NotebookNote tone="yellow" tilt="none" className="max-w-[860px]">
          <Stamp className="text-cocoa">Waiting for approval · v{proposed.version}</Stamp>
          <p className="mt-2 text-small">
            {proposed.note} — {proposed.proposedByEmail}
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <FeeSummary schedule={proposed.schedule} currency={proposed.currency} locale={locale} title="Proposed prices" />
            {canApprove && proposed.proposedByEmail !== user.email ? (
              <DecisionForm minNote={10} busy={decide.isPending} error={decide.error} onDecide={(approve, note) => decide.mutate({ id: proposed.id, approve, note })} />
            ) : (
              <p className="text-small">Another finance admin needs to approve this.</p>
            )}
          </div>
        </NotebookNote>
      ) : null}
      {editing && active ? (
        <FeeScheduleForm
          base={active.schedule}
          currency={active.currency}
          busy={propose.isPending}
          error={propose.error}
          onCancel={() => setEditing(false)}
          onPropose={(schedule, note) => propose.mutate({ schedule, note }, { onSuccess: () => setEditing(false) })}
        />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section aria-labelledby="history-heading" className="flex flex-col gap-3">
          <h2 id="history-heading" className="text-h3">
            History
          </h2>
          <DataTable
            caption="Price list versions"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            loading={history.isLoading}
            empty={<EmptyState title="No prices yet" body="This market has no price list. Vendors can't send stock until one is approved." />}
          />
        </section>
        {active ? <FeeSummary schedule={active.schedule} currency={active.currency} locale={locale} title={`In use · v${active.version}`} /> : null}
      </div>
    </div>
  );
}
