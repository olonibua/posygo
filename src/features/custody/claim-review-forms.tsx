"use client";

import { type AssessClaimInput, CLAIM_LIABILITIES, type ClaimLiability, type ClaimView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Input, RadioDot, Textarea } from "@/components/ui/form-controls";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

import { LIABILITY_DISPLAY } from "./custody-display";
import { useCustodyMutation } from "./use-custody";

function toMinor(value: string): number {
  const amount = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export function AssessClaimForm({ claim, locale }: { claim: ClaimView; locale: string }) {
  const [liability, setLiability] = useState<ClaimLiability | null>(null);
  const [amount, setAmount] = useState((claim.amountMinor / 100).toFixed(2));
  const [writeOff, setWriteOff] = useState(false);
  const [note, setNote] = useState("");
  const assess = useCustodyMutation<AssessClaimInput, ClaimView>((input) => ({ path: `/v1/admin/claims/${claim.id}/assessment`, body: input }), "Assessment saved. It now needs a decision.");
  const options = CLAIM_LIABILITIES.filter((option) => option !== "PARTNER" || claim.partnerName);
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <FormAlert message={formError(assess.error)} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-small font-medium">Who is responsible?</legend>
        <div role="radiogroup" className="stagger grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={liability === option}
              onClick={() => setLiability(option)}
              className={cn(
                "motion-rise motion-press flex items-start gap-3 rounded-card border-[1.5px] px-4 py-3 text-left",
                liability === option ? "border-ink bg-yellow" : "border-line-strong bg-paper hover:border-ink",
              )}
            >
              <RadioDot checked={liability === option} />
              <span>
                <span className="block font-medium">{LIABILITY_DISPLAY[option].label}</span>
                <span className="text-meta text-ink-soft">{LIABILITY_DISPLAY[option].hint}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Wallet credit" hint={`Up to ${formatMoney(claim.amountMinor, claim.currency, locale)}, the declared value.`} error={fieldError(assess.error, "amountMinor")}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              inputMode="decimal"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              disabled={liability === "VENDOR"}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          )}
        </Field>
        {claim.lotCode && !claim.orderReference ? (
          <div className="flex items-end pb-2">
            <Checkbox label="Write the units off our records" checked={writeOff} onChange={(event) => setWriteOff(event.target.checked)} error={fieldError(assess.error, "writeOff")} />
          </div>
        ) : null}
      </div>
      <Field label="What you found" hint="The vendor and, if responsible, the hub will read this." error={fieldError(assess.error, "note")}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[80px]" value={note} onChange={(event) => setNote(event.target.value)} />
        )}
      </Field>
      <div className="flex justify-end">
        <Button
          variant="lime"
          disabled={!liability}
          loading={assess.isPending}
          onClick={() => liability && assess.mutate({ liability, amountMinor: liability === "VENDOR" ? 0 : toMinor(amount), writeOff, note })}
        >
          Save assessment
        </Button>
      </div>
    </div>
  );
}

export function DecideClaimForm({ claim }: { claim: ClaimView }) {
  const [note, setNote] = useState("");
  const decide = useCustodyMutation<{ approve: boolean; note: string }, ClaimView>(
    (input) => ({ path: `/v1/admin/claims/${claim.id}/decision`, body: input }),
    (input) => (input.approve ? "Settled. The vendor's wallet has been credited." : "Claim closed without a credit"),
  );
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <FormAlert message={formError(decide.error)} />
      <Field label="Decision note" hint="Someone who didn't open or assess the claim makes the decision." error={fieldError(decide.error, "note")}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[72px]" value={note} onChange={(event) => setNote(event.target.value)} />
        )}
      </Field>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" loading={decide.isPending && decide.variables?.approve === false} onClick={() => decide.mutate({ approve: false, note })}>
          Don&apos;t accept
        </Button>
        {claim.status === "ASSESSED" ? (
          <Button variant="lime" loading={decide.isPending && decide.variables?.approve === true} onClick={() => decide.mutate({ approve: true, note })}>
            Approve and settle
          </Button>
        ) : null}
      </div>
    </div>
  );
}
