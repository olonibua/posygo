"use client";

import type { PartnerCheckKind, PartnerDetailView, PartnerProfileInput } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Paper, Stamp, StepNumber } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { toast } from "@/lib/toast/toast-store";

import { usePortalMutation } from "../use-partners";
import { AgreementCard } from "./agreement-card";
import { PayoutAccountCard } from "./payout-account-card";
import { IdentityStep, RefereeStep } from "./contact-steps";
import { ProofOfAddressStep, StorageSpaceStep, WorkStatusStep } from "./verification-steps";

const STEPS: Record<PartnerCheckKind, typeof IdentityStep> = {
  IDENTITY: IdentityStep,
  PROOF_OF_ADDRESS: ProofOfAddressStep,
  STORAGE_SPACE: StorageSpaceStep,
  WORK_STATUS: WorkStatusStep,
  REFERRAL: RefereeStep,
};

const TOTAL_STEPS = 7;

const ORDER: readonly PartnerCheckKind[] = ["IDENTITY", "PROOF_OF_ADDRESS", "STORAGE_SPACE", "WORK_STATUS", "REFERRAL"];

export function VerificationSection({ partner, locale }: { partner: PartnerDetailView; locale: string }) {
  const verifying = partner.status === "VERIFYING";
  const closed = partner.status === "TERMINATED" || partner.status === "REJECTED";
  const submit = usePortalMutation(() => ({ path: "/v1/partner/submit" }), "Sent for review. We'll email you");
  const remaining = partner.checks.filter((check) => check.status === "NOT_STARTED" || check.status === "REJECTED").length + (partner.readiness.agreement ? 0 : 1) + (partner.payoutAccount ? 0 : 1);

  return (
    <section aria-labelledby="verification-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="verification-heading" className="flex items-center gap-3 text-h3">
          <StepNumber value={1} />
          Verification
        </h2>
        {verifying ? (
          <Button variant="yellow" loading={submit.isPending} disabled={remaining > 0} onClick={() => submit.mutate(undefined)}>
            Send for review →
          </Button>
        ) : null}
      </div>
      <FormAlert message={formError(submit.error) ?? fieldError(submit.error, "checks") ?? fieldError(submit.error, "agreement") ?? fieldError(submit.error, "payoutAccount") ?? null} />
      {verifying ? (
        <div className="flex max-w-xl flex-col gap-2">
          <ProgressBar value={TOTAL_STEPS - remaining} max={TOTAL_STEPS} label="Verification progress" />
          <p className="text-small text-ink-soft">
            {remaining === 0
              ? "Everything's ready. Send it for review."
              : `${TOTAL_STEPS - remaining} of ${TOTAL_STEPS} done. ${remaining === 1 ? "One step" : `${remaining} steps`} left before you can send this for review.`}
          </p>
        </div>
      ) : null}
      <ProfileCard partner={partner} editable={verifying} />
      <div className="grid gap-4 lg:grid-cols-2">
        {ORDER.map((kind) => {
          const check = partner.checks.find((candidate) => candidate.kind === kind);
          const Step = STEPS[kind];
          return check ? <Step key={kind} partner={partner} check={check} editable={verifying} locale={locale} /> : null;
        })}
      </div>
      <h2 className="mt-3 flex items-center gap-3 text-h3">
        <StepNumber value={2} />
        Agreement and payouts
      </h2>
      <div className="grid gap-4 xl:grid-cols-2">
        <AgreementCard partner={partner} locale={locale} disabled={closed} />
        <PayoutAccountCard partner={partner} disabled={closed} />
      </div>
    </section>
  );
}

function ProfileCard({ partner, editable }: { partner: PartnerDetailView; editable: boolean }) {
  const [form, setForm] = useState<PartnerProfileInput | null>(partner.profile);
  const save = usePortalMutation((input: PartnerProfileInput) => ({ path: "/v1/partner/profile", method: "PUT", body: input }));
  const profile = partner.profile;
  if (!profile || !form) {
    return null;
  }
  const set = (patch: Partial<PartnerProfileInput>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
  };
  const error = (field: string) => fieldError(save.error, field);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (form) {
      save.mutate({ ...form, addressLines: form.addressLines.filter((line) => line.trim()) }, { onSuccess: () => toast.success("Details saved") });
    }
  }

  if (!editable) {
    return (
      <Paper className="px-6 py-5">
        <Stamp>Your details</Stamp>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-small sm:grid-cols-2">
          {[
            ["Name", profile.fullName],
            ["Phone", profile.phone],
            ["Storage address", [...profile.addressLines, profile.city, profile.postalCode].join(", ")],
            ["Space", profile.spaceDescription],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-ink-faint">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Paper>
    );
  }

  return (
    <Paper className="px-6 py-5">
      <Stamp>Your details</Stamp>
      <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormAlert message={formError(save.error)} />
        </div>
        <Field label="Full name" hint="As it appears on your ID." error={error("fullName")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid} value={form.fullName} onChange={(event) => set({ fullName: event.target.value })} />
          )}
        </Field>
        <Field label="Phone" error={error("phone")}>
          {({ id, invalid }) => <Input id={id} type="tel" autoComplete="tel" aria-invalid={invalid} value={form.phone} onChange={(event) => set({ phone: event.target.value })} />}
        </Field>
        <Field label="Storage address" error={error("addressLines") ?? error("addressLines.0")}>
          {({ id, invalid }) => (
            <Input
              id={id}
              autoComplete="address-line1"
              aria-invalid={invalid}
              value={form.addressLines[0] ?? ""}
              onChange={(event) => set({ addressLines: [event.target.value, ...form.addressLines.slice(1)] })}
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" error={error("city")}>
            {({ id, invalid }) => <Input id={id} autoComplete="address-level2" aria-invalid={invalid} value={form.city} onChange={(event) => set({ city: event.target.value })} />}
          </Field>
          <Field label="Postcode" error={error("postalCode")}>
            {({ id, invalid }) => <Input id={id} autoComplete="postal-code" aria-invalid={invalid} value={form.postalCode} onChange={(event) => set({ postalCode: event.target.value })} />}
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="About the space" error={error("spaceDescription")}>
            {({ id, invalid }) => (
              <Textarea id={id} aria-invalid={invalid} className="min-h-[80px]" value={form.spaceDescription} onChange={(event) => set({ spaceDescription: event.target.value })} />
            )}
          </Field>
        </div>
        <div className="flex justify-end md:col-span-2">
          <Button type="submit" variant="lime" loading={save.isPending}>
            Save details
          </Button>
        </div>
      </form>
    </Paper>
  );
}
