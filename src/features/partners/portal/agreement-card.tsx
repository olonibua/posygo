"use client";

import type { LegalDocumentView, PartnerDetailView, SignAgreementInput } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { AgreementSigning } from "@/features/agreements/agreement-signing";
import { countryName } from "@/features/onboarding/display";
import { apiRequest } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

import { usePortalMutation } from "../use-partners";

export function AgreementCard({ partner, locale, disabled }: { partner: PartnerDetailView; locale: string; disabled: boolean }) {
  const agreement = partner.agreements[0];
  const [open, setOpen] = useState(false);
  const sign = usePortalMutation((input: SignAgreementInput) => ({ path: "/v1/partner/agreement/sign", body: input }), "Agreement signed");
  const document = useQuery({
    queryKey: ["legal", partner.countryCode, "PARTNER_AGREEMENT"],
    queryFn: () => apiRequest<LegalDocumentView>(`/v1/legal/${partner.countryCode}/PARTNER_AGREEMENT`, { authenticated: false }),
    enabled: open,
  });

  if (!agreement?.documentId) {
    return (
      <Paper className="px-6 py-5">
        <Stamp>Partner agreement</Stamp>
        <p className="mt-2 text-small text-ink-soft">The agreement for your country isn&apos;t published yet. We&apos;ll email you when it&apos;s ready to sign.</p>
      </Paper>
    );
  }
  const documentId = agreement.documentId;

  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>Partner agreement · version {agreement.version}</Stamp>
        {agreement.signedAt ? <StatusPill tone="lime">Signed</StatusPill> : <StatusPill tone="sky">To sign</StatusPill>}
      </div>
      {agreement.signedAt ? (
        <p className="text-small">
          Signed by <b className="font-medium">{agreement.signatureName}</b> on {formatDateTime(agreement.signedAt, locale)}.
        </p>
      ) : (
        <p className="text-small text-ink-soft">Read it in full, then sign with your finger, mouse or typed name.</p>
      )}
      <div>
        <Button variant={agreement.signedAt || disabled ? "ghost" : "lime"} loading={open && document.isLoading} onClick={() => setOpen(true)}>
          {agreement.signedAt ? "View signed copy" : disabled ? "Read the agreement" : "Review and sign"}
        </Button>
      </div>
      {open && document.data ? (
        <AgreementSigning
          document={document.data}
          party={{ name: partner.legalName, role: "Fulfilment partner", country: countryName(partner.countryCode) }}
          signerName={partner.legalName}
          lockedName
          certificate={agreement.certificate}
          canSign={!agreement.signedAt && !disabled && document.data.id === documentId}
          locale={locale}
          onSign={(signature) => sign.mutateAsync({ documentId, signature })}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </Paper>
  );
}
