"use client";

import type { StorefrontSettingsView } from "@/shared";

import { Button, ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { CheckMark } from "@/components/ui/check-mark";
import { FormAlert } from "@/components/ui/form-controls";
import { FeaturePanel, Paper, Stamp } from "@/components/ui/surfaces";
import { errorMessage } from "@/features/receiving/api-errors";
import { formatMoney } from "@/lib/format";

import { usePayoutSetup, useStoreAction } from "../use-storefront";

const CHECKS = ["Choose your store name and address", "List at least one product with a price", "Connect a bank account for your sales"] as const;

export function StoreLaunchPanel({ settings, locale, editable }: { settings: StorefrontSettingsView; locale: string; editable: boolean }) {
  const goLive = useStoreAction("go-live", "Your store is live");
  const pause = useStoreAction("pause", "Your store is paused");
  const fee = formatMoney(settings.setupFeeMinor, settings.currency, locale);
  const live = settings.status === "LIVE";
  return (
    <FeaturePanel
      tone={live ? "lime" : settings.status === "PAUSED" ? "cocoa" : "sky"}
      stamp={live ? "Open for orders" : settings.status === "PAUSED" ? "Paused" : "Not open yet"}
      title={live && settings.slug ? `/store/${settings.slug}` : "Open your own store"}
      action={
        editable ? (
          live ? (
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/store/${settings.slug}`} variant="primary">
                View store
              </ButtonLink>
              <Button variant="ghost" loading={pause.isPending} onClick={() => pause.mutate(undefined)}>
                Pause
              </Button>
            </div>
          ) : (
            <Button variant="yellow" loading={goLive.isPending} disabled={settings.missing.length > 0} onClick={() => goLive.mutate(undefined)}>
              {settings.status === "PAUSED" ? "Reopen store" : "Open my store →"}
            </Button>
          )
        ) : null
      }
    >
      <ul className="mt-2 flex flex-col gap-1.5">
        {CHECKS.map((check) => {
          const done = !settings.missing.includes(check);
          return (
            <li key={check} className="flex items-center gap-2">
              <span
                className={
                  done ? "motion-pop inline-flex h-5 w-5 items-center justify-center rounded-full bg-cocoa text-on-ink" : "inline-flex h-5 w-5 rounded-full border-[1.5px] border-current opacity-60"
                }
              >
                {done ? <CheckMark className="h-3 w-3" /> : null}
              </span>
              {check}
            </li>
          );
        })}
      </ul>
      <p className="mt-3">
        {settings.setupFeePaid ? "Set-up fee paid." : `A one-time set-up fee of ${fee} comes from your wallet when you open.`} Buyers pay for delivery, and the usual fulfilment fee comes from your
        wallet for each order.
        {settings.commissionBps > 0 ? ` We keep ${settings.commissionBps / 100}% of each sale.` : ""}
      </p>
      <FormAlert message={errorMessage(goLive.error) ?? errorMessage(pause.error)} />
    </FeaturePanel>
  );
}

export function StorePayoutCard({ settings, editable }: { settings: StorefrontSettingsView; editable: boolean }) {
  const setup = usePayoutSetup();
  const refresh = useStoreAction("payouts/refresh", "Bank account checked");
  const account = settings.payoutAccount;
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>Sales payouts</Stamp>
        {account ? (
          <StatusPill tone={account.status === "ACTIVE" ? "lime" : account.status === "RESTRICTED" ? "pink" : "yellow"}>
            {account.status === "ACTIVE" ? "Connected" : account.status === "RESTRICTED" ? "Needs attention" : "In progress"}
          </StatusPill>
        ) : (
          <StatusPill tone="sky">To set up</StatusPill>
        )}
      </div>
      {account?.bankSummary ? <p className="text-small font-medium">{account.bankSummary}</p> : null}
      <p className="text-small text-ink-soft">
        Buyers pay us, and we send your share to this account once the return window for each order has passed. Your bank details stay with our payment provider.
      </p>
      <FormAlert message={errorMessage(setup.error) ?? errorMessage(refresh.error)} />
      {editable ? (
        <div className="flex flex-wrap justify-end gap-2">
          {account && account.status !== "ACTIVE" ? (
            <Button variant="ghost" loading={refresh.isPending} onClick={() => refresh.mutate(undefined)}>
              Check status
            </Button>
          ) : null}
          <Button
            variant={account?.status === "ACTIVE" ? "ghost" : "lime"}
            loading={setup.isPending}
            onClick={() => setup.mutate(undefined, { onSuccess: (result) => window.location.assign(result.url) })}
          >
            {account ? (account.status === "ACTIVE" ? "Change bank account" : "Continue setup") : "Connect bank account"}
          </Button>
        </div>
      ) : null}
    </Paper>
  );
}
