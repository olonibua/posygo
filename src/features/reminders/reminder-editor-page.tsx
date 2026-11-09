"use client";

import { fillReminder, REMINDER_LIMITS, REMINDER_NAME, type ReminderKey, type ReminderView } from "@/shared";
import { type FormEvent, useState } from "react";

import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Checkbox, Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { toast } from "@/lib/toast/toast-store";

import { useReminders, useResetReminder, useSaveReminder, useTestReminder } from "./reminders-api";
import { resultsLabel } from "./reminder-display";

const SAMPLE_NAME = { SELLER: "Ada's Atelier", PARTNER: "Ada" } as const;

export function ReminderEditorPage({ reminderKey }: { reminderKey: ReminderKey }) {
  const reminders = useReminders();
  const reminder = reminders.data?.find((item) => item.key === reminderKey);
  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/reminders">Reminder emails</BackLink>
      {reminder ? <ReminderEditor key={reminder.updatedAt ?? reminder.key} reminder={reminder} /> : <Skeleton className="h-[520px] w-full" />}
    </div>
  );
}

function ReminderEditor({ reminder }: { reminder: ReminderView }) {
  const [enabled, setEnabled] = useState(reminder.enabled);
  const [days, setDays] = useState(reminder.delaysDays.map(String));
  const [subject, setSubject] = useState(reminder.subject);
  const [body, setBody] = useState(reminder.body);
  const save = useSaveReminder(reminder.key);
  const reset = useResetReminder(reminder.key);
  const test = useTestReminder(reminder.key);

  const delaysDays = days.map((day) => Number.parseInt(day, 10)).filter((day) => Number.isFinite(day));

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate({ enabled, delaysDays, subject, body }, { onSuccess: () => toast.success("Saved", enabled ? "This reminder is on." : "This reminder is off.") });
  }

  const name = SAMPLE_NAME[reminder.audience];
  const error = save.error ?? reset.error ?? test.error;
  return (
    <>
      <PageHeader stamp={reminder.audience === "SELLER" ? "Sellers" : "Fulfilment partners"} title={reminder.title} lead={reminder.trigger} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Paper className="px-6 py-6">
          <form noValidate onSubmit={submit} className="flex flex-col gap-5">
            <FormAlert message={formError(error)} />
            <Checkbox label="Send this reminder automatically" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
            <fieldset className="flex flex-col gap-2">
              <legend className="text-small font-medium">Send it after (days at this step)</legend>
              <div className="flex flex-wrap items-end gap-3">
                {days.map((day, index) => (
                  <div key={index} className="w-[96px]">
                    <Field label={`Reminder ${index + 1}`}>
                      {({ id }) => <Input id={id} inputMode="numeric" value={day} onChange={(event) => setDays(days.map((value, at) => (at === index ? event.target.value : value)))} />}
                    </Field>
                  </div>
                ))}
                {days.length < REMINDER_LIMITS.maxSteps ? (
                  <Button variant="ghost" onClick={() => setDays([...days, String((delaysDays[delaysDays.length - 1] ?? 0) + 3)])}>
                    Add one
                  </Button>
                ) : null}
                {days.length > 1 ? (
                  <Button variant="ghost" onClick={() => setDays(days.slice(0, -1))}>
                    Remove last
                  </Button>
                ) : null}
              </div>
              {fieldError(save.error, "delaysDays") ? <p className="text-meta text-danger">{fieldError(save.error, "delaysDays")}</p> : null}
            </fieldset>
            <Field label="Subject" error={fieldError(save.error, "subject")}>
              {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={subject} maxLength={120} onChange={(event) => setSubject(event.target.value)} />}
            </Field>
            <Field label="Message" hint={`Write ${REMINDER_NAME} where the ${reminder.audience === "SELLER" ? "business name" : "partner's first name"} should go. Leave a blank line between paragraphs.`} error={fieldError(save.error, "body")}>
              {({ id, describedBy, invalid }) => (
                <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} value={body} maxLength={2000} onChange={(event) => setBody(event.target.value)} className="min-h-[200px]" />
              )}
            </Field>
            <div className="flex flex-wrap justify-end gap-2">
              {reminder.customised ? (
                <Button variant="ghost" loading={reset.isPending} onClick={() => reset.mutate(undefined, { onSuccess: () => toast.success("Back to the standard wording") })}>
                  Use standard wording
                </Button>
              ) : null}
              <Button variant="ghost" loading={test.isPending} onClick={() => test.mutate({ subject, body }, { onSuccess: (result) => toast.success("Test sent", `Check ${result.to}.`) })}>
                Send me a test
              </Button>
              <Button type="submit" variant="yellow" loading={save.isPending}>
                Save
              </Button>
            </div>
          </form>
        </Paper>
        <aside aria-label="Preview" className="flex flex-col gap-4">
          <Paper className="px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <Stamp>Preview</Stamp>
              <StatusPill tone={enabled ? "lime" : "sky"}>{enabled ? "On" : "Off"}</StatusPill>
            </div>
            <p className="mt-4 text-body font-semibold">{fillReminder(subject, name)}</p>
            <div className="mt-3 flex flex-col gap-3 text-small text-ink-soft">
              {fillReminder(body, name)
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
            </div>
            <span className="mt-4 inline-block rounded-control bg-ink px-4 py-2.5 text-small font-medium text-on-ink">{reminder.actionLabel}</span>
            <p className="mt-4 text-meta font-normal text-ink-faint">Every reminder ends with a link to stop them.</p>
          </Paper>
          <Paper className="px-6 py-5">
            <Stamp>Results</Stamp>
            <p className="mt-2 text-small">{resultsLabel(reminder)}</p>
            <p className="mt-1 text-meta font-normal text-ink-faint">
              {reminder.waiting} {reminder.waiting === 1 ? "person is" : "people are"} at this step now.
            </p>
          </Paper>
        </aside>
      </div>
    </>
  );
}
