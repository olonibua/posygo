"use client";

import { DOCUMENT_SLOTS, type DocumentSlot, hasPermission, type VerificationDraft, type VerificationStatus } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { countryName, DOCUMENT_LABELS, humanizeCode, HAZARD_LABELS, ORDER_BAND_LABELS, UNIT_BAND_LABELS, VERIFICATION_STATUS_DISPLAY } from "@/features/onboarding/display";
import { ApiError, apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { DecisionPanel } from "./decision-panel";

interface CaseDetail {
  vendorId: string;
  businessName: string;
  countryCode: string;
  status: VerificationStatus;
  answers: VerificationDraft;
  idNumberLast4: string | null;
  submittedAt: string | null;
  decisionReason: string | null;
}

export function VerificationCase({ vendorId }: { vendorId: string }) {
  const user = useCurrentUser();
  const isReviewer = hasPermission(user.role, "verifications.review");
  const detail = useQuery({ queryKey: ["admin", "verification", vendorId], queryFn: () => apiRequest<CaseDetail>(`/v1/admin/verifications/${vendorId}`) });
  const [idNumber, setIdNumber] = useState<string | null>(null);
  const reveal = useMutation({
    mutationFn: () => apiRequest<{ idNumber: string | null }>(`/v1/admin/verifications/${vendorId}/id-number`, { method: "POST" }),
    onSuccess: (result) => setIdNumber(result.idNumber),
  });
  const openDocument = useMutation({
    mutationFn: (slot: DocumentSlot) => apiRequest<{ url: string }>(`/v1/admin/verifications/${vendorId}/documents/${slot}/url`, { method: "POST" }),
    onSuccess: (result) => window.open(result.url, "_blank", "noopener,noreferrer"),
  });

  const data = detail.data;
  if (!data) {
    return detail.isError ? <p className="text-ink-soft">{"This case isn't available to you."}</p> : <PageSkeleton />;
  }
  const answers = data.answers;
  const sections: Array<[string, Array<[string, string | undefined]>]> = [
    [
      "Business",
      [
        ["Legal name", answers.legalBusinessName],
        ["Type", humanizeCode(answers.businessType)],
        ["Registered in", answers.registrationCountryCode ? countryName(answers.registrationCountryCode) : undefined],
        ["Company number", answers.companyNumber],
        ["Tax number", answers.taxNumber],
        [
          "Address",
          [answers.registeredAddress?.line1, answers.registeredAddress?.line2, answers.registeredAddress?.city, answers.registeredAddress?.region, answers.registeredAddress?.postalCode]
            .filter(Boolean)
            .join(", "),
        ],
      ],
    ],
    [
      "Contact",
      [
        ["Name", answers.contactFullName],
        ["Role", answers.contactRole],
        ["Phone", answers.contactPhone],
      ],
    ],
    [
      "Operations",
      [
        ["Products", answers.productsDescription],
        ["Units / month", answers.monthlyUnits ? UNIT_BAND_LABELS[answers.monthlyUnits] : undefined],
        ["Orders / month", answers.monthlyOrders ? ORDER_BAND_LABELS[answers.monthlyOrders] : undefined],
        ["Handling", answers.hazards?.map((hazard) => HAZARD_LABELS[hazard]).join(", ")],
      ],
    ],
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp={`Verification · ${countryName(data.countryCode)}`}
        title={data.businessName}
        action={<StatusPill tone={VERIFICATION_STATUS_DISPLAY[data.status].tone}>{VERIFICATION_STATUS_DISPLAY[data.status].label}</StatusPill>}
      />
      <FormAlert message={[reveal.error, openDocument.error].find((error) => error instanceof ApiError)?.message ?? null} />
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5">
          {sections.map(([title, rows]) => (
            <Paper key={title} className="px-6 py-4">
              <Stamp>{title}</Stamp>
              <dl className="mt-2">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 border-t border-line py-2.5 text-small first:border-t-0">
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className="text-right">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </Paper>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <Paper className="px-6 py-5">
            <Stamp>Identity</Stamp>
            <p className="mt-2 text-small">
              {humanizeCode(answers.idType) ?? "—"} · expires {answers.idExpiry ?? "—"}
            </p>
            <p className="mt-1 font-mono text-[15px]">{idNumber ?? (data.idNumberLast4 ? `•••• ${data.idNumberLast4}` : "Not provided")}</p>
            {isReviewer && !idNumber && data.idNumberLast4 ? (
              <Button variant="ghost" className="mt-3" loading={reveal.isPending} onClick={() => reveal.mutate()}>
                Reveal full number
              </Button>
            ) : null}
          </Paper>
          <Paper className="px-6 py-5">
            <Stamp>Documents</Stamp>
            <ul className="mt-2 flex flex-col gap-2">
              {DOCUMENT_SLOTS.filter((slot) => answers.documents?.[slot]).map((slot) => (
                <li key={slot} className="flex items-center justify-between gap-3 text-small">
                  {DOCUMENT_LABELS[slot].label}
                  {isReviewer ? (
                    <Button variant="ghost" onClick={() => openDocument.mutate(slot)}>
                      Open ↗
                    </Button>
                  ) : (
                    <span className="text-ink-faint">Reviewers only</span>
                  )}
                </li>
              ))}
            </ul>
          </Paper>
          {isReviewer && data.status === "SUBMITTED" ? <DecisionPanel vendorId={vendorId} onDecided={() => void detail.refetch()} /> : null}
        </div>
      </div>
    </div>
  );
}
