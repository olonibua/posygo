"use client";

import type { LegalDocumentView, PartnerDetailView, SignAgreementInput } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Checkbox, Field, FormAlert, Input } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { SkeletonLines } from "@/components/ui/skeleton";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

import { usePortalMutation } from "../use-partners";

export function AgreementCard({ partner, locale, disabled }: { partner: PartnerDetailView; locale: string; disabled: boolean }) {
  const agreement = partner.agreements[0];
  const [reading, setReading] = useState(false);
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const sign = usePortalMutation((input: SignAgreementInput) => ({ path: "/v1/partner/agreement/sign", body: input }), "Agreement signed");
  const document = useQuery({
    queryKey: ["legal", partner.countryCode, "PARTNER_AGREEMENT"],
    queryFn: () => apiRequest<LegalDocumentView>(`/v1/legal/${partner.countryCode}/PARTNER_AGREEMENT`, { authenticated: false }),
    enabled: reading,
  });

  if (!agreement?.documentId) {
    return (
      <Paper className="px-6 py-5">
        <Stamp>Partner agreement</Stamp>
        <p className="mt-2 text-small text-ink-soft">The agreement for your country isn&apos;t published yet. We&apos;ll email you when it&apos;s ready to sign.</p>
      </Paper>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (agreement?.documentId) {
      sign.mutate({ documentId: agreement.documentId, signatureName: name, consent: true });
    }
  }

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
      ) : null}
      <div>
        <Button variant="ghost" onClick={() => setReading((value) => !value)} aria-expanded={reading}>
          {reading ? "Hide the agreement" : "Read the agreement"}
        </Button>
      </div>
      {reading ? <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-card bg-cream px-4 py-3 text-small">{document.data?.body ?? <SkeletonLines />}</div> : null}
      {agreement.signedAt || disabled ? null : (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3 border-t border-line pt-3">
          <FormAlert message={formError(sign.error)} />
          <Field label="Type your full name to sign" hint={`It must match the name on your application: ${partner.legalName}.`} error={fieldError(sign.error, "signatureName")}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid} value={name} onChange={(event) => setName(event.target.value)} />
            )}
          </Field>
          <Checkbox label="I've read the agreement and I'm signing it electronically." checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <div className="flex justify-end">
            <Button type="submit" variant="lime" loading={sign.isPending} disabled={!consent || !reading || name.trim().length < 2}>
              Sign agreement
            </Button>
          </div>
        </form>
      )}
    </Paper>
  );
}
