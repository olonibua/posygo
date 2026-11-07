"use client";

import type { VendorActivationView, VerificationView } from "@/shared";
import Link from "next/link";

import { StatusPill } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, formatMoney, localeFor } from "@/lib/format";

import { useActivation } from "../activation/use-activation";
import { AgreementsPanel } from "../agreements-panel";
import { countryName, humanizeCode, VERIFICATION_STATUS_DISPLAY } from "../display";
import { useVerification } from "../use-verification";

export function VendorAccountPage() {
  const user = useCurrentUser();
  const verification = useVerification().view;
  const activation = useActivation();
  const view = verification.data;
  if (!view) {
    return verification.isError ? <p className="text-ink-soft">{"We couldn't load your account. Try again shortly."}</p> : <PageSkeleton />;
  }
  const locale = localeFor(user.countryCode);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp={user.businessName ?? "Account"} title="Account" lead="Your business details, your verification, the agreements you signed and your activation fee." />
      <div className="grid gap-4 xl:grid-cols-2">
        <BusinessCard view={view} locale={locale} />
        <ActivationCard activation={activation.data} locale={locale} />
      </div>
      <AgreementsPanel />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null;
  }
  return (
    <div className="flex justify-between gap-4 border-t border-line py-2 first:border-t-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="whitespace-pre-line text-right">{value}</dd>
    </div>
  );
}

function BusinessCard({ view, locale }: { view: VerificationView; locale: string }) {
  const status = VERIFICATION_STATUS_DISPLAY[view.status];
  const { draft } = view;
  const address = draft.registeredAddress;
  const kyc = view.market.kyc;
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>Your business</Stamp>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>
      {draft.legalBusinessName ? null : <p className="text-small text-ink-soft">No business details on file yet.</p>}
      <dl className="text-small">
        <Detail label="Legal name" value={draft.legalBusinessName} />
        <Detail label="Business type" value={humanizeCode(draft.businessType)} />
        <Detail label="Registered in" value={draft.registrationCountryCode ? countryName(draft.registrationCountryCode) : null} />
        <Detail label={kyc.companyNumber.label} value={draft.companyNumber} />
        <Detail label={kyc.taxNumber?.label ?? "Tax number"} value={draft.taxNumber} />
        <Detail label="Registered address" value={address ? [address.line1, address.line2, address.city, address.region, address.postalCode].filter(Boolean).join("\n") : null} />
        <Detail label="Contact" value={[draft.contactFullName, draft.contactRole].filter(Boolean).join(", ")} />
        <Detail label="Phone" value={draft.contactPhone} />
        <Detail label="Submitted" value={view.submittedAt ? formatDate(view.submittedAt, locale) : null} />
      </dl>
      <p className="text-small text-ink-soft">Details changed? Ask Posy, the helper in the corner, and we&apos;ll update them after a quick check.</p>
    </Paper>
  );
}

function ActivationCard({ activation, locale }: { activation: VendorActivationView | undefined; locale: string }) {
  const payment = activation?.payment;
  const paid = payment?.status === "PAID" && payment.paidAt;
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>Activation fee</Stamp>
        {activation?.state === "LIVE" ? <StatusPill tone="lime">Live</StatusPill> : <StatusPill tone="yellow">Not live yet</StatusPill>}
      </div>
      {paid ? (
        <p className="text-small">
          You paid {formatMoney(payment.feeMinor, payment.currency, locale)} on {formatDate(payment.paidAt!, locale)}. It&apos;s a one-off fee for the whole account.
        </p>
      ) : activation?.state === "LIVE" ? (
        <p className="text-small">Your account is live. No activation fee was due.</p>
      ) : (
        <p className="text-small text-ink-soft">
          Finish your <Link href="/verification">verification</Link> to make your account live.
        </p>
      )}
    </Paper>
  );
}
