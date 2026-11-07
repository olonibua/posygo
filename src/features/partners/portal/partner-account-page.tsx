"use client";

import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { countryName } from "@/features/onboarding/display";
import { localeFor } from "@/lib/format";

import { usePartnerOverview } from "../use-partners";
import { AgreementCard } from "./agreement-card";
import { PayoutAccountCard } from "./payout-account-card";
import { useProviderReturn } from "./use-provider-return";
import { ProfileChangeCard } from "./profile-change-card";
import { VerificationChecks } from "./verification-section";

export function PartnerAccountPage() {
  const overview = usePartnerOverview();
  useProviderReturn();
  const partner = overview.data;
  if (!partner) {
    return overview.isError ? <p className="text-ink-soft">{"We couldn't load your account. Try again shortly."}</p> : <PageSkeleton />;
  }
  const locale = localeFor(partner.countryCode);
  const closed = partner.status === "TERMINATED" || partner.status === "REJECTED";

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp={`${partner.reference} · ${countryName(partner.countryCode)}`} title="Account" lead="Your details, the checks you passed, your agreement and where we pay you." />
      <section aria-labelledby="payouts-heading" className="flex flex-col gap-4">
        <h2 id="payouts-heading" className="text-h3">
          Agreement and payouts
        </h2>
        <div className="grid gap-4 xl:grid-cols-2">
          <PayoutAccountCard partner={partner} disabled={closed} />
          <AgreementCard partner={partner} locale={locale} disabled={closed} />
        </div>
      </section>
      <section aria-labelledby="details-heading" className="flex flex-col gap-4">
        <h2 id="details-heading" className="text-h3">
          Your details and checks
        </h2>
        <ProfileChangeCard partner={partner} locale={locale} disabled={partner.status !== "ACTIVE" && partner.status !== "SUSPENDED"} />
        <VerificationChecks partner={partner} locale={locale} editable={false} />
      </section>
    </div>
  );
}
