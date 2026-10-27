"use client";

import { Field, Input } from "@/components/ui/form-controls";

import type { FeeDraft } from "./fee-draft";
import { MoneyField } from "./money-field";

type Key = "storeCommissionPercent" | "storeHoldHours" | "referralMonthlyCap" | "shoppingCommissionPercent";

export function FeeGrowthFields({ draft, currency, set }: { draft: FeeDraft; currency: string; set: (patch: Partial<FeeDraft>) => void }) {
  const plain = (label: string, key: Key, hint: string, inputMode: "decimal" | "numeric") => (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} inputMode={inputMode} value={draft[key]} onChange={(event) => set({ [key]: event.target.value })} />}
    </Field>
  );
  return (
    <>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-body font-semibold">Vendor stores</legend>
        <div className="grid gap-4 md:grid-cols-3">
          <MoneyField label="Set-up fee" currency={currency} value={draft.storeSetupFee} onChange={(storeSetupFee) => set({ storeSetupFee })} hint="Once, from the wallet, when a store opens." />
          {plain("Our commission (%)", "storeCommissionPercent", "Of each sale's goods, up to 30.", "decimal")}
          {plain("Shortest payout hold (hours)", "storeHoldHours", "After the parcel leaves, even if the store takes no returns. Up to 720.", "numeric")}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-body font-semibold">Referrals</legend>
        <div className="grid gap-4 md:grid-cols-3">
          <MoneyField
            label="Credit for the referrer"
            currency={currency}
            value={draft.referrerCredit}
            onChange={(referrerCredit) => set({ referrerCredit })}
            hint="Wallet credit once the new vendor's first stock arrives."
          />
          <MoneyField
            label="Credit for the new vendor"
            currency={currency}
            value={draft.refereeCredit}
            onChange={(refereeCredit) => set({ refereeCredit })}
            hint="Their welcome credit at the same moment."
          />
          {plain("Rewards per referrer each month", "referralMonthlyCap", "Above this, only the new vendor gets a credit. Up to 100.", "numeric")}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-body font-semibold">Personal shopping</legend>
        <div className="grid gap-4 md:grid-cols-3">
          {plain("Our fee (%)", "shoppingCommissionPercent", "Of the goods' price on each request, up to 50.", "decimal")}
          <MoneyField
            label="Smallest fee"
            currency={currency}
            value={draft.shoppingMinimumFee}
            onChange={(shoppingMinimumFee) => set({ shoppingMinimumFee })}
            hint="Charged instead when the percentage comes to less."
          />
        </div>
      </fieldset>
    </>
  );
}
