"use client";

import { PACK_LIMITS, PACKAGING_KINDS, type PackagingKind, type PackagingPresetView, type PackInput } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { formatSize, formatWeight } from "@/features/orders/order-display";
import { fieldError, formError } from "@/features/receiving/api-errors";

const CUSTOM = "custom";
const GROUP_LABELS: Record<PackagingKind, string> = { BOX: "Boxes", MAILER: "Mailers", BAG: "Bags" };

function whole(text: string): number {
  return Number.parseInt(text.replace(/\D/g, ""), 10) || 0;
}

interface PackFormProps {
  presets: PackagingPresetView[];
  ready: boolean;
  busy: boolean;
  error: unknown;
  onPack: (input: PackInput) => void;
}

export function PackForm({ presets, ready, busy, error, onPack }: PackFormProps) {
  const active = presets.filter((preset) => preset.active);
  const [choice, setChoice] = useState<string | null>(null);
  const [size, setSize] = useState({ length: "", width: "", height: "" });
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const chosen = active.find((preset) => preset.id === choice);
  const dimensions = chosen
    ? { lengthMm: chosen.lengthMm, widthMm: chosen.widthMm, heightMm: chosen.heightMm }
    : { lengthMm: whole(size.length) * 10, widthMm: whole(size.width) * 10, heightMm: whole(size.height) * 10 };
  const sized = choice !== null && dimensions.lengthMm > 0 && dimensions.widthMm > 0 && dimensions.heightMm > 0;
  const grams = whole(weight);

  function submit(event: FormEvent) {
    event.preventDefault();
    onPack({ presetId: chosen?.id, dimensions: chosen ? undefined : dimensions, weightGrams: grams, notes: notes.trim() || undefined });
  }

  const sideField = (key: keyof typeof size, label: string) => (
    <Field label={label}>{({ id }) => <Input id={id} inputMode="numeric" value={size[key]} onChange={(event) => setSize({ ...size, [key]: event.target.value })} />}</Field>
  );

  return (
    <Paper className="px-6 py-6">
      <Stamp>Pack the parcel</Stamp>
      <p className="mt-2 text-small text-ink-soft">Choose what you&apos;re sending it in, then weigh it once it&apos;s sealed. The courier price comes from this size and weight.</p>
      <form noValidate onSubmit={submit} className="mt-5 flex flex-col gap-5">
        <FormAlert message={formError(error)} />
        <div role="group" aria-label="Packaging" className="flex flex-col gap-4">
          {PACKAGING_KINDS.map((kind) => {
            const options = active.filter((preset) => preset.kind === kind);
            return options.length === 0 ? null : (
              <div key={kind} className="flex flex-col gap-2">
                <p className="text-meta font-medium text-ink-soft">{GROUP_LABELS[kind]}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map((preset) => (
                    <ChoiceChip key={preset.id} tone="sky" selected={choice === preset.id} onToggle={() => setChoice(preset.id)}>
                      {preset.label} · {formatSize(preset.lengthMm, preset.widthMm, preset.heightMm)}
                    </ChoiceChip>
                  ))}
                </div>
              </div>
            );
          })}
          <div>
            <ChoiceChip tone="yellow" selected={choice === CUSTOM} onToggle={() => setChoice(CUSTOM)}>
              Something else
            </ChoiceChip>
          </div>
        </div>
        {fieldError(error, "presetId") ? <p className="text-meta text-danger">{fieldError(error, "presetId")}</p> : null}
        {choice === CUSTOM ? (
          <div className="flex flex-col gap-2">
            <p className="text-meta text-ink-soft">Measure the packed parcel. For a soft bag, measure it lying flat.</p>
            <div className="grid grid-cols-3 gap-3">
              {sideField("length", "Length (cm)")}
              {sideField("width", "Width (cm)")}
              {sideField("height", "Height (cm)")}
            </div>
          </div>
        ) : null}
        <Field label="Weight on the scale (g)" hint={`Weigh the sealed parcel, packaging included. Up to ${PACK_LIMITS.maxWeightGrams / 1000} kg.`} error={fieldError(error, "weightGrams")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} value={weight} onChange={(event) => setWeight(event.target.value)} />
          )}
        </Field>
        <Field label="Notes (optional)">{({ id }) => <Textarea id={id} value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} className="min-h-[70px]" />}</Field>
        {sized && grams > 0 ? (
          <p className="rounded-card bg-paper-sunk px-4 py-3 text-small">
            Courier prices will be for <b className="font-semibold">{formatSize(dimensions.lengthMm, dimensions.widthMm, dimensions.heightMm)}</b>,{" "}
            <b className="font-semibold">{formatWeight(grams)}</b>.
          </p>
        ) : null}
        <Button type="submit" variant="yellow" loading={busy} disabled={!ready || grams === 0 || !sized}>
          Save and get courier prices
        </Button>
        {!ready ? <p className="text-meta text-ink-faint">Scan every unit first.</p> : null}
      </form>
    </Paper>
  );
}
