"use client";

import type { ActivationFeeView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { MoneyField } from "@/features/finance/money-field";
import { toMajorText, toMinor } from "@/features/finance/money-input";
import { formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

const FEE_KEY = ["admin", "activation-fee"];

export function ActivationFeeCard({ editable }: { editable: boolean }) {
  const fee = useQuery({ queryKey: FEE_KEY, queryFn: () => apiRequest<ActivationFeeView>("/v1/admin/activation-fee") });
  return (
    <Paper className="px-6 py-5">
      <Stamp>Activation fee · every seller</Stamp>
      <p className="mt-4 text-small text-ink-soft">
        A one-off fee each seller pays once, after they&apos;re verified and have accepted the agreement. It&apos;s the same for every seller whatever countries they sell in, and it isn&apos;t
        refundable. Zero means no fee, so sellers go live straight away. Changes apply to sellers who haven&apos;t paid yet.
      </p>
      {fee.data ? <ActivationFeeForm key={fee.data.feeMinor} fee={fee.data} editable={editable} /> : null}
    </Paper>
  );
}

function ActivationFeeForm({ fee, editable }: { fee: ActivationFeeView; editable: boolean }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(() => toMajorText(fee.feeMinor, fee.currency));
  const [problem, setProblem] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (activationFeeMinor: number) => apiRequest<ActivationFeeView>("/v1/admin/activation-fee", { method: "PUT", body: { activationFeeMinor } }),
    onSuccess: (saved) => {
      toast.success("Activation fee saved", "It applies to every seller.");
      queryClient.setQueryData(FEE_KEY, saved);
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const activationFeeMinor = toMinor(amount, fee.currency);
    setProblem(activationFeeMinor === null ? "Enter an amount, for example 10 or 9.50. Use 0 for no fee." : null);
    if (activationFeeMinor !== null) {
      save.mutate(activationFeeMinor);
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end justify-between gap-4">
      <FormAlert message={problem ?? formError(save.error)} />
      <div className="w-full max-w-[280px]">
        <MoneyField label="Activation fee" currency={fee.currency} value={amount} onChange={setAmount} hint="Zero means none." />
      </div>
      {editable ? (
        <Button type="submit" variant="lime" loading={save.isPending}>
          Save activation fee
        </Button>
      ) : null}
    </form>
  );
}
