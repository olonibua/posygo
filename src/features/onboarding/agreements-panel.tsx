"use client";

import { hasPermission, type LegalDocumentKind, type RequiredAgreementView, type SignatureInput } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { AgreementSigning } from "@/features/agreements/agreement-signing";
import { ApiError, apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, localeFor } from "@/lib/format";

import { countryName } from "./display";

const SIGNED_KINDS: readonly LegalDocumentKind[] = ["VENDOR_AGREEMENT"];
const AGREEMENTS_KEY = ["vendor", "agreements"] as const;

export function AgreementsPanel() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const queryClient = useQueryClient();
  const canAccept = hasPermission(user.role, "vendor.verification.manage");
  const [reading, setReading] = useState<string | null>(null);
  const [signing, setSigning] = useState<string | null>(null);
  const agreements = useQuery({ queryKey: AGREEMENTS_KEY, queryFn: () => apiRequest<RequiredAgreementView[]>("/v1/vendor/agreements") });
  const accept = useMutation({
    mutationFn: ({ documentId, signature }: { documentId: string; signature?: SignatureInput }) =>
      apiRequest<{ vendorActive: boolean }>(`/v1/vendor/agreements/${documentId}/accept`, { method: "POST", body: { signature } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["vendor"] }),
  });

  if (!agreements.data?.length) {
    return null;
  }
  const open = agreements.data.find((entry) => entry.document.id === signing);

  return (
    <section aria-labelledby="agreements-heading" className="flex flex-col gap-3">
      <h2 id="agreements-heading" className="text-h3">
        Agreements
      </h2>
      <FormAlert message={!signing && accept.error instanceof ApiError ? accept.error.message : null} />
      {agreements.data.map(({ document, acceptedAt }) => {
        const signed = SIGNED_KINDS.includes(document.kind);
        return (
          <Paper key={document.id} className="px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Stamp>Version {document.version}</Stamp>
                <h3 className="mt-1 text-[19px] font-medium tracking-[-0.4px]">{document.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                {acceptedAt ? <StatusPill tone="lime">{signed ? "Signed" : "Accepted"} {formatDate(acceptedAt, locale)}</StatusPill> : <StatusPill tone="yellow">{signed ? "Not signed" : "Not accepted"}</StatusPill>}
                {signed ? (
                  <Button variant={acceptedAt || !canAccept ? "ghost" : "yellow"} onClick={() => setSigning(document.id)}>
                    {acceptedAt ? "View signed copy" : canAccept ? "Review and sign" : "Read"}
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => setReading(reading === document.id ? null : document.id)} aria-expanded={reading === document.id}>
                    {reading === document.id ? "Hide" : "Read"}
                  </Button>
                )}
              </div>
            </div>
            {!signed && reading === document.id ? (
              <div className="mt-4 flex flex-col gap-4">
                <div className="max-h-[360px] overflow-y-auto whitespace-pre-wrap rounded-card bg-paper-sunk px-5 py-4 text-small leading-[22px] text-ink-soft">{document.body}</div>
                {!acceptedAt && canAccept ? (
                  <Button variant="yellow" className="self-end" loading={accept.isPending} onClick={() => accept.mutate({ documentId: document.id })}>
                    I accept on behalf of my business
                  </Button>
                ) : null}
              </div>
            ) : null}
          </Paper>
        );
      })}
      {open ? (
        <AgreementSigning
          document={open.document}
          party={{ name: user.businessName ?? "Your business", role: "Seller", country: countryName(open.document.countryCode) }}
          signerName=""
          certificate={open.certificate}
          canSign={canAccept && !open.acceptedAt}
          locale={locale}
          onSign={(signature) => accept.mutateAsync({ documentId: open.document.id, signature })}
          onClose={() => {
            setSigning(null);
            accept.reset();
          }}
        />
      ) : null}
    </section>
  );
}
