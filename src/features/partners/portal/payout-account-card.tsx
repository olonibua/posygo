"use client";

import type { PartnerDetailView } from "@/shared";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { errorMessage } from "@/features/receiving/api-errors";

import { PAYOUT_ACCOUNT_DISPLAY } from "../partner-display";
import { usePortalMutation } from "../use-partners";

export function PayoutAccountCard({ partner, disabled }: { partner: PartnerDetailView; disabled: boolean }) {
  const setup = usePortalMutation<void, { url: string }>(() => ({ path: "/v1/partner/payouts/setup" }));
  const refresh = usePortalMutation(() => ({ path: "/v1/partner/payouts/refresh" }));
  const account = partner.payoutAccount;
  const display = account ? PAYOUT_ACCOUNT_DISPLAY[account.status] : null;
  const open = () => setup.mutate(undefined, { onSuccess: (result) => window.location.assign(result.url) });

  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>Payouts</Stamp>
        {display ? <StatusPill tone={display.tone}>{display.label}</StatusPill> : <StatusPill tone="sky">To set up</StatusPill>}
      </div>
      {account?.bankSummary ? <p className="text-small font-medium">{account.bankSummary}</p> : null}
      <p className="text-small text-ink-soft">
        Bank details are held by our payment provider, not by us. If they change, payouts pause until we&apos;ve checked the change, and we email you straight away.
      </p>
      <FormAlert message={errorMessage(setup.error) ?? errorMessage(refresh.error)} />
      {disabled ? null : (
        <div className="flex flex-wrap justify-end gap-2">
          {account && account.status !== "ACTIVE" ? (
            <Button variant="ghost" loading={refresh.isPending} onClick={() => refresh.mutate(undefined)}>
              Check status
            </Button>
          ) : null}
          <Button variant={account?.status === "ACTIVE" ? "ghost" : "lime"} loading={setup.isPending} onClick={open}>
            {account ? (account.status === "ACTIVE" ? "Update bank details" : "Continue setup") : "Set up payouts"}
          </Button>
        </div>
      )}
    </Paper>
  );
}
