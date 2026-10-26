"use client";

import { CLAIM_KINDS, type ClaimKind, type ClaimView, type ReportClaimInput } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { PhotoCollector } from "@/features/receiving/photo-collector";

import { CLAIM_KIND_LABELS } from "./custody-display";
import { useCustodyMutation } from "./use-custody";

const ATTACHMENTS = "image/jpeg,image/png,image/webp,application/pdf";
const KIND_TONES = { SHORTAGE: "yellow", DAMAGE: "pink", LOSS: "orange" } as const;

interface ReportProblemProps {
  subject: { orderId: string } | { lotId: string };
  title: string;
  maxQuantity: number;
  onClose: () => void;
}

export function ReportProblemForm({ subject, title, maxQuantity, onClose }: ReportProblemProps) {
  const [kind, setKind] = useState<ClaimKind>("orderId" in subject ? "LOSS" : "DAMAGE");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [fileIds, setFileIds] = useState<string[]>([]);
  const report = useCustodyMutation<ReportClaimInput, ClaimView>((input) => ({ path: "/v1/vendor/claims", body: input }), "Reported. We'll look into it and email you.");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    report.mutate({ ...subject, kind, quantity: Number(quantity), description, fileIds }, { onSuccess: onClose });
  }

  return (
    <Paper className="motion-rise flex flex-col gap-4 px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Stamp>Report a problem</Stamp>
          <p className="mt-1 text-small font-medium">{title}</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormAlert message={formError(report.error) ?? fieldError(report.error, "orderId") ?? fieldError(report.error, "lotId") ?? null} />
        <div role="group" aria-label="What happened" className="flex flex-wrap gap-2">
          {CLAIM_KINDS.map((option) => (
            <ChoiceChip key={option} selected={kind === option} tone={KIND_TONES[option]} onToggle={() => setKind(option)}>
              {CLAIM_KIND_LABELS[option]}
            </ChoiceChip>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
          <Field label="Units affected" hint={`Up to ${maxQuantity}.`} error={fieldError(report.error, "quantity")}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} value={quantity} onChange={(event) => setQuantity(event.target.value.replace(/\D/g, ""))} />
            )}
          </Field>
          <Field label="What happened" hint="When you noticed, what the buyer told you, anything that helps us check." error={fieldError(report.error, "description")}>
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[96px]" value={description} onChange={(event) => setDescription(event.target.value)} />
            )}
          </Field>
        </div>
        <PhotoCollector
          label="Photo or document"
          hint="Optional. Photos of the damage or the buyer's message help. Up to 10 MB each."
          max={6}
          purpose="GENERAL_ATTACHMENT"
          accept={ATTACHMENTS}
          error={fieldError(report.error, "fileIds")}
          onChange={setFileIds}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="lime" loading={report.isPending} disabled={!quantity || description.trim().length < 20}>
            Send report
          </Button>
        </div>
      </form>
    </Paper>
  );
}
