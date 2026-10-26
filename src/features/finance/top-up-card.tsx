"use client";

import { TOP_UP_LIMITS } from "@/shared";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { formatMoney } from "@/lib/format";

import { MoneyField } from "./money-field";
import { majorToMinor, toMinor } from "./money-input";
import { safeCheckoutUrl, useTopUp } from "./use-vendor-wallet";

const PRESETS = [100, 250, 500, 1000];

export function TopUpCard({ currency, locale, disabled }: { currency: string; locale: string; disabled: boolean }) {
  const [amount, setAmount] = useState("250");
  const [problem, setProblem] = useState<string | null>(null);
  const { quote, start } = useTopUp();
  const amountMinor = toMinor(amount, currency);
  const { mutate: requestQuote, reset: resetQuote } = quote;

  useEffect(() => {
    if (amountMinor === null || amountMinor === 0) {
      resetQuote();
      return;
    }
    const timer = window.setTimeout(() => requestQuote(amountMinor), 350);
    return () => window.clearTimeout(timer);
  }, [amountMinor, requestQuote, resetQuote]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setProblem(null);
    if (amountMinor === null || amountMinor === 0) {
      setProblem("Enter an amount, for example 250 or 250.50.");
      return;
    }
    start.mutate(amountMinor, {
      onSuccess: (started) => {
        const url = safeCheckoutUrl(started.redirectUrl);
        if (!url) {
          setProblem("We couldn't open the payment page. Try again.");
          return;
        }
        window.location.assign(url);
      },
    });
  }

  const shown = quote.data && amountMinor === quote.data.netMinor ? quote.data : null;
  const limits = `${formatMoney(majorToMinor(TOP_UP_LIMITS.minMajor, currency), currency, locale)} to ${formatMoney(majorToMinor(TOP_UP_LIMITS.maxMajor, currency), currency, locale)}`;
  return (
    <Paper className="px-6 py-6">
      <Stamp>Add funds</Stamp>
      <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <FormAlert message={problem ?? formError(start.error)} />
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <ChoiceChip key={preset} tone="yellow" selected={amount === String(preset)} onToggle={() => setAmount(String(preset))}>
              {formatMoney(majorToMinor(preset, currency), currency, locale)}
            </ChoiceChip>
          ))}
        </div>
        <MoneyField
          label="Amount to add"
          currency={currency}
          value={amount}
          onChange={setAmount}
          hint={`Between ${limits}.`}
          error={fieldError(start.error, "amountMinor") ?? fieldError(quote.error, "amountMinor")}
        />
        <dl className="rounded-card bg-paper-sunk px-4 py-3 text-small">
          <div className="flex justify-between py-1">
            <dt className="text-ink-soft">Added to your wallet</dt>
            <dd className="tabular-nums">{shown ? formatMoney(shown.netMinor, currency, locale) : "—"}</dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className="text-ink-soft">Card processing</dt>
            <dd className="tabular-nums">{shown ? formatMoney(shown.feeMinor, currency, locale) : "—"}</dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-line pt-2 font-semibold">
            <dt>You pay</dt>
            <dd className="tabular-nums">{shown ? formatMoney(shown.grossMinor, currency, locale) : "—"}</dd>
          </div>
        </dl>
        <Button type="submit" variant="yellow" loading={start.isPending} disabled={disabled || !shown}>
          Continue to payment
        </Button>
        <p className="text-meta text-ink-faint">You’ll pay on a secure card page. The amount shows in your wallet as soon as the payment clears.</p>
      </form>
    </Paper>
  );
}
