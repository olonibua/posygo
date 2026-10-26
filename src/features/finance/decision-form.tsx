"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { errorMessage } from "@/features/receiving/api-errors";

export function DecisionForm({ minNote, busy, error, onDecide }: { minNote: number; busy: boolean; error: unknown; onDecide: (approve: boolean, note: string) => void }) {
  const [note, setNote] = useState("");
  const [choice, setChoice] = useState<boolean | null>(null);
  const ready = note.trim().length >= minNote;
  function submit(event: FormEvent, approve: boolean) {
    event.preventDefault();
    setChoice(approve);
    if (ready) {
      onDecide(approve, note.trim());
    }
  }
  return (
    <form noValidate onSubmit={(event) => submit(event, true)} className="flex flex-col gap-3">
      <FormAlert message={errorMessage(error)} />
      <Field label="Note for the record" hint={`At least ${minNote} characters. You can't decide on a change you asked for.`}>
        {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={note} maxLength={300} onChange={(event) => setNote(event.target.value)} className="min-h-[72px]" />}
      </Field>
      <div className="flex justify-end gap-2.5">
        <Button variant="ghost" loading={busy && choice === false} disabled={!ready || busy} onClick={(event) => submit(event, false)}>
          Reject
        </Button>
        <Button type="submit" variant="lime" loading={busy && choice === true} disabled={!ready || busy}>
          Approve
        </Button>
      </div>
    </form>
  );
}
