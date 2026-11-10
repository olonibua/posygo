"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { formError } from "@/features/receiving/api-errors";
import { toast } from "@/lib/toast/toast-store";

import { useImportContacts } from "./outreach-api";
import { parseContacts } from "./outreach-import";

export function ImportForm({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const importContacts = useImportContacts();

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseContacts(text);
    setProblems(parsed.problems);
    if (parsed.contacts.length === 0) {
      return;
    }
    importContacts.mutate(
      { contacts: parsed.contacts },
      {
        onSuccess: (result) => {
          toast.success(`${result.added} ${result.added === 1 ? "contact" : "contacts"} added`, result.duplicates.length ? `Already on the list: ${result.duplicates.join(", ")}` : undefined);
          onDone();
        },
      },
    );
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <FormAlert message={formError(importContacts.error) ?? (problems.length ? problems.join(" ") : null)} />
      <Field
        label="Paste your list"
        hint="Copy the rows straight from a spreadsheet, including the header row, or paste a CSV. It needs Business and Country columns. Email, City, Type, Website, Phone, Contact name, Notes and Source are picked up too."
      >
        {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={text} onChange={(event) => setText(event.target.value)} className="min-h-[180px] font-mono text-meta" />}
      </Field>
      <div className="flex gap-3">
        <Button type="submit" variant="yellow" loading={importContacts.isPending} disabled={text.trim() === ""}>
          Import contacts
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
