"use client";

import { type InsurancePolicyView, type PartnerCheckView, type PartnerDetailView, type ProofDocument, REVIEWED_CHECKS, type ReviewCheckInput } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Checkbox, Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";

import { CHECK_DISPLAY, CHECK_STATUS_DISPLAY, INSURANCE_STATUS_DISPLAY, PROOF_DOCUMENT_LABELS } from "../partner-display";
import { useAdminPartnerMutation } from "../use-partners";

function useEvidence(partnerId: string) {
  return useMutation({
    mutationFn: (fileId: string) => apiRequest<{ url: string }>(`/v1/admin/partners/${partnerId}/files/${fileId}`),
    onSuccess: (result) => window.open(result.url, "_blank", "noopener,noreferrer"),
  });
}

export function ChecksReview({ partner, canReview, locale }: { partner: PartnerDetailView; canReview: boolean; locale: string }) {
  const evidence = useEvidence(partner.id);
  const reviewing = canReview && (partner.status === "VERIFYING" || partner.status === "UNDER_REVIEW");
  return (
    <section aria-labelledby="checks-heading" className="flex flex-col gap-3">
      <h2 id="checks-heading" className="text-h3">
        Verification
      </h2>
      <p className="text-small text-ink-soft">Opening a file is recorded. Proof of address is deleted once the retention period after the decision has passed.</p>
      <FormAlert message={errorMessage(evidence.error)} />
      <div className="grid gap-4 lg:grid-cols-2">
        {partner.checks.map((check) => (
          <CheckReviewCard key={check.kind} partner={partner} check={check} reviewing={reviewing} locale={locale} onOpen={(fileId) => evidence.mutate(fileId)} />
        ))}
      </div>
    </section>
  );
}

const IDENTITY_PROVIDER_NAMES: Record<string, string> = { DIDIT: "Didit", STRIPE_IDENTITY: "Stripe Identity", PRACTICE: "the practice provider" };

function detailLines(partner: PartnerDetailView, check: PartnerCheckView, locale: string): string[] {
  const details = check.details;
  switch (check.kind) {
    case "REFERRAL":
      return details.name ? [`${String(details.name)} · ${String(details.relationship ?? "")}`, String(details.contact ?? "")] : [];
    case "IDENTITY":
      return [
        details.provider ? `Checked by ${IDENTITY_PROVIDER_NAMES[String(details.provider)] ?? String(details.provider)}` : "",
        details.inReview ? "Being checked by the provider's team" : "",
        details.failureReason ? `Didn't pass: ${String(details.failureReason)}` : "",
      ].filter(Boolean);
    case "PROOF_OF_ADDRESS":
      return details.documentType
        ? [
            `${PROOF_DOCUMENT_LABELS[details.documentType as ProofDocument]} dated ${formatDate(String(details.issuedOn), locale)}`,
            `Storage address: ${partner.profile ? [...partner.profile.addressLines, partner.profile.city, partner.profile.postalCode].join(", ") : "—"}`,
          ]
        : [];
    case "STORAGE_SPACE":
      return check.statement ? [check.statement] : [];
    case "WORK_STATUS":
      return details.declaredAt
        ? [`Declared ${formatDate(String(details.declaredAt), locale)}`, details.taxIdProvided ? `${partner.workStatus.taxIdLabel} given` : `No ${partner.workStatus.taxIdLabel}`]
        : [];
  }
}

function CheckReviewCard({ partner, check, reviewing, locale, onOpen }: { partner: PartnerDetailView; check: PartnerCheckView; reviewing: boolean; locale: string; onOpen: (fileId: string) => void }) {
  const [note, setNote] = useState("");
  const [addressMatches, setAddressMatches] = useState(false);
  const review = useAdminPartnerMutation(
    (input: ReviewCheckInput) => ({ path: `/v1/admin/partners/${partner.id}/checks/${check.kind}/review`, body: input }),
    (input) => (input.accept ? "Step accepted" : "Sent back to the partner"),
  );
  const status = CHECK_STATUS_DISPLAY[check.status];
  const proof = check.kind === "PROOF_OF_ADDRESS";
  const decide = (accept: boolean) => review.mutate({ accept, note, ...(proof ? { addressMatches } : {}) }, { onSuccess: () => setNote("") });

  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body font-semibold">{CHECK_DISPLAY[check.kind].label}</p>
          {check.submittedAt ? <p className="text-meta text-ink-faint">Sent {formatDateTime(check.submittedAt, locale)}</p> : null}
        </div>
        <span className="shrink-0">
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
        </span>
      </div>
      {detailLines(partner, check, locale).map((line) => (
        <p key={line} className="whitespace-pre-wrap text-small">
          {line}
        </p>
      ))}
      {check.status === "NOT_STARTED" ? <p className="text-small text-ink-faint">Nothing sent yet.</p> : null}
      {check.filesPurged ? <p className="text-meta text-ink-faint">Files deleted under the retention policy.</p> : null}
      {check.fileIds.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {check.fileIds.map((fileId, index) => (
            <Button key={fileId} variant="ghost" onClick={() => onOpen(fileId)}>
              File {index + 1}
            </Button>
          ))}
        </div>
      ) : null}
      {check.reviewNote ? <p className="rounded-card bg-cream px-3.5 py-2.5 text-small">Note: {check.reviewNote}</p> : null}
      {check.kind === "STORAGE_SPACE" ? <StorageCall partnerId={partner.id} check={check} reviewing={reviewing} locale={locale} /> : null}
      {reviewing && check.status === "SUBMITTED" && REVIEWED_CHECKS.includes(check.kind) ? (
        <div className="flex flex-col gap-3 border-t border-line pt-3">
          <FormAlert message={formError(review.error)} />
          {proof ? (
            <Checkbox
              label="The name and address on the document match the application."
              checked={addressMatches}
              onChange={(event) => setAddressMatches(event.target.checked)}
              error={fieldError(review.error, "addressMatches")}
            />
          ) : null}
          <Field label="Note" hint="The partner sees this word for word." error={fieldError(review.error, "note")}>
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[80px]" value={note} onChange={(event) => setNote(event.target.value)} />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" disabled={review.isPending} onClick={() => decide(false)}>
              Ask again
            </Button>
            <Button variant="lime" loading={review.isPending} disabled={proof && !addressMatches} onClick={() => decide(true)}>
              Accept
            </Button>
          </div>
        </div>
      ) : null}
    </Paper>
  );
}

function StorageCall({ partnerId, check, reviewing, locale }: { partnerId: string; check: PartnerCheckView; reviewing: boolean; locale: string }) {
  const [when, setWhen] = useState("");
  const [outcome, setOutcome] = useState("");
  const schedule = useAdminPartnerMutation((scheduledAt: string) => ({ path: `/v1/admin/partners/${partnerId}/storage-call`, body: { scheduledAt } }), "Call booked and emailed");
  const record = useAdminPartnerMutation((text: string) => ({ path: `/v1/admin/partners/${partnerId}/storage-call/outcome`, body: { outcome: text } }), "Call outcome recorded");
  return (
    <div className="flex flex-col gap-2 rounded-card bg-cream px-4 py-3 text-small">
      <p className="font-medium">Video call (optional)</p>
      {check.callScheduledAt ? <p>Booked for {formatDateTime(check.callScheduledAt, locale)}</p> : null}
      {check.callOutcome ? <p className="whitespace-pre-wrap">Outcome: {check.callOutcome}</p> : null}
      <FormAlert message={formError(schedule.error) ?? formError(record.error)} />
      {reviewing && !check.callOutcome ? (
        check.callScheduledAt ? (
          <div className="flex flex-col gap-2">
            <Field label="What you saw on the call" error={fieldError(record.error, "outcome")}>
              {({ id, invalid }) => <Textarea id={id} aria-invalid={invalid} className="min-h-[64px]" value={outcome} onChange={(event) => setOutcome(event.target.value)} />}
            </Field>
            <div className="flex justify-end">
              <Button variant="lime" loading={record.isPending} onClick={() => record.mutate(outcome)}>
                Record outcome
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Book a call" error={fieldError(schedule.error, "scheduledAt")}>
                {({ id, invalid }) => <Input id={id} type="datetime-local" aria-invalid={invalid} value={when} onChange={(event) => setWhen(event.target.value)} />}
              </Field>
            </div>
            <Button variant="ghost" loading={schedule.isPending} disabled={!when} onClick={() => schedule.mutate(new Date(when).toISOString())}>
              Book and email
            </Button>
          </div>
        )
      ) : null}
    </div>
  );
}

export function InsuranceReview({ partner, canReview, locale }: { partner: PartnerDetailView; canReview: boolean; locale: string }) {
  const evidence = useEvidence(partner.id);
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <Stamp>Partner&apos;s own insurance · {formatMoney(partner.requiredInsuranceMinor, partner.currency, locale)} cover asked for</Stamp>
      <FormAlert message={errorMessage(evidence.error)} />
      {partner.insurance.length === 0 ? <p className="text-small text-ink-soft">No policies uploaded yet.</p> : null}
      <ul className="flex flex-col divide-y divide-line">
        {partner.insurance.map((policy) => (
          <PolicyRow key={policy.id} partnerId={partner.id} policy={policy} canReview={canReview} locale={locale} onOpen={() => evidence.mutate(policy.fileId)} />
        ))}
      </ul>
    </Paper>
  );
}

function PolicyRow({ partnerId, policy, canReview, locale, onOpen }: { partnerId: string; policy: InsurancePolicyView; canReview: boolean; locale: string; onOpen: () => void }) {
  const [note, setNote] = useState("");
  const review = useAdminPartnerMutation(
    (input: ReviewCheckInput) => ({ path: `/v1/admin/partners/${partnerId}/insurance/${policy.id}/review`, body: input }),
    (input) => (input.accept ? "Policy verified" : "Policy rejected"),
  );
  const display = INSURANCE_STATUS_DISPLAY[policy.status];
  return (
    <li className="flex flex-col gap-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-small">
        <span>
          <b className="font-medium">{policy.insurer}</b> · {policy.policyNumber} · {formatMoney(policy.coverMinor, policy.currency, locale)} · {formatDate(policy.startsOn, locale)} to{" "}
          {formatDate(policy.expiresOn, locale)}
          {policy.reviewNote ? <span className="block text-ink-faint">{policy.reviewNote}</span> : null}
        </span>
        <span className="flex items-center gap-2">
          <Button variant="ghost" onClick={onOpen}>
            Certificate
          </Button>
          <StatusPill tone={display.tone}>{display.label}</StatusPill>
        </span>
      </div>
      {canReview && policy.status === "PENDING" ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Field label="Review note" error={fieldError(review.error, "note")}>
              {({ id, invalid }) => <Textarea id={id} aria-invalid={invalid} className="min-h-[64px]" value={note} onChange={(event) => setNote(event.target.value)} />}
            </Field>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={review.isPending} onClick={() => review.mutate({ accept: false, note })}>
              Reject
            </Button>
            <Button variant="lime" loading={review.isPending} onClick={() => review.mutate({ accept: true, note })}>
              Verify
            </Button>
          </div>
        </div>
      ) : null}
      <FormAlert message={formError(review.error)} />
    </li>
  );
}
