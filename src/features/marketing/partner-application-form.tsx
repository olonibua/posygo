"use client";

import { HEARD_FROM, type HeardFrom, type PartnerApplicationInput, type PartnerProgrammeView } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { DraftStatus } from "@/components/ui/draft-status";
import { Checkbox, Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form-controls";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { HEARD_FROM_LABELS } from "@/features/partners/partner-display";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { deviceDraftStore } from "@/lib/drafts/draft-store";
import { useFormDraft } from "@/lib/drafts/use-form-draft";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  city: string;
  address: string;
  postalCode: string;
  spaceDescription: string;
  heardFrom: HeardFrom | "";
  refereeName: string;
  refereeContact: string;
  refereeRelationship: string;
  consent: boolean;
}

const EMPTY: FormState = {
  fullName: "",
  email: "",
  phone: "",
  countryCode: "",
  city: "",
  address: "",
  postalCode: "",
  spaceDescription: "",
  heardFrom: "",
  refereeName: "",
  refereeContact: "",
  refereeRelationship: "",
  consent: false,
};

function withoutConsent(form: FormState): Partial<FormState> {
  return { ...form, consent: false };
}

export function PartnerApplicationForm({ programmes }: { programmes: readonly PartnerProgrammeView[] }) {
  const [form, setForm] = useState<FormState>({ ...EMPTY, countryCode: programmes.length === 1 ? programmes[0]!.countryCode : "" });
  const apply = useMutation({ mutationFn: (input: PartnerApplicationInput) => apiRequest<void>("/v1/public/partner-applications", { method: "POST", body: input, authenticated: false }) });
  const draft = useFormDraft({ key: "partner-application", values: form, onRestore: setForm, store: deviceDraftStore, keep: withoutConsent });
  const set = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));
  const error = (field: string) => fieldError(apply.error, field);

  if (programmes.length === 0) {
    return (
      <NotebookNote tone="yellow" tilt="none">
        <p className="text-small">We aren&apos;t taking applications right now. Check back soon.</p>
      </NotebookNote>
    );
  }

  if (apply.isSuccess) {
    return (
      <NotebookNote tone="lime" tilt="none">
        <Stamp className="text-cocoa">Application received</Stamp>
        <p className="mt-2 text-small">Check your email for a link to set your password. You&apos;ll then complete a few verification steps online. We&apos;ll also contact your referee.</p>
      </NotebookNote>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    apply.mutate(
      {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        countryCode: form.countryCode,
        city: form.city,
        addressLines: [form.address],
        postalCode: form.postalCode,
        spaceDescription: form.spaceDescription,
        heardFrom: form.heardFrom as HeardFrom,
        referee: { name: form.refereeName, contact: form.refereeContact, relationship: form.refereeRelationship },
        consent: true,
      },
      { onSuccess: () => void draft.clear() },
    );
  }

  const text = (label: string, key: keyof FormState, field: string, autoComplete = "off", type = "text") => (
    <Field label={label} error={error(field)}>
      {({ id, invalid }) => <Input id={id} type={type} autoComplete={autoComplete} aria-invalid={invalid} value={String(form[key])} onChange={(event) => set({ [key]: event.target.value })} />}
    </Field>
  );

  return (
    <Paper className="px-6 py-6 sm:px-8">
      <form noValidate onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 md:col-span-2">
          <DraftStatus draft={draft} />
          <FormAlert message={formError(apply.error)} />
        </div>
        {text("Full name", "fullName", "fullName", "name")}
        {text("Email", "email", "email", "email", "email")}
        {text("Phone", "phone", "phone", "tel", "tel")}
        <Field label="Country" error={error("countryCode")}>
          {({ id, invalid }) => (
            <Select id={id} aria-invalid={invalid} value={form.countryCode} onChange={(event) => set({ countryCode: event.target.value })}>
              <option value="">Choose a country</option>
              {programmes.map((programme) => (
                <option key={programme.countryCode} value={programme.countryCode}>
                  {programme.countryName}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {text("Address where you'd store stock", "address", "addressLines", "address-line1")}
        <div className="grid grid-cols-2 gap-4">
          {text("Town or city", "city", "city", "address-level2")}
          {text("Postcode", "postalCode", "postalCode", "postal-code")}
        </div>
        <div className="md:col-span-2">
          <Field label="Tell us about the space" hint="Roughly how big, whether it locks, and how you keep it dry." error={error("spaceDescription")}>
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className="min-h-[96px]"
                value={form.spaceDescription}
                onChange={(event) => set({ spaceDescription: event.target.value })}
              />
            )}
          </Field>
        </div>
        <fieldset className="grid gap-4 md:col-span-2 md:grid-cols-3">
          <legend className="mb-2 text-body font-semibold">A referee from your community</legend>
          {text("Their name", "refereeName", "referee.name")}
          {text("Their email or phone", "refereeContact", "referee.contact")}
          {text("How they know you", "refereeRelationship", "referee.relationship")}
        </fieldset>
        <Field label="How did you hear about us?" error={error("heardFrom")}>
          {({ id, invalid }) => (
            <Select id={id} aria-invalid={invalid} value={form.heardFrom} onChange={(event) => set({ heardFrom: event.target.value as HeardFrom })}>
              <option value="">Choose one</option>
              {HEARD_FROM.map((source) => (
                <option key={source} value={source}>
                  {HEARD_FROM_LABELS[source]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <div className="md:col-span-2">
          <Checkbox
            label="I agree that you can use these details to assess my application, and contact my referee. We only keep what we need and delete documents we no longer need."
            checked={form.consent}
            onChange={(event) => set({ consent: event.target.checked })}
            error={error("consent")}
          />
        </div>
        <div className="flex justify-end md:col-span-2">
          <Button type="submit" variant="yellow" size="lg" loading={apply.isPending} disabled={!form.consent || !form.heardFrom || !form.countryCode}>
            Send application →
          </Button>
        </div>
      </form>
    </Paper>
  );
}
