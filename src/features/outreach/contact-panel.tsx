"use client";

import { OUTREACH_STATUSES, type OutreachContactDetailView, type OutreachStatus } from "@/shared";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Select, Textarea } from "@/components/ui/form-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { formError } from "@/features/receiving/api-errors";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { useOutreachContact, useRemoveContact, useUpdateContact } from "./outreach-api";
import { OUTREACH_KIND_LABELS, OUTREACH_STATUS_LABELS } from "./outreach-display";

const LOCALE = "en-GB";

export function ContactPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const contact = useOutreachContact(id);
  return (
    <Paper className="flex flex-col gap-4 px-6 py-6">
      {contact.data ? <ContactDetail key={contact.data.status + (contact.data.notes ?? "")} contact={contact.data} onClose={onClose} /> : <Skeleton className="h-[320px] w-full" />}
    </Paper>
  );
}

function ContactDetail({ contact, onClose }: { contact: OutreachContactDetailView; onClose: () => void }) {
  const [status, setStatus] = useState<OutreachStatus>(contact.status);
  const [notes, setNotes] = useState(contact.notes ?? "");
  const [removing, setRemoving] = useState(false);
  const update = useUpdateContact(contact.id);
  const remove = useRemoveContact(contact.id);
  const unsubscribed = contact.status === "UNSUBSCRIBED";

  function save() {
    update.mutate({ ...(unsubscribed ? {} : { status: status as Exclude<OutreachStatus, "UNSUBSCRIBED"> }), notes }, { onSuccess: () => toast.success("Saved", contact.business) });
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Stamp>{OUTREACH_KIND_LABELS[contact.kind]}</Stamp>
          <h2 className="mt-1 text-h3">{contact.business}</h2>
          <p className="text-small text-ink-soft">{[contact.city, contact.country].filter(Boolean).join(", ")}</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-small">
        {contact.contactName ? <Row label="Contact" value={contact.contactName} /> : null}
        <Row label="Email" value={contact.email ?? "None"} />
        {contact.phone ? <Row label="Phone" value={contact.phone} /> : null}
        {contact.website ? (
          <Row
            label="Website"
            value={
              <a href={contact.website} target="_blank" rel="noreferrer">
                {contact.website}
              </a>
            }
          />
        ) : null}
        {contact.source ? (
          <Row
            label="Found at"
            value={
              <a href={contact.source} target="_blank" rel="noreferrer">
                Source
              </a>
            }
          />
        ) : null}
      </dl>
      <FormAlert message={formError(update.error ?? remove.error)} />
      {unsubscribed ? (
        <StatusPill tone="pink">Asked not to be emailed</StatusPill>
      ) : (
        <Field label="Status">
          {({ id }) => (
            <Select id={id} value={status} onChange={(event) => setStatus(event.target.value as OutreachStatus)}>
              {OUTREACH_STATUSES.filter((value) => value !== "UNSUBSCRIBED").map((value) => (
                <option key={value} value={value}>
                  {OUTREACH_STATUS_LABELS[value].label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      )}
      <Field label="Notes">
        {({ id }) => <Textarea id={id} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-[80px]" />}
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button variant="yellow" loading={update.isPending} onClick={save}>
          Save
        </Button>
        {removing ? (
          <Button variant="primary" loading={remove.isPending} onClick={() => remove.mutate(undefined, { onSuccess: onClose })}>
            Yes, remove {contact.business}
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setRemoving(true)}>
            Remove
          </Button>
        )}
      </div>
      <section className="flex flex-col gap-3 border-t border-line pt-4">
        <h3 className="text-small font-semibold">Emails sent ({contact.messages.length})</h3>
        {contact.messages.length === 0 ? <p className="text-small text-ink-soft">Nothing sent yet.</p> : null}
        {contact.messages.map((message) => (
          <details key={message.id} className="rounded-tile border border-line px-4 py-3">
            <summary className="cursor-pointer text-small">
              <span className="font-medium">{message.subject}</span>
              <span className="block text-meta text-ink-faint">
                {formatDateTime(message.sentAt, LOCALE)} · {message.status === "SENT" ? "Sent" : `Failed: ${message.error ?? "unknown error"}`} · {message.sentByEmail}
              </span>
            </summary>
            <p className="mt-3 whitespace-pre-line text-small text-ink-soft">{message.body}</p>
          </details>
        ))}
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="text-ink-faint">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </>
  );
}
