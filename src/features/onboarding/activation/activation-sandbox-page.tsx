"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button, ButtonLink } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { useActivation, useSandboxActivation } from "./use-activation";

export function ActivationSandboxPage() {
  const user = useCurrentUser();
  const router = useRouter();
  const paymentId = useSearchParams().get("payment") ?? "";
  const activation = useActivation();
  const pay = useSandboxActivation();
  const payment = activation.data?.payment?.id === paymentId ? activation.data.payment : null;

  if (!payment) {
    return activation.isLoading ? <PageSkeleton /> : <p className="text-ink-soft">This payment isn&apos;t available.</p>;
  }
  const back = `/verification?activation=${payment.id}`;
  return (
    <div className="flex max-w-[560px] flex-col gap-7">
      <PageHeader stamp="Test payment" title="Practice checkout" lead="This market is set up for testing, so no card is charged. In a live market this step happens on the card provider's page." />
      <NotebookNote tone="yellow" tilt="none">
        Test mode — no real money moves.
      </NotebookNote>
      <Paper className="px-6 py-6">
        <Stamp>Payment</Stamp>
        <dl className="mt-3 text-small">
          <div className="flex justify-between py-1.5 font-semibold">
            <dt>Activation fee</dt>
            <dd className="tabular-nums">{formatMoney(payment.feeMinor, payment.currency, localeFor(user.countryCode))}</dd>
          </div>
        </dl>
        <FormAlert message={errorMessage(pay.error)} />
        <div className="mt-5 flex justify-end gap-3">
          <ButtonLink href={`${back}&cancelled=1`} variant="ghost">
            Cancel
          </ButtonLink>
          <Button variant="yellow" loading={pay.isPending} disabled={payment.status !== "PENDING"} onClick={() => pay.mutate(payment.id, { onSuccess: () => router.push(back) })}>
            {payment.status === "PENDING" ? "Complete test payment" : "Already paid"}
          </Button>
        </div>
      </Paper>
    </div>
  );
}
