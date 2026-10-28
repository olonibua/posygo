"use client";

import { type InboundDetailView, type InboundEstimateView, withCountry } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { ButtonLink } from "@/components/ui/button";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { useVendorWallet } from "@/features/finance/use-vendor-wallet";
import { errorMessage } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { formatDate, formatMoney } from "@/lib/format";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between border-t border-line pt-2 font-semibold" : "flex justify-between py-1"}>
      <dt className={strong ? undefined : "text-ink-soft"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function useEstimate(inbound: InboundDetailView) {
  const body = { shippingMode: inbound.shippingMode, boxCounts: inbound.declaredBoxCounts };
  return useQuery({
    queryKey: ["vendor", "inbound", inbound.id, "estimate", inbound.countryCode, body],
    queryFn: () => apiRequest<InboundEstimateView>(withCountry("/v1/vendor/inbound/estimate", inbound.countryCode), { method: "POST", body }),
    enabled: inbound.status === "DRAFT",
    retry: false,
  });
}

export function InboundChargesCard({ inbound, locale }: { inbound: InboundDetailView; locale: string }) {
  const estimate = useEstimate(inbound);
  const wallet = useVendorWallet(true, inbound.countryCode);
  const { charges } = inbound;
  const money = (minor: number) => formatMoney(minor, charges.currency, locale);

  if (inbound.status === "DRAFT") {
    const quote = estimate.data;
    const short = quote && wallet.data ? quote.totalMinor - wallet.data.balanceMinor : 0;
    return (
      <Paper className="px-6 py-5">
        <Stamp>Charge when you submit</Stamp>
        {quote ? (
          <dl className="mt-3 text-small">
            <Row label="Stocking" value={money(quote.stockingMinor)} />
            <Row label="First month of storage" value={money(quote.storageMinor)} />
            {quote.waivedMinor > 0 ? <Row label="First shipment, stocking waived" value={`−${money(quote.waivedMinor)}`} /> : null}
            <Row label="Taken from your wallet" value={money(quote.totalMinor)} strong />
          </dl>
        ) : (
          <p className="mt-3 text-small text-ink-soft">{estimate.isError ? errorMessage(estimate.error) : "Working out the price…"}</p>
        )}
        {short > 0 ? (
          <div className="mt-4 flex flex-col gap-3 rounded-card bg-orange px-4 py-3 text-small text-cocoa">
            <p>Your wallet is {money(short)} short. Add funds before submitting.</p>
            <ButtonLink href="/wallet" variant="yellow">
              Add funds
            </ButtonLink>
          </div>
        ) : null}
      </Paper>
    );
  }

  if (charges.onboardingFeeMinor === null && charges.holdChargeMinor === null) {
    return null;
  }
  return (
    <Paper className="px-6 py-5">
      <Stamp>Charges</Stamp>
      <dl className="mt-3 text-small">
        {charges.onboardingFeeMinor !== null ? (
          <Row label={charges.onboardingChargedAt ? `Onboarding, ${formatDate(charges.onboardingChargedAt, locale)}` : "Onboarding"} value={money(charges.onboardingFeeMinor)} />
        ) : null}
        {charges.holdChargeMinor !== null ? (
          <Row label={charges.holdPaidAt ? `Hold charge, paid ${formatDate(charges.holdPaidAt, locale)}` : "Hold charge, due now"} value={money(charges.holdChargeMinor)} />
        ) : null}
      </dl>
    </Paper>
  );
}
