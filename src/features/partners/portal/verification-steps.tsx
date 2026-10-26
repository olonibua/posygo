"use client";

import { PROOF_DOCUMENTS, type ProofDocument } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FileDrop } from "@/components/ui/file-drop";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { PhotoCollector } from "@/features/receiving/photo-collector";
import { uploadPrivateFile } from "@/lib/api/uploads";
import { formatDate, formatDateTime } from "@/lib/format";

import { PROOF_DOCUMENT_LABELS } from "../partner-display";
import { usePortalMutation } from "../use-partners";
import { Replace, StepCard, type StepProps, useEditing } from "./step-card";

const DOCUMENTS = "image/jpeg,image/png,image/webp,image/heic,application/pdf";
const SPACE_MEDIA = "image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime";

export function ProofOfAddressStep({ partner, check, editable, locale }: StepProps) {
  const [editing, setEditing] = useEditing(check);
  const [form, setForm] = useState<{ documentType: ProofDocument; issuedOn: string; fileId: string }>({ documentType: "UTILITY_BILL", issuedOn: "", fileId: "" });
  const save = usePortalMutation((input: typeof form) => ({ path: "/v1/partner/verification/proof-of-address", method: "PUT", body: input }), "Proof of address sent");
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));
  const address = partner.profile ? [...partner.profile.addressLines, partner.profile.city, partner.profile.postalCode].join(", ") : "your storage address";
  const sent = check.details.documentType ? `${PROOF_DOCUMENT_LABELS[check.details.documentType as ProofDocument]} dated ${formatDate(String(check.details.issuedOn), locale)}` : null;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate(form, { onSuccess: () => setEditing(false) });
  }

  if (!editable || !editing || check.status === "ACCEPTED") {
    return (
      <StepCard check={check} locale={locale} extra={sent ? <p className="text-small">{sent}</p> : null}>
        {check.filesPurged ? <p className="text-meta text-ink-faint">The document has been deleted under our retention policy. The decision is kept.</p> : null}
        {editable && check.status === "SUBMITTED" ? <Replace onClick={() => setEditing(true)} /> : null}
      </StepCard>
    );
  }
  return (
    <StepCard check={check} locale={locale}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        <FormAlert message={formError(save.error)} />
        <p className="text-small text-ink-soft">It must show your name and {address}. Only our verification team can open it, and we delete it after our decision.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type of document">
            {({ id }) => (
              <Select id={id} value={form.documentType} onChange={(event) => set({ documentType: event.target.value as ProofDocument })}>
                {PROOF_DOCUMENTS.map((kind) => (
                  <option key={kind} value={kind}>
                    {PROOF_DOCUMENT_LABELS[kind]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Date on the document" error={fieldError(save.error, "issuedOn")}>
            {({ id, invalid }) => <Input id={id} type="date" aria-invalid={invalid} value={form.issuedOn} onChange={(event) => set({ issuedOn: event.target.value })} />}
          </Field>
        </div>
        <FileDrop
          label="Document"
          hint="PDF or photo, up to 10 MB."
          accept={DOCUMENTS}
          error={fieldError(save.error, "fileId")}
          onFile={async (file) => set({ fileId: await uploadPrivateFile(file, "PROOF_OF_ADDRESS") })}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="lime" loading={save.isPending} disabled={!form.fileId || !form.issuedOn}>
            Send document
          </Button>
        </div>
      </form>
    </StepCard>
  );
}

export function StorageSpaceStep({ check, editable, locale }: StepProps) {
  const [editing, setEditing] = useEditing(check);
  const [description, setDescription] = useState(check.statement ?? "");
  const [fileIds, setFileIds] = useState<string[]>([]);
  const save = usePortalMutation((input: { description: string; fileIds: string[] }) => ({ path: "/v1/partner/verification/storage-space", method: "PUT", body: input }), "Photos of your space sent");
  const call = check.callScheduledAt ? (
    <p className="rounded-card bg-sky px-3.5 py-2.5 text-small">Video call booked for {formatDateTime(check.callScheduledAt, locale)}. We&apos;ll email you the link.</p>
  ) : null;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate({ description, fileIds }, { onSuccess: () => setEditing(false) });
  }

  if (!editable || !editing || check.status === "ACCEPTED") {
    return (
      <StepCard check={check} locale={locale} extra={call}>
        {check.fileIds.length > 0 ? <p className="text-small text-ink-soft">{check.fileIds.length} photos or videos sent</p> : null}
        {editable && check.status === "SUBMITTED" ? <Replace onClick={() => setEditing(true)} /> : null}
      </StepCard>
    );
  }
  return (
    <StepCard check={check} locale={locale} extra={call}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        <FormAlert message={formError(save.error)} />
        <Field label="Describe the space" hint="Where it is, how big, how it locks, and how you keep it dry." error={fieldError(save.error, "description")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[96px]" value={description} onChange={(event) => setDescription(event.target.value)} />
          )}
        </Field>
        <PhotoCollector
          label="Photo or video"
          hint="At least two. Photos up to 15 MB, videos up to 100 MB."
          max={12}
          purpose="PARTNER_EVIDENCE"
          accept={SPACE_MEDIA}
          error={fieldError(save.error, "fileIds")}
          onChange={setFileIds}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="lime" loading={save.isPending} disabled={fileIds.length < 2}>
            Send
          </Button>
        </div>
      </form>
    </StepCard>
  );
}

export function WorkStatusStep({ partner, check, editable, locale }: StepProps) {
  const [editing, setEditing] = useEditing(check);
  const [declared, setDeclared] = useState(false);
  const [taxId, setTaxId] = useState("");
  const save = usePortalMutation((input: { declaration: true; taxId?: string }) => ({ path: "/v1/partner/verification/work-status", method: "PUT", body: input }), "Work and tax status confirmed");
  const rule = partner.workStatus;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate({ declaration: true, taxId: taxId.trim() || undefined }, { onSuccess: () => setEditing(false) });
  }

  if (!editable || !editing) {
    return (
      <StepCard
        check={check}
        locale={locale}
        extra={
          check.details.declaredAt ? (
            <p className="text-small">
              Declared {formatDate(String(check.details.declaredAt), locale)}
              {check.details.taxIdProvided ? ` · ${rule.taxIdLabel} given` : ""}
            </p>
          ) : null
        }
      >
        {editable ? <Replace onClick={() => setEditing(true)} /> : null}
      </StepCard>
    );
  }
  return (
    <StepCard check={check} locale={locale}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        <FormAlert message={formError(save.error)} />
        <Checkbox label={rule.declaration} checked={declared} onChange={(event) => setDeclared(event.target.checked)} error={fieldError(save.error, "declaration")} />
        <Field label={rule.taxIdRequired ? rule.taxIdLabel : `${rule.taxIdLabel} (optional)`} hint="Stored encrypted. Only used for tax reporting." error={fieldError(save.error, "taxId")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} autoComplete="off" spellCheck={false} aria-describedby={describedBy} aria-invalid={invalid} value={taxId} onChange={(event) => setTaxId(event.target.value)} />
          )}
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="lime" loading={save.isPending} disabled={!declared || (rule.taxIdRequired && !taxId.trim())}>
            Confirm
          </Button>
        </div>
      </form>
    </StepCard>
  );
}
