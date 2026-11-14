"use client";

import { fillOutreach, OUTREACH_FIELDS, OUTREACH_LIMITS, type OutreachContactView, type OutreachDesign, type OutreachSendResultView } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";

import { useOutreachTemplates, useSendOutreach } from "./outreach-api";

interface ComposePanelProps {
  recipients: OutreachContactView[];
  onSent: () => void;
  onCancel: () => void;
}

export function ComposePanel({ recipients, onSent, onCancel }: ComposePanelProps) {
  const templates = useOutreachTemplates();
  const send = useSendOutreach();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [design, setDesign] = useState<OutreachDesign | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<OutreachSendResultView | null>(null);
  const sample = recipients[0];

  function applyTemplate(id: string) {
    const template = templates.data?.find((item) => item.id === id);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setDesign(template.design);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    send.mutate(
      { contactIds: recipients.map((contact) => contact.id), subject, body, design },
      {
        onSuccess: (outcome) => {
          setResult(outcome);
          setConfirming(false);
          onSent();
        },
        onError: () => setConfirming(false),
      },
    );
  }

  if (result) {
    return (
      <Paper className="flex flex-col gap-3 px-6 py-6">
        <Stamp>Sent</Stamp>
        <p className="text-body">
          {result.sent} {result.sent === 1 ? "email" : "emails"} sent{result.failed ? `, ${result.failed} failed` : ""}. {result.sentToday} of {OUTREACH_LIMITS.perDay} used today.
        </p>
        {result.skipped.length ? (
          <ul className="flex flex-col gap-1 text-small text-ink-soft">
            {result.skipped.map((skip) => (
              <li key={skip.contactId}>
                Skipped {skip.business}: {skip.reason.toLowerCase()}.
              </li>
            ))}
          </ul>
        ) : null}
        <div>
          <Button variant="ghost" onClick={onCancel}>
            Close
          </Button>
        </div>
      </Paper>
    );
  }

  return (
    <Paper className="px-6 py-6">
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <Stamp>
          Email {recipients.length} {recipients.length === 1 ? "contact" : "contacts"}
        </Stamp>
        <FormAlert message={formError(send.error)} />
        <Field label="Start from a template">
          {({ id }) => (
            <Select id={id} defaultValue="" onChange={(event) => applyTemplate(event.target.value)}>
              <option value="" disabled>
                Choose a template
              </option>
              {(templates.data ?? []).map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {design ? (
          <p className="rounded-tile bg-lime px-4 py-3 text-small text-cocoa">
            This sends the designed email with the animated pictures and the WhatsApp button, filled in for each contact. The message below is the plain-text copy for email apps that don&apos;t show
            pictures.
          </p>
        ) : null}
        <Field label="Subject" error={fieldError(send.error, "subject")}>
          {({ id }) => <Input id={id} maxLength={150} value={subject} onChange={(event) => setSubject(event.target.value)} />}
        </Field>
        <Field label="Message" hint={`These fill in for each contact: ${OUTREACH_FIELDS.join(", ")}. An unsubscribe link is added at the bottom.`} error={fieldError(send.error, "body")}>
          {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} maxLength={5000} value={body} onChange={(event) => setBody(event.target.value)} className="min-h-[260px]" />}
        </Field>
        {sample && (subject || body) ? (
          <div className="rounded-tile border border-line bg-paper-sunk px-4 py-4">
            <p className="text-meta uppercase text-ink-faint">Preview for {sample.business}</p>
            <p className="mt-2 text-small font-semibold">{fillOutreach(subject, sample)}</p>
            <p className="mt-2 whitespace-pre-line text-small text-ink-soft">{fillOutreach(body, sample)}</p>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant={confirming ? "primary" : "yellow"} loading={send.isPending} disabled={!subject.trim() || !body.trim()}>
            {confirming ? `Yes, send to ${recipients.length}` : "Send"}
          </Button>
          <Button variant="ghost" onClick={confirming ? () => setConfirming(false) : onCancel}>
            {confirming ? "Not yet" : "Cancel"}
          </Button>
          {confirming ? <span className="text-small text-ink-soft">Emails go from hello@posygo.com and can&apos;t be unsent.</span> : null}
        </div>
      </form>
    </Paper>
  );
}
