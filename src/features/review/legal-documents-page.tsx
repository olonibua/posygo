"use client";

import { type CreateLegalDocumentInput, LEGAL_DOCUMENT_KINDS, type LegalDocumentView, type PublicCountry } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { ApiError, apiRequest } from "@/lib/api/client";
import { formatDate } from "@/lib/format";

import { LEGAL_KIND_LABELS } from "./legal-labels";

const EMPTY: CreateLegalDocumentInput = { countryCode: "", kind: "VENDOR_AGREEMENT", version: "", title: "", body: "" };

export function LegalDocumentsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateLegalDocumentInput>(EMPTY);
  const documents = useQuery({ queryKey: ["admin", "legal"], queryFn: () => apiRequest<LegalDocumentView[]>("/v1/admin/legal-documents") });
  const countries = useQuery({ queryKey: ["admin", "countries"], queryFn: () => apiRequest<PublicCountry[]>("/v1/admin/countries") });
  const publish = useMutation({
    mutationFn: (input: CreateLegalDocumentInput) => apiRequest<LegalDocumentView>("/v1/admin/legal-documents", { method: "POST", body: input }),
    onSuccess: () => {
      setForm(EMPTY);
      void queryClient.invalidateQueries({ queryKey: ["admin", "legal"] });
    },
  });
  const set = (patch: Partial<CreateLegalDocumentInput>) => setForm((current) => ({ ...current, ...patch }));
  const fieldError = (name: string) => (publish.error instanceof ApiError ? publish.error.fieldErrors[name]?.[0] : undefined);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    publish.mutate(form);
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Legal"
        title="Agreements and policies"
        lead="Published versions can't be edited or deleted. Publishing a new vendor agreement asks every vendor in that market to accept it again."
      />
      <Paper className="px-6 py-5">
        <Stamp>Publish a new version</Stamp>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
          <FormAlert message={publish.error instanceof ApiError && !Object.keys(publish.error.fieldErrors).length ? publish.error.message : null} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Market" error={fieldError("countryCode")}>
              {({ id }) => (
                <Select id={id} value={form.countryCode} onChange={(event) => set({ countryCode: event.target.value })}>
                  <option value="">Choose a market</option>
                  {countries.data?.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Document" error={fieldError("kind")}>
              {({ id }) => (
                <Select id={id} value={form.kind} onChange={(event) => set({ kind: event.target.value as CreateLegalDocumentInput["kind"] })}>
                  {LEGAL_DOCUMENT_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {LEGAL_KIND_LABELS[kind]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Version" hint="e.g. 2026-11" error={fieldError("version")}>
              {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={form.version} onChange={(event) => set({ version: event.target.value })} />}
            </Field>
          </div>
          <Field label="Title" error={fieldError("title")}>
            {({ id }) => <Input id={id} value={form.title} onChange={(event) => set({ title: event.target.value })} />}
          </Field>
          <Field label="Full text" hint="Paste the version approved by counsel." error={fieldError("body")}>
            {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} className="min-h-[220px]" value={form.body} onChange={(event) => set({ body: event.target.value })} />}
          </Field>
          <Button type="submit" variant="yellow" size="lg" className="self-end" loading={publish.isPending}>
            Publish →
          </Button>
        </form>
      </Paper>
      <DataTable caption="Published documents" columns={COLUMNS} rows={documents.data ?? []} rowKey={(row) => row.id} loading={documents.isLoading} empty={"Nothing published yet."} />
    </div>
  );
}

const COLUMNS: readonly Column<LegalDocumentView>[] = [
  { key: "market", header: "Market", render: (row) => <span className="font-mono text-[15px] font-medium">{row.countryCode}</span> },
  { key: "kind", header: "Document", render: (row) => LEGAL_KIND_LABELS[row.kind] },
  { key: "version", header: "Version", render: (row) => <StatusPill tone="sky">{row.version}</StatusPill> },
  { key: "title", header: "Title", render: (row) => row.title },
  { key: "published", header: "Published", align: "right", render: (row) => <span className="text-ink-soft">{formatDate(row.publishedAt, "en-GB")}</span> },
];
