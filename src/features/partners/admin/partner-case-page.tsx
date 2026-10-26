"use client";

import { hasPermission } from "@/shared";

import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { countryName } from "@/features/onboarding/display";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime, localeFor } from "@/lib/format";

import { HEARD_FROM_LABELS } from "../partner-display";
import { PartnerStatusNote, ReadinessList } from "../partner-parts";
import { usePartnerCase } from "../use-partners";
import { DepositPanel, EarningsPanel, PayoutAccountPanel } from "./case-finance";
import { ChecksReview, InsuranceReview } from "./case-review";
import { DecisionsPanel, SetupPanel } from "./case-setup";
import { TrustSection } from "./case-trust";

export function PartnerCasePage({ partnerId }: { partnerId: string }) {
  const user = useCurrentUser();
  const detail = usePartnerCase(partnerId);
  const partner = detail.data;
  if (!partner) {
    return detail.isError ? <p className="text-ink-soft">{"This partner isn't available to you."}</p> : <PageSkeleton />;
  }
  const locale = localeFor(partner.countryCode);
  const canReview = hasPermission(user.role, "partners.review");
  const canManage = hasPermission(user.role, "partners.manage");
  const canFinance = hasPermission(user.role, "partners.finance");
  const profile = partner.profile;
  const agreement = partner.agreements[0];
  const operating = ["ACTIVE", "SUSPENDED", "OFFBOARDING", "TERMINATED"].includes(partner.status);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp={`${partner.reference} · ${countryName(partner.countryCode)}`} title={partner.legalName} lead={`${partner.contactEmail}${partner.founding ? " · founding partner" : ""}`} />
      <PartnerStatusNote status={partner.status} reason={partner.statusReason} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="flex flex-col gap-4">
          <ReadinessList readiness={partner.readiness} optional={{ deposit: partner.requiredDepositMinor === 0, insurance: partner.requiredInsuranceMinor === 0 }} />
          <Paper className="px-6 py-5">
            <Stamp>Application</Stamp>
            {profile ? (
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-small sm:grid-cols-2">
                {[
                  ["Name", profile.fullName],
                  ["Phone", profile.phone],
                  ["Storage address", [...profile.addressLines, profile.city, profile.postalCode].join(", ")],
                  ["Heard about us", partner.heardFrom ? HEARD_FROM_LABELS[partner.heardFrom] : "—"],
                  ["Hub", partner.warehouses.length > 0 ? partner.warehouses.map((warehouse) => `${warehouse.name} (${warehouse.code})`).join(", ") : "Created on approval"],
                  ["The space", profile.spaceDescription],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-ink-faint">{label}</dt>
                    <dd className="whitespace-pre-wrap">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-small text-ink-soft">No application details on file.</p>
            )}
          </Paper>
        </div>
        <div className="flex flex-col gap-4">
          <DecisionsPanel partner={partner} role={user.role} />
          <Paper className="px-6 py-5 text-small">
            <Stamp>Partner agreement</Stamp>
            <p className="mt-2">
              {agreement?.signedAt
                ? `Version ${agreement.version}, signed by ${agreement.signatureName} on ${formatDateTime(agreement.signedAt, locale)}`
                : agreement?.documentId
                  ? `Version ${agreement.version} not signed yet`
                  : "Not published for this country"}
            </p>
          </Paper>
        </div>
      </div>
      <ChecksReview partner={partner} canReview={canReview} locale={locale} />
      {operating ? <TrustSection partner={partner} canReview={canReview} canManage={canManage} /> : null}
      {partner.requiredInsuranceMinor > 0 || partner.insurance.length > 0 ? <InsuranceReview partner={partner} canReview={canReview} locale={locale} /> : null}
      {canManage ? <SetupPanel partner={partner} /> : null}
      {canFinance ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <PayoutAccountPanel partner={partner} locale={locale} />
            <DepositPanel partner={partner} locale={locale} />
          </div>
          {operating ? <EarningsPanel partner={partner} locale={locale} /> : null}
        </>
      ) : null}
    </div>
  );
}
