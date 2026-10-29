"use client";

import { hasPermission, type RequiredAgreementView, type VerificationStatus, type VerificationView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import { FeaturePanel } from "@/components/ui/surfaces";
import { ActivationPayButton } from "@/features/onboarding/activation/activation-pay-button";
import { useActivation } from "@/features/onboarding/activation/use-activation";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

interface StepCopy {
  title: string;
  body: string;
  action: string | null;
  payment?: ReactNode;
}

const COPY: Record<VerificationStatus, StepCopy> = {
  NOT_STARTED: {
    title: "Verify your business",
    body: "Before stock can be routed to a hub we check your identity and company against your market's rules. Documents are stored privately and only verification staff can open them.",
    action: "Start verification",
  },
  IN_PROGRESS: { title: "Finish verifying your business", body: "Your answers are saved. Pick up where you left off.", action: "Continue verification" },
  RESUBMISSION_REQUIRED: { title: "Your verification needs changes", body: "Our reviewer left a note explaining what to update.", action: "See what's needed" },
  SUBMITTED: { title: "We're reviewing your business", body: "Most reviews finish within one working day. We'll email you the result.", action: "View status" },
  APPROVED: { title: "Sign your agreements", body: "You're verified. Sign the vendor agreement and accept the terms to finish setting up your account.", action: "Review agreements" },
  REJECTED: { title: "We couldn't verify your business", body: "Check the email we sent for the reason.", action: "View details" },
};

const UPDATED_AGREEMENT = {
  title: "Accept the updated agreement",
  body: "We've published a new version of an agreement for your market. Review and accept it to keep your account in good standing.",
  action: "Review agreement",
};

const ACTIVATION_DUE = { title: "Activate your account", action: null };

const MEMBER_WAITING = { title: "Your business is being set up", body: "The account owner is verifying the business. You'll be able to work with stock and orders once that's done.", action: null };

export function NextStepCard({ vendorActive }: { vendorActive: boolean }) {
  const user = useCurrentUser();
  const isOwner = hasPermission(user.role, "vendor.verification.manage");
  const verification = useQuery({ queryKey: ["vendor", "verification"], queryFn: () => apiRequest<VerificationView>("/v1/vendor/verification"), enabled: !vendorActive });
  const agreements = useQuery({ queryKey: ["vendor", "agreements"], queryFn: () => apiRequest<RequiredAgreementView[]>("/v1/vendor/agreements"), enabled: vendorActive && isOwner });
  const activation = useActivation({ enabled: !vendorActive && isOwner });
  const copy = stepCopy();
  if (!copy) {
    return null;
  }
  return (
    <FeaturePanel
      stamp="Next step"
      title={copy.title}
      action={
        copy.payment ??
        (copy.action ? (
          <ButtonLink href="/verification" variant="yellow">
            {copy.action} →
          </ButtonLink>
        ) : null)
      }
    >
      {copy.body}
    </FeaturePanel>
  );

  function stepCopy(): StepCopy | null {
    if (vendorActive) {
      return agreements.data?.some((agreement) => !agreement.acceptedAt) ? UPDATED_AGREEMENT : null;
    }
    if (!isOwner) {
      return MEMBER_WAITING;
    }
    const due = activation.data;
    if (due?.state === "DUE" && due.feeMinor !== null) {
      const fee = formatMoney(due.feeMinor, due.currency, localeFor(user.countryCode));
      return {
        ...ACTIVATION_DUE,
        body: `You're verified and your agreements are signed. Pay the one-off activation fee of ${fee} to open your account.`,
        payment: <ActivationPayButton fee={fee} />,
      };
    }
    return verification.data ? COPY[verification.data.status] : null;
  }
}
