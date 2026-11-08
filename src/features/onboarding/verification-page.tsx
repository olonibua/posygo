"use client";

import { EDITABLE_VERIFICATION_STATUSES, hasPermission, type VerificationView } from "@/shared";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { StatusPill } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Paper, Stamp, Sticker } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { HowItWorksVideo } from "@/features/guide/how-it-works-video";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate } from "@/lib/format";

import { ActivationPanel } from "./activation/activation-panel";
import { AgreementsPanel } from "./agreements-panel";
import { countryName, VERIFICATION_STATUS_DISPLAY } from "./display";
import { useVendorIdentity } from "./use-vendor-identity";
import { useVerification } from "./use-verification";
import { IDENTITY_STEP, VerificationWizard } from "./verification-wizard";

const LIVE_COPY = { title: "You're verified and live", body: "Your business details, signed agreements and activation fee are on your Account page." };

const OUTCOME_COPY: Partial<Record<VerificationView["status"], { title: string; body: string }>> = {
  SUBMITTED: { title: "We're reviewing your business", body: "Most reviews finish within one working day. We'll email you as soon as there's a decision." },
  APPROVED: { title: "Your business is verified", body: "Accept the vendor agreement below to finish setting up your account." },
  REJECTED: { title: "We couldn't verify your business", body: "Reply to the email we sent if you think this is a mistake." },
};

function useReturnFromIdentityCheck(): boolean {
  const params = useSearchParams();
  const returned = params.get("identity") === "returned";
  const { refresh } = useVendorIdentity();
  const handled = useRef(false);
  useEffect(() => {
    if (!handled.current && returned) {
      handled.current = true;
      refresh.mutate();
    }
  }, [returned, refresh]);
  return returned;
}

export function VerificationPage() {
  const user = useCurrentUser();
  const returnedFromIdentity = useReturnFromIdentityCheck();
  const state = useVerification();
  const view = state.view.data;
  const canEdit = hasPermission(user.role, "vendor.verification.manage");
  const outcome = view?.status === "APPROVED" && user.vendorStatus === "ACTIVE" ? LIVE_COPY : view ? OUTCOME_COPY[view.status] : undefined;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Verification"
        title="Verify your business"
        lead={view ? `We check every business against ${countryName(view.market.countryCode)} rules before stock can be sent to a warehouse.` : undefined}
        action={view ? <StatusPill tone={VERIFICATION_STATUS_DISPLAY[view.status].tone}>{VERIFICATION_STATUS_DISPLAY[view.status].label}</StatusPill> : null}
      />
      {user.vendorStatus === "ACTIVE" ? null : (
        <HowItWorksVideo
          title="Watch this first"
          body="See how you'll use Posygo once you're verified: adding products, sending stock to a hub, and creating and tracking orders. You can rewatch it any time from your dashboard."
        />
      )}
      {state.view.isLoading ? <PageSkeleton /> : null}
      {view && EDITABLE_VERIFICATION_STATUSES.includes(view.status) && canEdit ? <VerificationWizard view={view} state={state} initialStep={returnedFromIdentity ? IDENTITY_STEP : 0} /> : null}
      {view && EDITABLE_VERIFICATION_STATUSES.includes(view.status) && !canEdit ? (
        <NotebookNote tone="yellow" tilt="none" className="max-w-[560px]">
          Only the account owner can complete verification.
        </NotebookNote>
      ) : null}
      {view && outcome ? (
        <Paper className="relative max-w-[720px] px-6 py-6">
          <Sticker src="/brand/sticker-flower-blue.svg" className="-right-3.5 -top-5 w-[58px] rotate-12" />
          <Stamp>{view.submittedAt ? `Submitted ${formatDate(view.submittedAt, "en-GB")}` : "Status"}</Stamp>
          <h2 className="mb-1 mt-1.5 text-[22px] font-medium tracking-[-0.5px]">{outcome.title}</h2>
          <p className="text-small text-ink-soft">{view.status === "REJECTED" && view.decisionReason ? view.decisionReason : outcome.body}</p>
        </Paper>
      ) : null}
      <AgreementsPanel />
      <ActivationPanel />
    </div>
  );
}
