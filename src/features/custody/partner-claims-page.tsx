"use client";

import type { ClaimView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { localeFor } from "@/lib/format";

import { ClaimFacts } from "./claim-details";
import { TrustCard } from "./trust-card";
import { useClaims, useCustodyMutation } from "./use-custody";

export function PartnerClaimsPage() {
  const claims = useClaims("partner");
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Your hub"
        title="Claims"
        lead="When stock goes missing or is damaged, we look at the evidence and decide who is responsible. If we think it happened at your hub, you can give your side before we decide."
      />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          {claims.isLoading ? (
            <LoadingRows columns={2} />
          ) : (claims.data ?? []).length === 0 ? (
            <EmptyState title="No claims" body="Keep counting carefully and photographing every parcel, and it stays that way." />
          ) : (
            <ul className="stagger flex flex-col gap-4">
              {claims.data!.map((claim) => (
                <li key={claim.id} className="motion-rise">
                  <Paper className="flex flex-col gap-4 px-6 py-5">
                    <ClaimFacts claim={claim} locale={localeFor(claim.countryCode)} />
                    {claim.status === "ASSESSED" && claim.liability === "PARTNER" && !claim.partnerResponse ? <RespondForm claim={claim} /> : null}
                  </Paper>
                </li>
              ))}
            </ul>
          )}
        </div>
        <TrustCard audience="PARTNER" />
      </div>
    </div>
  );
}

function RespondForm({ claim }: { claim: ClaimView }) {
  const [response, setResponse] = useState("");
  const respond = useCustodyMutation<string, ClaimView>((text) => ({ path: `/v1/partner/claims/${claim.id}/response`, body: { response: text } }), "Thanks. Your response is with our team.");
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <FormAlert message={formError(respond.error)} />
      <Field label="Your side" hint="You can respond once. Mention anything that helps, like when you last counted or how it was packed." error={fieldError(respond.error, "response")}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[96px]" value={response} onChange={(event) => setResponse(event.target.value)} />
        )}
      </Field>
      <div className="flex justify-end">
        <Button variant="lime" loading={respond.isPending} onClick={() => respond.mutate(response)}>
          Send response
        </Button>
      </div>
    </div>
  );
}
