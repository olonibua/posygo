"use client";

import { HOLD_CHARGE_LIMITS } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/form-controls";
import { NotebookNote } from "@/components/ui/surfaces";
import { MoneyField } from "@/features/finance/money-field";
import { toMinor } from "@/features/finance/money-input";

interface ReasonFormProps {
  title: string;
  onSubmit: (reason: string, chargeMinor?: number) => void;
  onCancel: () => void;
  busy: boolean;
  chargeCurrency?: string;
}

export function ReasonForm({ title, onSubmit, onCancel, busy, chargeCurrency }: ReasonFormProps) {
  const [reason, setReason] = useState("");
  const [charge, setCharge] = useState("");
  const tooShort = reason.trim().length < 10;
  const chargeMinor = chargeCurrency && charge.trim() !== "" ? toMinor(charge, chargeCurrency) : undefined;
  const chargeInvalid = chargeMinor === null || (chargeMinor !== undefined && chargeMinor > 0 && (chargeMinor < HOLD_CHARGE_LIMITS.minMinor || chargeMinor > HOLD_CHARGE_LIMITS.maxMinor));
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!tooShort && !chargeInvalid) {
      onSubmit(reason.trim(), chargeMinor || undefined);
    }
  }
  return (
    <NotebookNote tone="yellow" tilt="none">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-[20px] font-medium tracking-[-0.4px]">{title}</p>
        <Field label="Reason the vendor will see" hint="At least 10 characters.">
          {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={reason} maxLength={1000} onChange={(event) => setReason(event.target.value)} className="min-h-[90px]" />}
        </Field>
        {chargeCurrency ? (
          <MoneyField
            label="Charge for the extra work (optional)"
            currency={chargeCurrency}
            value={charge}
            onChange={setCharge}
            hint="The vendor pays this from their wallet before you carry on. Leave empty for no charge."
            error={chargeInvalid ? "Enter a valid amount, or leave it empty." : undefined}
          />
        ) : null}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Back
          </Button>
          <Button type="submit" loading={busy} disabled={tooShort || chargeInvalid}>
            Confirm
          </Button>
        </div>
      </form>
    </NotebookNote>
  );
}
