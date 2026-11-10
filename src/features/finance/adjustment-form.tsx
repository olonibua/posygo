"use client";

import { ADJUSTMENT_DIRECTIONS, type AdjustmentDirection, type AdjustmentView, type RequestAdjustmentInput } from "@/shared";
import type { UseMutationResult } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { formatMoney } from "@/lib/format";

import { ADJUSTMENT_STATUS_DISPLAY } from "./finance-display";
import { MoneyField } from "./money-field";
import { toMinor } from "./money-input";

interface AdjustmentFormProps {
  request: UseMutationResult<AdjustmentView, Error, RequestAdjustmentInput>;
  currency: string;
  locale: string;
  audience: "vendor" | "partner";
  onDone?: () => void;
}

export function AdjustmentForm({ request, currency, locale, audience, onDone }: AdjustmentFormProps) {
  const [direction, setDirection] = useState<AdjustmentDirection>("CREDIT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const amountMinor = toMinor(amount, currency);
    if (!amountMinor) {
      setProblem("Enter an amount.");
      return;
    }
    setProblem(null);
    request.mutate(
      { direction, amountMinor, reason: reason.trim(), reference: reference.trim() || undefined },
      {
        onSuccess: () => {
          onDone?.();
          setAmount("");
          setReason("");
          setReference("");
        },
      },
    );
  }
  const result = request.data;
  return (
    <Paper className="px-6 py-6">
      <Stamp>{audience === "vendor" ? "Adjust balance" : "Adjust earnings"}</Stamp>
      <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <FormAlert message={problem ?? formError(request.error)} />
        {result ? (
          <p className="text-small text-success">
            {result.status === "APPLIED"
              ? `Applied: ${formatMoney(result.amountMinor, result.currency, locale)}.`
              : `${ADJUSTMENT_STATUS_DISPLAY[result.status].label}. A second person needs to approve it.`}
          </p>
        ) : null}
        <div role="group" aria-label="Direction" className="flex gap-2">
          {ADJUSTMENT_DIRECTIONS.map((value) => (
            <ChoiceChip key={value} tone={value === "CREDIT" ? "lime" : "pink"} selected={direction === value} onToggle={() => setDirection(value)}>
              {value === "CREDIT" ? "Credit" : "Charge"}
            </ChoiceChip>
          ))}
        </div>
        <MoneyField
          label="Amount"
          currency={currency}
          value={amount}
          onChange={setAmount}
          error={fieldError(request.error, "amountMinor")}
          hint="Large amounts wait for a second person to approve."
        />
        <Field label="Reason" hint={`At least 10 characters. The ${audience} sees this on their statement.`} error={fieldError(request.error, "reason")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} value={reason} maxLength={300} onChange={(event) => setReason(event.target.value)} className="min-h-[80px]" />
          )}
        </Field>
        <Field label="Reference (optional)" hint="A ticket or claim number.">
          {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={reference} maxLength={120} onChange={(event) => setReference(event.target.value)} />}
        </Field>
        <Button type="submit" variant="yellow" loading={request.isPending}>
          Submit adjustment
        </Button>
      </form>
    </Paper>
  );
}
