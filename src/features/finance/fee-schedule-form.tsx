"use client";

import { type FeeSchedule, STORAGE_TIERS, type StorageTier } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";
import { errorMessage } from "@/features/receiving/api-errors";

import { draftFrom, type FeeDraft, scheduleFrom, type TierDraft } from "./fee-draft";
import { FeeGrowthFields } from "./fee-growth-fields";
import { MoneyField } from "./money-field";
import { currencySymbol } from "./money-input";

interface FeeScheduleFormProps {
  base: FeeSchedule;
  currency: string;
  busy: boolean;
  error: unknown;
  onCancel: () => void;
  onPropose: (schedule: FeeSchedule, note: string) => void;
}

function Amount({ label, value, onChange, currency, disabled }: { label: string; value: string; onChange: (value: string) => void; currency: string; disabled?: boolean }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-meta text-ink-soft">
        {currencySymbol(currency)}
      </span>
      <Input
        inputMode="decimal"
        value={value}
        disabled={disabled}
        placeholder={disabled ? "Quote" : ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 pl-11 text-small tabular-nums"
      />
    </label>
  );
}

export function FeeScheduleForm({ base, currency, busy, error, onCancel, onPropose }: FeeScheduleFormProps) {
  const [draft, setDraft] = useState<FeeDraft>(() => draftFrom(base, currency));
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const set = (patch: Partial<FeeDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const percentField = (label: string, key: "partnerReceivingPercent" | "partnerStoragePercent" | "partnerFulfilmentPercent" | "partnerFoundingPercent", hint: string) => (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} inputMode="decimal" value={draft[key]} onChange={(event) => set({ [key]: event.target.value })} />}
    </Field>
  );
  const setTier = (tier: StorageTier, patch: Partial<TierDraft>) => setDraft((current) => ({ ...current, tiers: { ...current.tiers, [tier]: { ...current.tiers[tier], ...patch } } }));

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = scheduleFrom(draft, currency);
    if (!result.ok) {
      setProblem(result.message);
      return;
    }
    if (note.trim().length < 10) {
      setProblem("Explain the change in at least 10 characters.");
      return;
    }
    setProblem(null);
    onPropose(result.schedule, note.trim());
  }

  return (
    <Paper className="px-6 py-6">
      <Stamp>Propose new prices</Stamp>
      <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-6">
        <FormAlert message={problem ?? errorMessage(error)} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-separate border-spacing-y-2 text-small">
            <caption className="sr-only">Prices per box size</caption>
            <thead>
              <tr className="text-left text-meta text-ink-faint">
                <th className="font-medium">Box size</th>
                <th className="font-medium">Pricing</th>
                <th className="font-medium">Stocking</th>
                <th className="font-medium">First month</th>
                <th className="font-medium">Each month</th>
              </tr>
            </thead>
            <tbody>
              {STORAGE_TIERS.map((tier) => {
                const row = draft.tiers[tier];
                const label = STORAGE_TIER_LABELS[tier].label;
                return (
                  <tr key={tier}>
                    <th scope="row" className="pr-3 text-left font-medium">
                      {label}
                    </th>
                    <td className="pr-3">
                      <ChoiceChip tone="sky" selected={row.negotiated} onToggle={() => setTier(tier, { negotiated: !row.negotiated })}>
                        By quote
                      </ChoiceChip>
                    </td>
                    <td className="pr-3">
                      <Amount label={`${label} stocking`} currency={currency} value={row.stocking} disabled={row.negotiated} onChange={(stocking) => setTier(tier, { stocking })} />
                    </td>
                    <td className="pr-3">
                      <Amount label={`${label} first month`} currency={currency} value={row.firstMonth} disabled={row.negotiated} onChange={(firstMonth) => setTier(tier, { firstMonth })} />
                    </td>
                    <td>
                      <Amount label={`${label} each month`} currency={currency} value={row.monthly} onChange={(monthly) => setTier(tier, { monthly })} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-meta text-ink-faint">Leave “Each month” empty to price that size by quote.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <MoneyField label="Packing, first unit" currency={currency} value={draft.base} onChange={(base) => set({ base })} />
          <MoneyField label="Each extra unit" currency={currency} value={draft.perUnit} onChange={(perUnit) => set({ perUnit })} />
          <MoneyField label="Packing cap per order" currency={currency} value={draft.max} onChange={(max) => set({ max })} />
          <MoneyField label="Handling a return" currency={currency} value={draft.returns} onChange={(returns) => set({ returns })} />
          <Field label="Shipping markup" hint="Percent added to the carrier cost, up to 50.">
            {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} inputMode="decimal" value={draft.markupPercent} onChange={(event) => set({ markupPercent: event.target.value })} />}
          </Field>
          <div className="flex items-end pb-1">
            <ChoiceChip tone="lime" selected={draft.waiveFirstStocking} onToggle={() => set({ waiveFirstStocking: !draft.waiveFirstStocking })}>
              First shipment’s stocking is free
            </ChoiceChip>
          </div>
          <MoneyField
            label="Second approval above"
            currency={currency}
            value={draft.dualApprovalAbove}
            onChange={(dualApprovalAbove) => set({ dualApprovalAbove })}
            hint="Adjustments above this wait for another person."
          />
          <MoneyField label="Daily adjustment limit" currency={currency} value={draft.dailyCap} onChange={(dailyCap) => set({ dailyCap })} hint="Per person, per 24 hours." />
        </div>
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-body font-semibold">What partners earn</legend>
          <div className="grid gap-4 md:grid-cols-3">
            {percentField("Share of receiving", "partnerReceivingPercent", "Percent of the receiving fee the partner keeps.")}
            {percentField("Share of storage", "partnerStoragePercent", "Percent of monthly storage for stock in their hub.")}
            {percentField("Share of pick and pack", "partnerFulfilmentPercent", "Percent of the fulfilment fee. Postage and packaging stay at cost.")}
            {percentField("Founding partner bonus", "partnerFoundingPercent", "Extra percentage points for the first partners in the country, up to 30.")}
            <Field label="Founding places" hint="How many partners get the bonus.">
              {({ id, describedBy }) => (
                <Input id={id} aria-describedby={describedBy} inputMode="numeric" value={draft.partnerFoundingPlaces} onChange={(event) => set({ partnerFoundingPlaces: event.target.value })} />
              )}
            </Field>
            <Field label="Held back" hint="Percent of each earning kept to cover claims, up to 50.">
              {({ id, describedBy }) => (
                <Input id={id} aria-describedby={describedBy} inputMode="decimal" value={draft.partnerHoldbackPercent} onChange={(event) => set({ partnerHoldbackPercent: event.target.value })} />
              )}
            </Field>
            <Field label="Released after (days)" hint="Up to 365.">
              {({ id, describedBy }) => (
                <Input id={id} aria-describedby={describedBy} inputMode="numeric" value={draft.partnerHoldbackDays} onChange={(event) => set({ partnerHoldbackDays: event.target.value })} />
              )}
            </Field>
          </div>
        </fieldset>
        <FeeGrowthFields draft={draft} currency={currency} set={set} />
        <Field label="Why the change" hint="At least 10 characters. The approver sees this.">
          {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} className="min-h-[80px]" />}
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Back
          </Button>
          <Button type="submit" variant="yellow" loading={busy}>
            Send for approval
          </Button>
        </div>
      </form>
    </Paper>
  );
}
