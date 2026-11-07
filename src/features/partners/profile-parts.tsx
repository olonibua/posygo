"use client";

import type { PartnerProfileInput } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { fieldError, formError } from "@/features/receiving/api-errors";

export function ProfileDetails({ profile }: { profile: PartnerProfileInput }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-small sm:grid-cols-2">
      {[
        ["Name", profile.fullName],
        ["Phone", profile.phone],
        ["Storage address", [...profile.addressLines, profile.city, profile.postalCode].join(", ")],
        ["Space", profile.spaceDescription],
      ].map(([label, value]) => (
        <div key={label}>
          <dt className="text-ink-faint">{label}</dt>
          <dd className="whitespace-pre-wrap">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

interface ProfileFormProps {
  initial: PartnerProfileInput;
  submitLabel: string;
  pending: boolean;
  error: unknown;
  onSubmit: (profile: PartnerProfileInput) => void;
  onCancel?: () => void;
}

export function ProfileForm({ initial, submitLabel, pending, error, onSubmit, onCancel }: ProfileFormProps) {
  const [form, setForm] = useState<PartnerProfileInput>(initial);
  const set = (patch: Partial<PartnerProfileInput>) => setForm((current) => ({ ...current, ...patch }));
  const errorFor = (field: string) => fieldError(error, field);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ ...form, addressLines: form.addressLines.filter((line) => line.trim()) });
  }

  return (
    <form noValidate onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormAlert message={formError(error) ?? errorFor("profile") ?? null} />
      </div>
      <Field label="Full name" hint="As it appears on your ID." error={errorFor("fullName")}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid} value={form.fullName} onChange={(event) => set({ fullName: event.target.value })} />
        )}
      </Field>
      <Field label="Phone" error={errorFor("phone")}>
        {({ id, invalid }) => <Input id={id} type="tel" autoComplete="tel" aria-invalid={invalid} value={form.phone} onChange={(event) => set({ phone: event.target.value })} />}
      </Field>
      <Field label="Storage address" error={errorFor("addressLines") ?? errorFor("addressLines.0")}>
        {({ id, invalid }) => (
          <Input
            id={id}
            autoComplete="address-line1"
            aria-invalid={invalid}
            value={form.addressLines[0] ?? ""}
            onChange={(event) => set({ addressLines: [event.target.value, ...form.addressLines.slice(1)] })}
          />
        )}
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" error={errorFor("city")}>
          {({ id, invalid }) => <Input id={id} autoComplete="address-level2" aria-invalid={invalid} value={form.city} onChange={(event) => set({ city: event.target.value })} />}
        </Field>
        <Field label="Postcode" error={errorFor("postalCode")}>
          {({ id, invalid }) => <Input id={id} autoComplete="postal-code" aria-invalid={invalid} value={form.postalCode} onChange={(event) => set({ postalCode: event.target.value })} />}
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="About the space" error={errorFor("spaceDescription")}>
          {({ id, invalid }) => <Textarea id={id} aria-invalid={invalid} className="min-h-[80px]" value={form.spaceDescription} onChange={(event) => set({ spaceDescription: event.target.value })} />}
        </Field>
      </div>
      <div className="flex justify-end gap-2 md:col-span-2">
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="lime" loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
