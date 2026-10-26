"use client";

import { STOREFRONT_TONES, type StorefrontSettingsInput, type StorefrontSettingsView } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Checkbox, Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";

import { TONE_LABELS } from "../storefront-display";
import { useSaveStorefront } from "../use-storefront";

export function StoreSettingsForm({ settings, editable }: { settings: StorefrontSettingsView; editable: boolean }) {
  const [form, setForm] = useState<StorefrontSettingsInput>({
    slug: settings.slug ?? "",
    displayName: settings.displayName,
    about: settings.about ?? "",
    tone: settings.tone,
    returnsAllowed: settings.returnsAllowed,
    returnWindowDays: settings.returnWindowDays,
  });
  const save = useSaveStorefront();
  const set = (patch: Partial<StorefrontSettingsInput>) => setForm((current) => ({ ...current, ...patch }));
  const error = (field: string) => fieldError(save.error, field);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate(form);
  }

  return (
    <Paper className="px-6 py-5">
      <Stamp>Your store</Stamp>
      <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <FormAlert message={formError(save.error)} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Store name" error={error("displayName")}>
            {({ id, invalid }) => <Input id={id} aria-invalid={invalid} disabled={!editable} value={form.displayName} onChange={(event) => set({ displayName: event.target.value })} />}
          </Field>
          <Field label="Store address" hint="Lowercase letters, numbers and hyphens. Buyers visit /store/your-address." error={error("slug")}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                spellCheck={false}
                disabled={!editable}
                value={form.slug}
                onChange={(event) => set({ slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
              />
            )}
          </Field>
        </div>
        <Field label="About your store" hint="Optional. Shown at the top of your store." error={error("about")}>
          {({ id, describedBy, invalid }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              disabled={!editable}
              className="min-h-[80px]"
              value={form.about}
              onChange={(event) => set({ about: event.target.value })}
            />
          )}
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-small font-medium">Colour</legend>
          <div role="group" aria-label="Store colour" className="stagger flex flex-wrap gap-2">
            {STOREFRONT_TONES.map((tone) => (
              <span key={tone} className="motion-rise">
                <ChoiceChip selected={form.tone === tone} tone={tone} onToggle={() => editable && set({ tone })}>
                  {TONE_LABELS[tone]}
                </ChoiceChip>
              </span>
            ))}
          </div>
        </fieldset>
        <div className="grid items-end gap-4 md:grid-cols-2">
          <Checkbox label="Accept returns" disabled={!editable} checked={form.returnsAllowed} onChange={(event) => set({ returnsAllowed: event.target.checked })} />
          <Field label="Days to return" hint="Your payout for each order waits until this has passed." error={error("returnWindowDays")}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                disabled={!editable || !form.returnsAllowed}
                value={String(form.returnWindowDays)}
                onChange={(event) => set({ returnWindowDays: Number(event.target.value.replace(/\D/g, "")) || 0 })}
              />
            )}
          </Field>
        </div>
        {editable ? (
          <div className="flex justify-end">
            <Button type="submit" variant="lime" loading={save.isPending}>
              Save store details
            </Button>
          </div>
        ) : null}
      </form>
    </Paper>
  );
}
