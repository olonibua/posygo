"use client";

import { CANCELLATION_REASONS, type CancellationReason } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form-controls";
import { NotebookNote } from "@/components/ui/surfaces";

import { CANCELLATION_REASON_LABELS } from "./order-display";

interface CancelFormProps {
  title: string;
  explanation: string;
  noteRequired: boolean;
  busy: boolean;
  onSubmit: (reason: CancellationReason, note: string | undefined) => void;
  onCancel: () => void;
}

export function CancelForm({ title, explanation, noteRequired, busy, onSubmit, onCancel }: CancelFormProps) {
  const [reason, setReason] = useState<CancellationReason>("CUSTOMER_CANCELLED");
  const [note, setNote] = useState("");
  const ready = !noteRequired || note.trim().length >= 10;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (ready) {
      onSubmit(reason, note.trim() || undefined);
    }
  }
  return (
    <NotebookNote tone="yellow" tilt="none" className="max-w-[720px]">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <p className="text-[20px] font-medium tracking-[-0.4px]">{title}</p>
          <p className="mt-1 text-small">{explanation}</p>
        </div>
        <Field label="Reason">
          {({ id }) => (
            <Select id={id} value={reason} onChange={(event) => setReason(event.target.value as CancellationReason)}>
              {CANCELLATION_REASONS.map((value) => (
                <option key={value} value={value}>
                  {CANCELLATION_REASON_LABELS[value]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={noteRequired ? "Note" : "Note (optional)"} hint={noteRequired ? "At least 10 characters, kept on the order." : undefined}>
          {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} className="min-h-[80px]" />}
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Back
          </Button>
          <Button type="submit" loading={busy} disabled={!ready}>
            Confirm
          </Button>
        </div>
      </form>
    </NotebookNote>
  );
}
