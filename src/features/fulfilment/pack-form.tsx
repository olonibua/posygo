"use client";

import { PACK_LIMITS, type PackagingPresetView, type PackInput } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { formatSize } from "@/features/orders/order-display";
import { fieldError, formError } from "@/features/receiving/api-errors";

const CUSTOM = "custom";

function whole(text: string): number {
  return Number.parseInt(text.replace(/\D/g, ""), 10) || 0;
}

export function PackForm({ presets, ready, busy, error, onPack }: { presets: PackagingPresetView[]; ready: boolean; busy: boolean; error: unknown; onPack: (input: PackInput) => void }) {
  const active = presets.filter((preset) => preset.active);
  const [choice, setChoice] = useState<string>(active[0]?.id ?? CUSTOM);
  const [size, setSize] = useState({ length: "", width: "", height: "" });
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    onPack({
      presetId: choice === CUSTOM ? undefined : choice,
      dimensions: choice === CUSTOM ? { lengthMm: whole(size.length) * 10, widthMm: whole(size.width) * 10, heightMm: whole(size.height) * 10 } : undefined,
      weightGrams: whole(weight),
      notes: notes.trim() || undefined,
    });
  }

  const sideField = (key: keyof typeof size, label: string) => (
    <Field label={label}>{({ id }) => <Input id={id} inputMode="numeric" value={size[key]} onChange={(event) => setSize({ ...size, [key]: event.target.value })} />}</Field>
  );

  return (
    <Paper className="px-6 py-6">
      <Stamp>Record the parcel</Stamp>
      <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <FormAlert message={formError(error)} />
        <div role="group" aria-label="Package" className="flex flex-wrap gap-2">
          {active.map((preset) => (
            <ChoiceChip key={preset.id} tone="sky" selected={choice === preset.id} onToggle={() => setChoice(preset.id)}>
              {preset.label} · {formatSize(preset.lengthMm, preset.widthMm, preset.heightMm)}
            </ChoiceChip>
          ))}
          <ChoiceChip tone="yellow" selected={choice === CUSTOM} onToggle={() => setChoice(CUSTOM)}>
            Another size
          </ChoiceChip>
        </div>
        {fieldError(error, "presetId") ? <p className="text-meta text-danger">{fieldError(error, "presetId")}</p> : null}
        {choice === CUSTOM ? (
          <div className="grid grid-cols-3 gap-3">
            {sideField("length", "Length (cm)")}
            {sideField("width", "Width (cm)")}
            {sideField("height", "Height (cm)")}
          </div>
        ) : null}
        <Field label="Weight on the scale (g)" hint={`Weigh the sealed parcel. Up to ${PACK_LIMITS.maxWeightGrams / 1000} kg.`} error={fieldError(error, "weightGrams")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} value={weight} onChange={(event) => setWeight(event.target.value)} />
          )}
        </Field>
        <Field label="Notes (optional)">{({ id }) => <Textarea id={id} value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} className="min-h-[70px]" />}</Field>
        <Button type="submit" variant="yellow" loading={busy} disabled={!ready || whole(weight) === 0}>
          Record pack
        </Button>
        {!ready ? <p className="text-meta text-ink-faint">Scan every unit first.</p> : null}
      </form>
    </Paper>
  );
}
