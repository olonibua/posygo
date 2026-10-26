"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { MoneyField } from "@/features/finance/money-field";
import { formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

import type { AdminCountry } from "./country-display";
import { CustodyRulesFields } from "./custody-rules-fields";
import { programmeDraft, programmeFrom, type TierDraft } from "./partner-programme-draft";

const TIER_COLUMNS: ReadonlyArray<{ key: keyof TierDraft; label: string; money?: boolean }> = [
  { key: "name", label: "Name" },
  { key: "maxStock", label: "Stock limit", money: true },
  { key: "maxItem", label: "Item limit", money: true },
  { key: "minCleanOrders", label: "Clean orders" },
  { key: "minPassedCounts", label: "Matched counts" },
  { key: "minDaysActive", label: "Days active" },
];

export function PartnerProgrammeForm({ country, editable }: { country: AdminCountry; editable: boolean }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => programmeDraft(country.config, country.currency));
  const [problem, setProblem] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (partners: unknown) => apiRequest(`/v1/admin/countries/${country.code}`, { method: "PATCH", body: { config: { ...country.config, partners } } }),
    onSuccess: () => {
      toast.success("Partner settings saved", country.name);
      void queryClient.invalidateQueries({ queryKey: ["admin", "countries"] });
    },
  });
  const set = (patch: Partial<typeof draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };
  const setTier = (index: number, patch: Partial<TierDraft>) => set({ tiers: draft.tiers.map((tier, position) => (position === index ? { ...tier, ...patch } : tier)) });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = programmeFrom(draft, country.currency);
    setProblem(result.ok ? null : result.message);
    if (result.ok) {
      save.mutate(result.programme);
    }
  }

  return (
    <Paper className="px-6 py-5">
      <Stamp>Partner programme · {country.name}</Stamp>
      <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-5">
        <FormAlert message={problem ?? formError(save.error)} />
        <Checkbox
          label="Take partner applications in this country"
          checked={draft.acceptingApplications}
          disabled={!editable}
          onChange={(event) => set({ acceptingApplications: event.target.checked })}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Tax reference name">{({ id }) => <Input id={id} disabled={!editable} value={draft.taxIdLabel} onChange={(event) => set({ taxIdLabel: event.target.value })} />}</Field>
          <Field label="Format (pattern)" hint="Optional. Checked when partners enter it.">
            {({ id, describedBy }) => (
              <Input id={id} aria-describedby={describedBy} className="font-mono" disabled={!editable} value={draft.taxIdPattern} onChange={(event) => set({ taxIdPattern: event.target.value })} />
            )}
          </Field>
          <div className="flex items-end pb-3">
            <Checkbox label="Required" checked={draft.taxIdRequired} disabled={!editable} onChange={(event) => set({ taxIdRequired: event.target.checked })} />
          </div>
        </div>
        <Field label="Work and tax declaration" hint="Partners tick this to confirm.">
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              className="min-h-[72px]"
              disabled={!editable}
              value={draft.workDeclaration}
              onChange={(event) => set({ workDeclaration: event.target.value })}
            />
          )}
        </Field>
        <div className="grid gap-4 md:grid-cols-4">
          <MoneyField
            label="Platform stock cover"
            currency={country.currency}
            value={draft.platformCover}
            onChange={(platformCover) => set({ platformCover })}
            hint="Shown to vendors as insured stock."
          />
          <MoneyField label="Deposit (optional)" currency={country.currency} value={draft.deposit} onChange={(deposit) => set({ deposit })} hint="Zero means none." />
          <MoneyField label="Own insurance (optional)" currency={country.currency} value={draft.insurance} onChange={(insurance) => set({ insurance })} hint="Zero means none." />
          <Field label="Keep proof of address (days)" hint="After the decision.">
            {({ id, describedBy }) => (
              <Input id={id} aria-describedby={describedBy} inputMode="numeric" disabled={!editable} value={draft.retentionDays} onChange={(event) => set({ retentionDays: event.target.value })} />
            )}
          </Field>
        </div>
        <Field label="Test vendor account ID" hint="The internal vendor used for test orders. Leave blank to turn test orders off.">
          {({ id, describedBy }) => (
            <Input id={id} aria-describedby={describedBy} className="font-mono" disabled={!editable} value={draft.mysteryVendorId} onChange={(event) => set({ mysteryVendorId: event.target.value })} />
          )}
        </Field>
        <CustodyRulesFields draft={draft.custody} currency={country.currency} editable={editable} onChange={(patch) => set({ custody: { ...draft.custody, ...patch } })} />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-body font-semibold">Tiers</legend>
          <p className="text-meta text-ink-faint">Partners start on tier 1 and move up once they meet the next tier&apos;s numbers with no recent problems.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-small">
              <thead>
                <tr className="text-left text-ink-faint">
                  {TIER_COLUMNS.map((column) => (
                    <th key={column.key} className="py-2 pr-2 font-normal">
                      {column.label}
                      {column.money ? ` (${country.currency})` : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draft.tiers.map((tier, index) => (
                  <tr key={index}>
                    {TIER_COLUMNS.map((column) => (
                      <td key={column.key} className="py-1 pr-2">
                        <Input
                          aria-label={`Tier ${index + 1} ${column.label}`}
                          disabled={!editable}
                          value={tier[column.key]}
                          onChange={(event) => setTier(index, { [column.key]: event.target.value })}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>
        {editable ? (
          <div className="flex justify-end">
            <Button type="submit" variant="lime" loading={save.isPending}>
              Save partner settings
            </Button>
          </div>
        ) : null}
      </form>
    </Paper>
  );
}
