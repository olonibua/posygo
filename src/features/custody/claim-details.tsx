import type { ClaimView } from "@/shared";

import { StatusPill } from "@/components/ui/chip";
import { Stamp } from "@/components/ui/surfaces";
import { formatDate, formatMoney } from "@/lib/format";

import { CLAIM_KIND_LABELS, CLAIM_SOURCE_LABELS, CLAIM_STATUS_DISPLAY, LIABILITY_DISPLAY } from "./custody-display";

export function ClaimStatus({ claim }: { claim: ClaimView }) {
  const display = CLAIM_STATUS_DISPLAY[claim.status];
  return <StatusPill tone={display.tone}>{display.label}</StatusPill>;
}

export function claimSubject(claim: ClaimView): string {
  return claim.orderReference ? `Order ${claim.orderReference}` : `${claim.productName ?? "Stock"} · ${claim.lotCode ?? ""}`;
}

function Note({ title, children, tone = "bg-cream" }: { title: string; children: string; tone?: string }) {
  return (
    <div className={`motion-rise rounded-card px-3.5 py-2.5 text-small ${tone}`}>
      <span className="block text-meta text-ink-soft">{title}</span>
      {children}
    </div>
  );
}

export function ClaimFacts({ claim, locale }: { claim: ClaimView; locale: string }) {
  const money = (amount: number) => formatMoney(amount, claim.currency, locale);
  const recovered = claim.recoveredLedgerMinor + claim.recoveredDepositMinor;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>
          {claim.reference} · {CLAIM_SOURCE_LABELS[claim.source]}
        </Stamp>
        <ClaimStatus claim={claim} />
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-small sm:grid-cols-2">
        {[
          ["What happened", `${CLAIM_KIND_LABELS[claim.kind]} · ${claim.quantity} ${claim.quantity === 1 ? "unit" : "units"}`],
          ["About", claimSubject(claim)],
          ["Where", claim.warehouseName],
          ["Declared value", money(claim.amountMinor)],
          ...(claim.vendorName ? [["Vendor", claim.vendorName]] : []),
          ...(claim.partnerName ? [["Partner", claim.partnerName]] : []),
          ["Opened", formatDate(claim.createdAt, locale)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-ink-faint">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <Note title="Report">{claim.description}</Note>
      {claim.assessmentNote ? (
        <Note
          title={`Assessment${claim.liability ? ` · responsible: ${LIABILITY_DISPLAY[claim.liability].label.toLowerCase()}` : ""}${claim.assessedByEmail ? ` · ${claim.assessedByEmail}` : ""}`}
          tone="bg-sky/60"
        >
          {`${claim.assessmentNote}${claim.compensationMinor > 0 ? ` Proposed compensation ${money(claim.compensationMinor)}.` : ""}${claim.writeOff ? " The units will be written off." : ""}`}
        </Note>
      ) : null}
      {claim.partnerResponse ? (
        <Note title="The hub's response" tone="bg-yellow/60">
          {claim.partnerResponse}
        </Note>
      ) : null}
      {claim.decisionNote ? (
        <Note title={`Decision${claim.decidedByEmail ? ` · ${claim.decidedByEmail}` : ""}`} tone={claim.status === "SETTLED" ? "bg-lime/60" : "bg-cream"}>
          {claim.decisionNote}
        </Note>
      ) : null}
      {claim.status === "SETTLED" && claim.compensationMinor > 0 ? (
        <p className="motion-pop rounded-card bg-lime px-3.5 py-2.5 text-small font-medium">
          {money(claim.compensationMinor)} credited to the vendor&apos;s wallet
          {recovered > 0 ? ` · ${money(recovered)} recovered from the hub` : ""}
          {claim.platformCoverMinor > 0 ? ` · ${money(claim.platformCoverMinor)} covered by us` : ""}
        </p>
      ) : null}
    </div>
  );
}
