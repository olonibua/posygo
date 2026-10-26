"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { FeaturePanel } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { TrustCard } from "@/features/custody/trust-card";
import { countryName } from "@/features/onboarding/display";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { PartnerStatusNote, ReadinessList, ScorecardPanel } from "../partner-parts";
import { usePartnerOverview, usePartnerScorecard, usePortalMutation } from "../use-partners";
import { InsuranceCard } from "./insurance-card";
import { VerificationSection } from "./verification-section";

function useReturnFromProvider() {
  const params = useSearchParams();
  const identity = usePortalMutation(() => ({ path: "/v1/partner/identity/refresh" }));
  const payouts = usePortalMutation(() => ({ path: "/v1/partner/payouts/refresh" }));
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) {
      return;
    }
    handled.current = true;
    if (params.get("identity") === "returned") {
      identity.mutate(undefined);
    }
    if (params.get("payouts") === "returned") {
      payouts.mutate(undefined);
    }
  }, [params, identity, payouts]);
}

export function PartnershipPage() {
  const user = useCurrentUser();
  const overview = usePartnerOverview();
  const lead = user.role === "FULFILMENT_PARTNER";
  useReturnFromProvider();
  const partner = overview.data;
  if (!partner) {
    return overview.isError ? <p className="text-ink-soft">{"We couldn't load your partnership. Try again shortly."}</p> : <PageSkeleton />;
  }
  const locale = localeFor(partner.countryCode);
  const operating = ["ACTIVE", "SUSPENDED", "OFFBOARDING"].includes(partner.status);
  const money = (amount: number) => formatMoney(amount, partner.currency, locale);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp={`${partner.reference} · ${countryName(partner.countryCode)}`} title={partner.legalName} lead="Your fulfilment partnership, from verification to running your hub." />
      <PartnerStatusNote status={partner.status} reason={partner.statusReason} />
      {operating ? (
        <FeaturePanel
          tone={partner.status === "ACTIVE" ? "blue" : "cocoa"}
          stamp={`Your hub · ${partner.tier.name} tier${partner.founding ? " · founding partner" : ""}`}
          title={partner.warehouses.map((warehouse) => `${warehouse.name} (${warehouse.code})`).join(", ") || "Being set up"}
        >
          Up to {money(partner.tier.maxStockValueMinor)} of stock, items up to {money(partner.tier.maxItemValueMinor)} each. Holding {money(partner.heldStockValueMinor)} now.
        </FeaturePanel>
      ) : null}
      {lead ? (
        <>
          {operating ? <Scorecard tierName={partner.tier.name} /> : null}
          {partner.status !== "ACTIVE" ? (
            <ReadinessList readiness={partner.readiness} optional={{ deposit: partner.requiredDepositMinor === 0, insurance: partner.requiredInsuranceMinor === 0 }} />
          ) : null}
          {operating ? null : <VerificationSection partner={partner} locale={locale} />}
          {partner.requiredDepositMinor > 0 && !partner.readiness.deposit ? (
            <p className="max-w-2xl text-small text-ink-soft">We hold a refundable deposit of {money(partner.requiredDepositMinor)} for your hub. Our finance team will contact you about paying it.</p>
          ) : null}
          {partner.requiredInsuranceMinor > 0 ? <InsuranceCard partner={partner} disabled={partner.status === "TERMINATED" || partner.status === "REJECTED"} locale={locale} /> : null}
        </>
      ) : (
        <p className="max-w-xl text-small text-ink-soft">The partner manages verification, the agreement and payouts. Use the menu to receive stock and pack orders.</p>
      )}
    </div>
  );
}

function Scorecard({ tierName }: { tierName: string }) {
  const scorecard = usePartnerScorecard();
  return (
    <section aria-labelledby="scorecard-heading" className="flex flex-col gap-3">
      <h2 id="scorecard-heading" className="text-h3">
        How your hub is doing
      </h2>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ScorecardPanel scorecard={scorecard.data} tierName={tierName} />
        <TrustCard audience="PARTNER" />
      </div>
    </section>
  );
}
