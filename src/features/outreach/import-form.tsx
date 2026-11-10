"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { formError } from "@/features/receiving/api-errors";
import { toast } from "@/lib/toast/toast-store";

import { useImportContacts } from "./outreach-api";
import { readContactsFile } from "./outreach-file";
import { type ParsedImport, parseContacts } from "./outreach-import";

const MAX_PER_IMPORT = 200;

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function Summary({ parsed, source }: { parsed: ParsedImport; source: string }) {
  const withEmail = parsed.contacts.filter((contact) => contact.email).length;
  if (parsed.contacts.length === 0) {
    return null;
  }
  return (
    <p className="text-small text-ink-soft">
      Found {plural(parsed.contacts.length, "contact")} in {source}, {withEmail} with an email address.
      {withEmail < parsed.contacts.length ? " You can add the missing emails later by opening each contact." : ""}
    </p>
  );
}

export function ImportForm({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const importContacts = useImportContacts();

  function paste(value: string) {
    setText(value);
    setFileName(null);
    setParsed(value.trim() ? parseContacts(value) : null);
  }

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setText("");
    setFileName(file.name);
    setParsed(await readContactsFile(file));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!parsed || parsed.contacts.length === 0) {
      return;
    }
    importContacts.mutate(
      { contacts: parsed.contacts.slice(0, MAX_PER_IMPORT) },
      {
        onSuccess: (result) => {
          toast.success(`${plural(result.added, "contact")} added`, result.duplicates.length ? `Already on the list: ${result.duplicates.join(", ")}` : undefined);
          onDone();
        },
      },
    );
  }

  const tooMany = (parsed?.contacts.length ?? 0) > MAX_PER_IMPORT;

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <FormAlert message={formError(importContacts.error) ?? (parsed?.problems.length ? parsed.problems.join(" ") : null)} />
      <div className="flex flex-col gap-2">
        <span className="text-small font-medium">Upload your spreadsheet</span>
        <label className="motion-press inline-flex w-fit cursor-pointer items-center rounded-chip border-[1.5px] border-line-strong bg-paper px-[15px] py-2.5 text-small font-medium hover:border-ink">
          {fileName ?? "Choose an Excel or CSV file"}
          <input type="file" accept=".xlsx,.csv,.tsv,.txt" className="sr-only" onChange={choose} />
        </label>
        <span className="text-meta text-ink-faint">Contacts already on the list are skipped, so you can upload the same spreadsheet again after adding rows.</span>
      </div>
      <Field
        label="Or paste your list"
        hint="Copy the rows from a spreadsheet, including the header row. It needs Business and Country columns. Email, City, Type, Website, Phone, Contact name, Notes and Source are picked up too."
      >
        {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={text} onChange={(event) => paste(event.target.value)} className="min-h-[140px] font-mono text-meta" />}
      </Field>
      {parsed ? <Summary parsed={parsed} source={fileName ?? "what you pasted"} /> : null}
      {tooMany ? <p className="text-small text-ink-soft">Only the first {MAX_PER_IMPORT} are added at a time. Import again to add the rest.</p> : null}
      <div className="flex gap-3">
        <Button type="submit" variant="yellow" loading={importContacts.isPending} disabled={!parsed || parsed.contacts.length === 0}>
          {parsed && parsed.contacts.length > 0 ? `Import ${plural(Math.min(parsed.contacts.length, MAX_PER_IMPORT), "contact")}` : "Import contacts"}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
