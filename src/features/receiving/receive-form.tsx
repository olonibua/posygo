"use client";

import { type InboundDetailView, type ReceiveInboundInput, STORAGE_TIERS, type StorageTier } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";

import { fieldError, formError } from "./api-errors";
import { PhotoCollector } from "./photo-collector";

interface LineCount {
  accepted: string;
  damaged: string;
  damagePhotos: string[];
  note: string;
}

const toNumber = (value: string) => (value.trim() === "" ? 0 : Number(value));

export function ReceiveForm({
  inbound,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  inbound: InboundDetailView;
  busy: boolean;
  error: unknown;
  onSubmit: (input: ReceiveInboundInput) => void;
  onCancel: () => void;
}) {
  const [boxes, setBoxes] = useState<Record<StorageTier, string>>(
    () => Object.fromEntries(STORAGE_TIERS.map((tier) => [tier, ""])) as Record<StorageTier, string>,
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Record<string, LineCount>>(() =>
    Object.fromEntries(inbound.lines.map((line) => [line.id, { accepted: "", damaged: "0", damagePhotos: [], note: "" }])),
  );
  const [problem, setProblem] = useState<string | null>(null);
  const setLine = (lineId: string, patch: Partial<LineCount>) => setLines((current) => ({ ...current, [lineId]: { ...current[lineId]!, ...patch } }));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (inbound.lines.some((line) => lines[line.id]!.accepted.trim() === "")) {
      setProblem("Count the good units of every product, even if it's 0.");
      return;
    }
    if (photos.length === 0) {
      setProblem("Add at least one photo of the shipment.");
      return;
    }
    const missingDamagePhotos = inbound.lines.some((line) => toNumber(lines[line.id]!.damaged) > 0 && lines[line.id]!.damagePhotos.length === 0);
    if (missingDamagePhotos) {
      setProblem("Photograph the damaged units on every line that has them.");
      return;
    }
    setProblem(null);
    onSubmit({
      boxCounts: Object.fromEntries(STORAGE_TIERS.map((tier) => [tier, toNumber(boxes[tier])])),
      photoFileIds: photos,
      note: note.trim() || undefined,
      lines: inbound.lines.map((line) => {
        const count = lines[line.id]!;
        return { lineId: line.id, acceptedQuantity: toNumber(count.accepted), damagedQuantity: toNumber(count.damaged), damagePhotoFileIds: count.damagePhotos, note: count.note.trim() || undefined };
      }),
    });
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <FormAlert message={problem ?? formError(error)} />
      <Paper className="flex flex-col gap-4 px-6 py-5">
        <Stamp>Boxes counted</Stamp>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {STORAGE_TIERS.map((tier) => (
            <Field key={tier} label={STORAGE_TIER_LABELS[tier].label}>
              {({ id }) => (
                <Input id={id} type="number" min={0} max={500} inputMode="numeric" value={boxes[tier]} onChange={(event) => setBoxes((current) => ({ ...current, [tier]: event.target.value }))} />
              )}
            </Field>
          ))}
        </div>
        {fieldError(error, "boxCounts") ? <p className="text-meta text-danger">{fieldError(error, "boxCounts")}</p> : null}
      </Paper>
      <Paper className="flex flex-col gap-4 px-6 py-5">
        <Stamp>Shipment photos</Stamp>
        <PhotoCollector label="Photo of the shipment" hint="Every box, labels visible." max={30} error={fieldError(error, "photoFileIds")} onChange={setPhotos} />
      </Paper>
      {inbound.lines.map((line) => (
        <LineCountCard key={line.id} line={line} count={lines[line.id]!} onChange={(patch) => setLine(line.id, patch)} />
      ))}
      <Field label="Notes for the vendor" hint="Optional.">
        {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={note} maxLength={1000} onChange={(event) => setNote(event.target.value)} className="min-h-[90px]" />}
      </Field>
      <div className="flex justify-end gap-3 border-t border-line pt-6">
        <Button variant="ghost" onClick={onCancel}>
          Back
        </Button>
        <Button type="submit" variant="yellow" loading={busy}>
          Save counts
        </Button>
      </div>
    </form>
  );
}

function LineCountCard({ line, count, onChange }: { line: InboundDetailView["lines"][number]; count: LineCount; onChange: (patch: Partial<LineCount>) => void }) {
  const damaged = toNumber(count.damaged) > 0;
  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <div>
        <Stamp>{line.productCode}</Stamp>
        <p className="mt-1 text-[17px] font-medium">{line.productName}</p>
        <p className="text-small text-ink-soft">{line.declaredQuantity} units declared</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Good units">
          {({ id }) => <Input id={id} type="number" min={0} inputMode="numeric" value={count.accepted} onChange={(event) => onChange({ accepted: event.target.value })} />}
        </Field>
        <Field label="Damaged units">
          {({ id }) => <Input id={id} type="number" min={0} inputMode="numeric" value={count.damaged} onChange={(event) => onChange({ damaged: event.target.value })} />}
        </Field>
      </div>
      {damaged ? <PhotoCollector label="Photo of the damage" hint="Needed for every damaged line." max={10} onChange={(ids) => onChange({ damagePhotos: ids })} /> : null}
      <Field label="Note" hint="Optional.">
        {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={count.note} maxLength={500} onChange={(event) => onChange({ note: event.target.value })} />}
      </Field>
    </Paper>
  );
}
