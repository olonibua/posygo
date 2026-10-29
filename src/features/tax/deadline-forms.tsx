"use client";

import type { FileTaxDeadlineInput, ScheduleTaxDeadlineInput, TaxObligationView } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { toast } from "@/lib/toast/toast-store";

import { useTaxChange } from "./tax-api";
import { todayIso } from "./tax-display";

interface FormProps {
  obligation: TaxObligationView;
  onClose: () => void;
}

function Actions({ pending, label, onCancel }: { pending: boolean; label: string; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-3 md:col-span-3">
      <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
        Cancel
      </Button>
      <Button type="submit" variant="yellow" loading={pending}>
        {label}
      </Button>
    </div>
  );
}

export function FileDeadlineForm({ obligation, onClose }: FormProps) {
  const next = obligation.next!;
  const [filedOn, setFiledOn] = useState(todayIso());
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const file = useTaxChange<FileTaxDeadlineInput>(() => ({ path: `/v1/admin/tax/deadlines/${next.id}/file`, method: "POST" }), () => {
    toast.success("Marked as filed", obligation.cadence === "ONCE" ? obligation.title : "The next deadline has been added.");
    onClose();
  });
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    file.mutate({ filedOn, reference: reference.trim() || undefined, note: note.trim() || undefined });
  }
  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-4 border-t border-line pt-4 md:grid-cols-3 md:items-start">
      <div className="md:col-span-3">
        <FormAlert message={formError(file.error)} />
      </div>
      <Field label="Filed on" error={fieldError(file.error, "filedOn")}>
        {(control) => <Input type="date" id={control.id} aria-describedby={control.describedBy} aria-invalid={control.invalid} value={filedOn} onChange={(event) => setFiledOn(event.target.value)} />}
      </Field>
      <Field label="Reference" hint="Optional" error={fieldError(file.error, "reference")}>
        {(control) => <Input id={control.id} aria-describedby={control.describedBy} aria-invalid={control.invalid} value={reference} onChange={(event) => setReference(event.target.value)} />}
      </Field>
      <Field label="Note" hint="Optional" error={fieldError(file.error, "note")}>
        {(control) => <Input id={control.id} aria-describedby={control.describedBy} aria-invalid={control.invalid} value={note} onChange={(event) => setNote(event.target.value)} />}
      </Field>
      <Actions pending={file.isPending} label="Mark as filed" onCancel={onClose} />
    </form>
  );
}

export function DueDateForm({ obligation, onClose }: FormProps) {
  const [dueOn, setDueOn] = useState(obligation.next?.dueOn ?? "");
  const save = useTaxChange<ScheduleTaxDeadlineInput>(
    () => (obligation.next ? { path: `/v1/admin/tax/deadlines/${obligation.next.id}`, method: "PATCH" } : { path: `/v1/admin/tax/obligations/${obligation.id}/deadlines`, method: "POST" }),
    onClose,
  );
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate({ dueOn });
  }
  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-4 border-t border-line pt-4 md:grid-cols-3 md:items-start">
      <div className="md:col-span-3">
        <FormAlert message={formError(save.error)} />
      </div>
      <Field label="Due date" hint={obligation.dueRule} error={fieldError(save.error, "dueOn")}>
        {(control) => <Input type="date" id={control.id} aria-describedby={control.describedBy} aria-invalid={control.invalid} value={dueOn} onChange={(event) => setDueOn(event.target.value)} />}
      </Field>
      <Actions pending={save.isPending} label="Save date" onCancel={onClose} />
    </form>
  );
}
