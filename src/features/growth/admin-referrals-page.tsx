"use client";

import { hasPermission, type PublicCountry, type ReferralCampaignView, type ReferralRowView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, FormAlert, Input, Select } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { toMinor } from "@/features/finance/money-input";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, formatMoney, localeFor } from "@/lib/format";

import { useCampaignActive, useCampaigns, useCreateCampaign, useReferrals, useVoidReferral } from "./use-referrals";

const STATUS = { REGISTERED: { label: "Waiting for first stock", tone: "sky" }, REWARDED: { label: "Credited", tone: "lime" }, VOID: { label: "Cancelled", tone: "cocoa" } } as const;

function NewCampaign({ countryCode }: { countryCode: string }) {
  const create = useCreateCampaign();
  const countries = useQuery({ queryKey: ["countries", "live"], queryFn: () => apiRequest<PublicCountry[]>("/v1/countries", { authenticated: false }) });
  const [form, setForm] = useState({ countryCode, code: "", name: "", credit: "", maxSignups: "" });
  const currency = countries.data?.find((country) => country.code === form.countryCode)?.currency ?? "GBP";
  const credit = toMinor(form.credit, currency);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (credit === null) {
      return;
    }
    create.mutate(
      { countryCode: form.countryCode, code: form.code.trim(), name: form.name.trim(), refereeCreditMinor: credit, ...(form.maxSignups ? { maxSignups: Number(form.maxSignups) } : {}) },
      { onSuccess: () => setForm({ ...form, code: "", name: "", credit: "", maxSignups: "" }) },
    );
  }
  return (
    <Paper className="px-6 py-5">
      <Stamp>New campaign code</Stamp>
      <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <FormAlert message={formError(create.error)} />
        <div className="grid gap-4 md:grid-cols-5">
          <Field label="Market" error={fieldError(create.error, "countryCode")}>
            {({ id }) => (
              <Select id={id} value={form.countryCode} onChange={(event) => setForm({ ...form, countryCode: event.target.value })}>
                {(countries.data ?? []).map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Code" error={fieldError(create.error, "code")}>
            {({ id }) => <Input id={id} maxLength={40} className="uppercase" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />}
          </Field>
          <Field label="Name" error={fieldError(create.error, "name")}>
            {({ id }) => <Input id={id} maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />}
          </Field>
          <Field label={`Welcome credit (${currency})`} error={fieldError(create.error, "refereeCreditMinor")}>
            {({ id }) => <Input id={id} inputMode="decimal" value={form.credit} onChange={(event) => setForm({ ...form, credit: event.target.value })} />}
          </Field>
          <Field label="Sign-up limit (optional)">
            {({ id }) => <Input id={id} inputMode="numeric" value={form.maxSignups} onChange={(event) => setForm({ ...form, maxSignups: event.target.value.replace(/\D/g, "") })} />}
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="lime" loading={create.isPending} disabled={credit === null || form.code.trim().length < 3 || form.name.trim().length < 3}>
            Create code
          </Button>
        </div>
      </form>
    </Paper>
  );
}

export function AdminReferralsPage() {
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "referrals.manage");
  const referrals = useReferrals();
  const campaigns = useCampaigns();
  const toggle = useCampaignActive();
  const cancel = useVoidReferral();
  const money = (amount: number, row: { currency: string; countryCode: string }) => formatMoney(amount, row.currency, localeFor(row.countryCode));

  const campaignColumns: Column<ReferralCampaignView>[] = [
    { key: "code", header: "Code", render: (row) => <span className="font-mono font-medium">{row.code}</span> },
    { key: "name", header: "Campaign", render: (row) => `${row.name} · ${row.countryCode}` },
    { key: "credit", header: "Welcome credit", align: "right", render: (row) => <span className="tabular-nums">{money(row.refereeCreditMinor, row)}</span> },
    { key: "signups", header: "Sign-ups", align: "right", render: (row) => <span className="tabular-nums">{row.maxSignups ? `${row.signups} of ${row.maxSignups}` : row.signups}</span> },
    { key: "state", header: "", render: (row) => (row.active ? <StatusPill tone="lime">On</StatusPill> : <StatusPill tone="cocoa">Off</StatusPill>) },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) =>
        canManage ? (
          <Button variant="ghost" onClick={() => toggle.mutate({ id: row.id, active: !row.active })}>
            {row.active ? "Stop" : "Restart"}
          </Button>
        ) : null,
    },
  ];
  const referralColumns: Column<ReferralRowView>[] = [
    {
      key: "who",
      header: "New vendor",
      render: (row) => (
        <span>
          <span className="block font-medium">{row.referredName}</span>
          <span className="text-meta text-ink-faint">
            {row.referrerName ? `Referred by ${row.referrerName}` : `Campaign: ${row.campaignName ?? row.codeUsed}`} · {formatDate(row.createdAt, localeFor(row.countryCode))}
          </span>
        </span>
      ),
    },
    {
      key: "credits",
      header: "Credits",
      align: "right",
      render: (row) => <span className="tabular-nums">{`${money(row.refereeCreditMinor, row)}${row.referrerName ? ` + ${money(row.referrerCreditMinor, row)}` : ""}`}</span>,
    },
    { key: "status", header: "Status", render: (row) => <StatusPill tone={STATUS[row.status].tone}>{STATUS[row.status].label}</StatusPill> },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) =>
        canManage && row.status === "REGISTERED" ? (
          <Button variant="ghost" onClick={() => cancel.mutate({ id: row.id, reason: "Cancelled by finance after a check" })}>
            Cancel
          </Button>
        ) : null,
    },
  ];
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Growth"
        title="Referrals"
        lead="Vendors share their own codes; you can also run campaign codes for events and partners. Credits are paid once the new vendor is trading and their first stock has arrived."
      />
      {canManage ? <NewCampaign countryCode={user.countryCode ?? "GB"} /> : null}
      <FormAlert message={formError(toggle.error) ?? formError(cancel.error)} />
      <section aria-labelledby="campaigns-heading" className="flex flex-col gap-3">
        <h2 id="campaigns-heading" className="text-h3">
          Campaign codes
        </h2>
        <DataTable
          caption="Campaign codes"
          columns={campaignColumns}
          rows={campaigns.data ?? []}
          rowKey={(row) => row.id}
          loading={campaigns.isLoading}
          empty={<EmptyState title="No campaigns yet" body="Create a code for an event or a partner." />}
        />
      </section>
      <section aria-labelledby="referrals-heading" className="flex flex-col gap-3">
        <h2 id="referrals-heading" className="text-h3">
          Sign-ups
        </h2>
        <DataTable
          caption="Referred sign-ups"
          columns={referralColumns}
          rows={referrals.data ?? []}
          rowKey={(row) => row.id}
          loading={referrals.isLoading}
          empty={<EmptyState title="No referrals yet" body="Businesses that join with a code show up here." />}
        />
      </section>
    </div>
  );
}
