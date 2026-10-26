"use client";

import { hasPermission, type RequiredAgreementView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { ApiError, apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate } from "@/lib/format";

export function AgreementsPanel() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const canAccept = hasPermission(user.role, "vendor.verification.manage");
  const [open, setOpen] = useState<string | null>(null);
  const agreements = useQuery({ queryKey: ["vendor", "agreements"], queryFn: () => apiRequest<RequiredAgreementView[]>("/v1/vendor/agreements") });
  const accept = useMutation({
    mutationFn: (documentId: string) => apiRequest<{ vendorActive: boolean }>(`/v1/vendor/agreements/${documentId}/accept`, { method: "POST" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["vendor"] }),
  });

  if (!agreements.data?.length) {
    return null;
  }
  return (
    <section aria-labelledby="agreements-heading" className="flex flex-col gap-3">
      <h2 id="agreements-heading" className="text-h3">
        Agreements
      </h2>
      <FormAlert message={accept.error instanceof ApiError ? accept.error.message : null} />
      {agreements.data.map(({ document, acceptedAt }) => (
        <Paper key={document.id} className="px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Stamp>Version {document.version}</Stamp>
              <h3 className="mt-1 text-[19px] font-medium tracking-[-0.4px]">{document.title}</h3>
            </div>
            <div className="flex items-center gap-3">
              {acceptedAt ? <StatusPill tone="lime">Accepted {formatDate(acceptedAt, "en-GB")}</StatusPill> : <StatusPill tone="yellow">Not accepted</StatusPill>}
              <Button variant="ghost" onClick={() => setOpen(open === document.id ? null : document.id)} aria-expanded={open === document.id}>
                {open === document.id ? "Hide" : "Read"}
              </Button>
            </div>
          </div>
          {open === document.id ? (
            <div className="mt-4 flex flex-col gap-4">
              <div className="max-h-[360px] overflow-y-auto whitespace-pre-wrap rounded-card bg-paper-sunk px-5 py-4 text-small leading-[22px] text-ink-soft">{document.body}</div>
              {!acceptedAt && canAccept ? (
                <Button variant="yellow" className="self-end" loading={accept.isPending} onClick={() => accept.mutate(document.id)}>
                  I accept on behalf of my business
                </Button>
              ) : null}
            </div>
          ) : null}
        </Paper>
      ))}
    </section>
  );
}
