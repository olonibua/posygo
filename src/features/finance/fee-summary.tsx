"use client";

import { STORAGE_TIERS, type VendorFeeSchedule } from "@/shared";

import { Paper, Stamp } from "@/components/ui/surfaces";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";
import { formatMoney } from "@/lib/format";

export function FeeSummary({ schedule, currency, locale, title = "Your prices" }: { schedule: VendorFeeSchedule; currency: string; locale: string; title?: string }) {
  const money = (minor: number) => formatMoney(minor, currency, locale);
  const onboarding = (tier: (typeof STORAGE_TIERS)[number]) => {
    const rate = schedule.onboarding[tier];
    return rate.negotiated ? "By quote" : `${money(rate.stockingMinor)} + ${money(rate.firstMonthStorageMinor)}`;
  };
  return (
    <Paper className="px-6 py-5">
      <Stamp>{title}</Stamp>
      <table className="mt-3 w-full text-small tabular-nums">
        <caption className="sr-only">Prices per box size</caption>
        <thead>
          <tr className="text-left text-meta text-ink-faint">
            <th className="py-1.5 font-medium">Box size</th>
            <th className="py-1.5 text-right font-medium">On arrival</th>
            <th className="py-1.5 text-right font-medium">Each month</th>
          </tr>
        </thead>
        <tbody>
          {STORAGE_TIERS.map((tier) => (
            <tr key={tier} className="border-t border-line">
              <td className="py-2">{STORAGE_TIER_LABELS[tier].label}</td>
              <td className="py-2 text-right">{onboarding(tier)}</td>
              <td className="py-2 text-right">{schedule.monthlyStorage[tier] === null ? "By quote" : money(schedule.monthlyStorage[tier])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-4 border-t border-line pt-3 text-small">
        <div className="flex justify-between py-1">
          <dt className="text-ink-soft">Packing an order</dt>
          <dd className="tabular-nums">
            {money(schedule.fulfilment.baseMinor)} + {money(schedule.fulfilment.perAdditionalUnitMinor)} per extra unit, up to {money(schedule.fulfilment.maxMinor)}
          </dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-ink-soft">Handling a return</dt>
          <dd className="tabular-nums">{money(schedule.returnsHandlingMinor)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-ink-soft">Shipping</dt>
          <dd className="tabular-nums">Carrier cost + {schedule.shippingMarkupBps / 100}%</dd>
        </div>
      </dl>
      <p className="mt-3 text-meta text-ink-faint">
        “On arrival” is a one-off stocking fee plus the first month of storage.
        {schedule.firstShipmentWaivesStocking ? " Your first shipment's stocking fee is on us." : ""}
      </p>
    </Paper>
  );
}
