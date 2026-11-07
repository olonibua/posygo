"use client";

import type { PartnerCheckKind, PartnerDetailView, PartnerProfileInput } from "@/shared";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Paper, Stamp, StepNumber } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { toast } from "@/lib/toast/toast-store";

import { ProfileDetails, ProfileForm } from "../profile-parts";
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
      <VerificationChecks partner={partner} locale={locale} editable={verifying} />
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

export function VerificationChecks({ partner, locale, editable }: { partner: PartnerDetailView; locale: string; editable: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {ORDER.map((kind) => {
        const check = partner.checks.find((candidate) => candidate.kind === kind);
        const Step = STEPS[kind];
        return check ? <Step key={kind} partner={partner} check={check} editable={editable} locale={locale} /> : null;
      })}
    </div>
  );
}

export function ProfileCard({ partner, editable }: { partner: PartnerDetailView; editable: boolean }) {
  const save = usePortalMutation((input: PartnerProfileInput) => ({ path: "/v1/partner/profile", method: "PUT", body: input }));
  const profile = partner.profile;
  if (!profile) {
    return null;
  }
  return (
    <Paper className="px-6 py-5">
      <Stamp>Your details</Stamp>
      {editable ? (
        <ProfileForm initial={profile} submitLabel="Save details" pending={save.isPending} error={save.error} onSubmit={(input) => save.mutate(input, { onSuccess: () => toast.success("Details saved") })} />
      ) : (
        <div className="mt-3">
          <ProfileDetails profile={profile} />
        </div>
      )}
    </Paper>
  );
}
