"use client";

import { activationFeeOf } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { MoneyField } from "@/features/finance/money-field";
import { toMajorText, toMinor } from "@/features/finance/money-input";
import { formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

import type { AdminCountry } from "./country-display";

export function ActivationFeeForm({ country, editable }: { country: AdminCountry; editable: boolean }) {
  const queryClient = useQueryClient();
  const [fee, setFee] = useState(() => toMajorText(activationFeeOf(country.config), country.currency));
  const [problem, setProblem] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (activationFeeMinor: number) => apiRequest(`/v1/admin/countries/${country.code}/activation-fee`, { method: "PUT", body: { activationFeeMinor } }),
    onSuccess: () => {
      toast.success("Activation fee saved", country.name);
      void queryClient.invalidateQueries({ queryKey: ["admin", "countries"] });
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const activationFeeMinor = toMinor(fee, country.currency);
    setProblem(activationFeeMinor === null ? "Enter an amount, for example 8 or 8.50. Use 0 for no fee." : null);
    if (activationFeeMinor !== null) {
      save.mutate(activationFeeMinor);
    }
  }

  return (
    <Paper className="px-6 py-5">
      <Stamp>Activation fee · {country.name}</Stamp>
      <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <p className="text-small text-ink-soft">
          A one-off fee vendors pay once they&apos;re verified and have accepted the agreement. We keep it and it isn&apos;t refundable. Zero means no fee, so vendors go live straight away. Changes
          apply to vendors who haven&apos;t paid yet, never to vendors who are already live.
        </p>
        <FormAlert message={problem ?? formError(save.error)} />
        <div className="max-w-[280px]">
          <MoneyField label="Activation fee" currency={country.currency} value={fee} onChange={setFee} hint="Zero means none." />
        </div>
        {editable ? (
          <div className="flex justify-end">
            <Button type="submit" variant="lime" loading={save.isPending}>
              Save activation fee
            </Button>
          </div>
        ) : null}
      </form>
    </Paper>
  );
}
