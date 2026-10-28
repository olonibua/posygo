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

import { useSandboxPayment, useWalletActivity } from "./use-vendor-wallet";

export function SandboxCheckoutPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const router = useRouter();
  const topUpId = useSearchParams().get("topUp") ?? "";
  const { topUps } = useWalletActivity();
  const pay = useSandboxPayment();
  const topUp = topUps.data?.find((candidate) => candidate.id === topUpId);

  if (!topUp) {
    return topUps.isPending ? <PageSkeleton /> : <p className="text-ink-soft">This payment isn&apos;t available.</p>;
  }
  return (
    <div className="flex max-w-[560px] flex-col gap-7">
      <PageHeader stamp="Test payment" title="Practice checkout" lead="This market is set up for testing, so no card is charged. In a live market this step happens on the card provider's page." />
      <NotebookNote tone="yellow" tilt="none">
        Test mode — no real money moves.
      </NotebookNote>
      <Paper className="px-6 py-6">
        <Stamp>Payment</Stamp>
        <dl className="mt-3 text-small">
          <div className="flex justify-between py-1.5">
            <dt className="text-ink-soft">Added to your wallet</dt>
            <dd className="tabular-nums">{formatMoney(topUp.netMinor, topUp.currency, locale)}</dd>
          </div>
          <div className="flex justify-between border-t border-line py-1.5 font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatMoney(topUp.grossMinor, topUp.currency, locale)}</dd>
          </div>
        </dl>
        <FormAlert message={errorMessage(pay.error)} />
        <div className="mt-5 flex justify-end gap-3">
          <ButtonLink href={`/wallet?topUp=${topUp.id}&cancelled=1`} variant="ghost">
            Cancel
          </ButtonLink>
          <Button variant="yellow" loading={pay.isPending} disabled={topUp.status !== "PENDING"} onClick={() => pay.mutate(topUp.id, { onSuccess: () => router.push(`/wallet?topUp=${topUp.id}`) })}>
            {topUp.status === "PENDING" ? "Complete test payment" : "Already paid"}
          </Button>
        </div>
      </Paper>
    </div>
  );
}
