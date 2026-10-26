import { Field, Input } from "@/components/ui/form-controls";
import { MoneyField } from "@/features/finance/money-field";

import type { CustodyDraft } from "./partner-programme-draft";

const WHOLE_FIELDS: ReadonlyArray<{ key: Exclude<keyof CustodyDraft, "highValue">; label: string; hint: string }> = [
  { key: "cycleCountDays", label: "Routine count every (days)", hint: "Zero turns routine counts off." },
  { key: "lossAlertPct", label: "Loss alert (%)", hint: "Of the stock a hub has received." },
  { key: "trustFloor", label: "Pause hubs below (score)", hint: "Out of 100." },
  { key: "trustForPromotion", label: "Tier raise needs (score)", hint: "Out of 100." },
  { key: "noScanHours", label: "Alert after no carrier scan (hours)", hint: "From hand-off." },
];

export function CustodyRulesFields({ draft, currency, editable, onChange }: { draft: CustodyDraft; currency: string; editable: boolean; onChange: (patch: Partial<CustodyDraft>) => void }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-body font-semibold">Custody</legend>
      <div className="grid gap-4 md:grid-cols-3">
        {WHOLE_FIELDS.map((field) => (
          <Field key={field.key} label={field.label} hint={field.hint}>
            {({ id, describedBy }) => (
              <Input id={id} aria-describedby={describedBy} inputMode="decimal" disabled={!editable} value={draft[field.key]} onChange={(event) => onChange({ [field.key]: event.target.value })} />
            )}
          </Field>
        ))}
        <MoneyField label="Tamper seal from" currency={currency} value={draft.highValue} onChange={(highValue) => onChange({ highValue })} hint="Parcels worth this or more." />
      </div>
    </fieldset>
  );
}
