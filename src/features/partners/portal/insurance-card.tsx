"use client";

import type { InsurancePolicyInput, PartnerDetailView } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { FileDrop } from "@/components/ui/file-drop";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { MoneyField } from "@/features/finance/money-field";
import { toMinor } from "@/features/finance/money-input";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { uploadPrivateFile } from "@/lib/api/uploads";
import { formatDate, formatMoney } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { INSURANCE_STATUS_DISPLAY } from "../partner-display";
import { usePortalMutation } from "../use-partners";

export function InsuranceCard({ partner, disabled, locale }: { partner: PartnerDetailView; disabled: boolean; locale: string }) {
  const [form, setForm] = useState({ insurer: "", policyNumber: "", cover: "", startsOn: "", expiresOn: "", fileId: "" });
  const add = usePortalMutation((input: InsurancePolicyInput) => ({ path: "/v1/partner/insurance", body: input }));
  const set = (patch: Partial<typeof form>) => {
    setForm((current) => ({ ...current, ...patch }));
  };
  const coverMinor = toMinor(form.cover, partner.currency);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    add.mutate(
      { insurer: form.insurer, policyNumber: form.policyNumber, coverMinor: coverMinor ?? 0, startsOn: form.startsOn, expiresOn: form.expiresOn, fileId: form.fileId },
      {
        onSuccess: () => {
          setForm({ insurer: "", policyNumber: "", cover: "", startsOn: "", expiresOn: "", fileId: "" });
          toast.success("Policy sent for review");
        },
      },
    );
  }

  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <Stamp>Your own insurance · {formatMoney(partner.requiredInsuranceMinor, partner.currency, locale)} cover needed</Stamp>
      {partner.insurance.length > 0 ? (
        <ul className="flex flex-col divide-y divide-line">
          {partner.insurance.map((policy) => (
            <li key={policy.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-small">
              <span>
                <b className="font-medium">{policy.insurer}</b> · {policy.policyNumber} · {formatMoney(policy.coverMinor, policy.currency, locale)} cover · until {formatDate(policy.expiresOn, locale)}
                {policy.reviewNote ? <span className="block text-ink-faint">{policy.reviewNote}</span> : null}
              </span>
              <StatusPill tone={INSURANCE_STATUS_DISPLAY[policy.status].tone}>{INSURANCE_STATUS_DISPLAY[policy.status].label}</StatusPill>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-small text-ink-soft">No policies yet. Upload your current certificate; we&apos;ll remind you 30 and 7 days before it ends.</p>
      )}
      {disabled ? null : (
        <form noValidate onSubmit={onSubmit} className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <FormAlert message={formError(add.error)} />
          </div>
          <Field label="Insurer" error={fieldError(add.error, "insurer")}>
            {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.insurer} onChange={(event) => set({ insurer: event.target.value })} />}
          </Field>
          <Field label="Policy number" error={fieldError(add.error, "policyNumber")}>
            {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.policyNumber} onChange={(event) => set({ policyNumber: event.target.value })} />}
          </Field>
          <MoneyField label="Cover" currency={partner.currency} value={form.cover} onChange={(cover) => set({ cover })} error={fieldError(add.error, "coverMinor")} />
          <Field label="Starts" error={fieldError(add.error, "startsOn")}>
            {({ id, invalid }) => <Input id={id} type="date" aria-invalid={invalid} value={form.startsOn} onChange={(event) => set({ startsOn: event.target.value })} />}
          </Field>
          <Field label="Ends" error={fieldError(add.error, "expiresOn")}>
            {({ id, invalid }) => <Input id={id} type="date" aria-invalid={invalid} value={form.expiresOn} onChange={(event) => set({ expiresOn: event.target.value })} />}
          </Field>
          <div className="md:col-span-3">
            <FileDrop
              label="Policy certificate"
              hint="PDF or photo, up to 15 MB."
              accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
              error={fieldError(add.error, "fileId")}
              onFile={async (file) => set({ fileId: await uploadPrivateFile(file, "PARTNER_EVIDENCE") })}
            />
          </div>
          <div className="flex justify-end md:col-span-3">
            <Button type="submit" variant="lime" loading={add.isPending} disabled={!form.fileId || coverMinor === null}>
              Send for review
            </Button>
          </div>
        </form>
      )}
    </Paper>
  );
}
