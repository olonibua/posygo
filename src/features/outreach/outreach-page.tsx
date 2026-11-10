"use client";

import { OUTREACH_STATUSES, type OutreachContactView, type OutreachStatus } from "@/shared";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper } from "@/components/ui/surfaces";
import { formatDate } from "@/lib/format";

import { ComposePanel } from "./compose-panel";
import { ContactForm } from "./contact-form";
import { ContactPanel } from "./contact-panel";
import { ImportForm } from "./import-form";
import { type OutreachFilters, useOutreachContacts } from "./outreach-api";
import { OUTREACH_KIND_LABELS, OUTREACH_STATUS_LABELS } from "./outreach-display";

type Panel = "add" | "import" | "compose" | null;

function emailable(contact: OutreachContactView): boolean {
  return contact.email !== null && contact.status !== "UNSUBSCRIBED";
}

export function OutreachPage() {
  const [filters, setFilters] = useState<OutreachFilters>({ status: "", country: "", q: "" });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [panel, setPanel] = useState<Panel>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const contacts = useOutreachContacts(filters);
  const all = useOutreachContacts({ status: "", country: "", q: "" });
  const rows = useMemo(() => contacts.data ?? [], [contacts.data]);
  const countries = useMemo(() => [...new Set((all.data ?? []).map((contact) => contact.country))].sort(), [all.data]);
  const eligible = rows.filter(emailable);
  const recipients = rows.filter((contact) => selected.has(contact.id));

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  const allPicked = eligible.length > 0 && eligible.every((contact) => selected.has(contact.id));

  const columns: Column<OutreachContactView>[] = [
    {
      key: "pick",
      header: "",
      render: (contact) => (
        <input
          type="checkbox"
          aria-label={`Select ${contact.business}`}
          className="size-4 accent-ink"
          disabled={!emailable(contact)}
          checked={selected.has(contact.id)}
          onChange={() => toggle(contact.id)}
        />
      ),
    },
    {
      key: "business",
      header: "Business",
      render: (contact) => (
        <button type="button" className="text-left" onClick={() => setOpenId(contact.id)}>
          <span className="font-medium underline-offset-2 hover:underline">{contact.business}</span>
          <span className="block text-meta text-ink-faint">{OUTREACH_KIND_LABELS[contact.kind]}</span>
        </button>
      ),
    },
    { key: "where", header: "Where", render: (contact) => <span className="text-small">{[contact.city, contact.country].filter(Boolean).join(", ")}</span> },
    { key: "email", header: "Email", render: (contact) => <span className="text-small">{contact.email ?? <span className="text-ink-faint">No email</span>}</span> },
    { key: "status", header: "Status", render: (contact) => <StatusPill tone={OUTREACH_STATUS_LABELS[contact.status].tone}>{OUTREACH_STATUS_LABELS[contact.status].label}</StatusPill> },
    { key: "last", header: "Last emailed", render: (contact) => <span className="text-small text-ink-soft">{contact.lastMessagedAt ? formatDate(contact.lastMessagedAt, "en-GB") : "Never"}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        stamp="Growth"
        title="Partner outreach"
        lead="Keep a list of businesses and people who could become fulfilment partners, email them from hello@posygo.com and track who replies."
        action={
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => setPanel(panel === "import" ? null : "import")}>
              Import list
            </Button>
            <Button variant="yellow" onClick={() => setPanel(panel === "add" ? null : "add")}>
              Add contact
            </Button>
          </div>
        }
      />
      {panel === "add" || panel === "import" ? (
        <Paper className="px-6 py-6">{panel === "add" ? <ContactForm onDone={() => setPanel(null)} /> : <ImportForm onDone={() => setPanel(null)} />}</Paper>
      ) : null}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-[200px]">
          <Field label="Status">
            {({ id }) => (
              <Select id={id} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as OutreachStatus | "" }))}>
                <option value="">All</option>
                {OUTREACH_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {OUTREACH_STATUS_LABELS[status].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <div className="w-full sm:w-[200px]">
          <Field label="Country">
            {({ id }) => (
              <Select id={id} value={filters.country} onChange={(event) => setFilters((current) => ({ ...current, country: event.target.value }))}>
                <option value="">All</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <div className="w-full sm:w-[260px]">
          <Field label="Search">
            {({ id }) => <Input id={id} type="search" placeholder="Business, email or city" value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} />}
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-small">
          <input
            type="checkbox"
            className="size-4 accent-ink"
            disabled={eligible.length === 0}
            checked={allPicked}
            onChange={() => setSelected(allPicked ? new Set() : new Set(eligible.map((contact) => contact.id)))}
          />
          Select everyone with an email
        </label>
        <Button variant="primary" disabled={recipients.length === 0} onClick={() => setPanel("compose")}>
          Write email to {recipients.length || "…"}
        </Button>
      </div>
      {panel === "compose" && recipients.length > 0 ? <ComposePanel recipients={recipients} onSent={() => setSelected(new Set())} onCancel={() => setPanel(null)} /> : null}
      <div className={openId ? "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]" : ""}>
        <DataTable
          caption="Outreach contacts"
          columns={columns}
          rows={rows}
          rowKey={(contact) => contact.id}
          loading={contacts.isLoading}
          empty="No contacts yet. Add one, or import a list from a spreadsheet."
        />
        {openId ? <ContactPanel id={openId} onClose={() => setOpenId(null)} /> : null}
      </div>
    </div>
  );
}
