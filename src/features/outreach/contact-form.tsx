"use client";

import { OUTREACH_KINDS, type OutreachContactInput, type OutreachKind } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form-controls";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { toast } from "@/lib/toast/toast-store";

import { useAddContact } from "./outreach-api";
import { OUTREACH_KIND_LABELS } from "./outreach-display";

const EMPTY = { business: "", contactName: "", email: "", phone: "", website: "", country: "", city: "", kind: "PREP_CENTRE" as OutreachKind, notes: "" };

export function ContactForm({ onDone }: { onDone: () => void }) {
  const [values, setValues] = useState(EMPTY);
  const add = useAddContact();
  const set = (patch: Partial<typeof EMPTY>) => setValues((current) => ({ ...current, ...patch }));

  function submit(event: FormEvent) {
    event.preventDefault();
    add.mutate(values as OutreachContactInput, {
      onSuccess: (contact) => {
        toast.success("Contact added", contact.business);
        onDone();
      },
    });
  }

  const text = (key: keyof typeof EMPTY, label: string, type = "text") => (
    <Field label={label} error={fieldError(add.error, key)}>
      {({ id }) => <Input id={id} type={type} value={values[key]} onChange={(event) => set({ [key]: event.target.value })} />}
    </Field>
  );

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <FormAlert message={formError(add.error)} />
      <div className="grid gap-4 sm:grid-cols-2">
        {text("business", "Business")}
        <Field label="Type">
          {({ id }) => (
            <Select id={id} value={values.kind} onChange={(event) => set({ kind: event.target.value as OutreachKind })}>
              {OUTREACH_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {OUTREACH_KIND_LABELS[kind]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {text("contactName", "Contact name (optional)")}
        {text("email", "Email", "email")}
        {text("country", "Country")}
        {text("city", "City (optional)")}
        {text("phone", "Phone (optional)", "tel")}
        {text("website", "Website (optional)", "url")}
      </div>
      <Field label="Notes (optional)" error={fieldError(add.error, "notes")}>
        {({ id }) => <Textarea id={id} maxLength={1000} value={values.notes} onChange={(event) => set({ notes: event.target.value })} className="min-h-[70px]" />}
      </Field>
      <div className="flex gap-3">
        <Button type="submit" variant="yellow" loading={add.isPending}>
          Add contact
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
