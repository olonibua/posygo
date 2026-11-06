import type { PartnerProgrammeView } from "@/shared";

import { Paper, Stamp } from "@/components/ui/surfaces";
import { percent } from "@/features/partners/partner-display";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";
import { formatMoney, localeFor } from "@/lib/format";

export function PartnerEarningsSchedule({ programme }: { programme: PartnerProgrammeView }) {
  const money = (minor: number) => formatMoney(minor, programme.currency, localeFor(programme.countryCode));
  const { perBox, perOrder } = programme.schedule;
  return (
    <div className="grid max-w-[880px] gap-4">
      <Paper className="px-6 py-5">
        <Stamp>Per box, in {programme.currency}</Stamp>
        <table className="mt-3 w-full text-small tabular-nums">
          <caption className="sr-only">What you earn per box size</caption>
          <thead>
            <tr className="text-left text-meta text-ink-faint">
              <th className="py-1.5 font-medium">Box size</th>
              <th className="py-1.5 text-right font-medium">When you receive it</th>
              <th className="py-1.5 text-right font-medium">Each month you store it</th>
            </tr>
          </thead>
          <tbody>
            {perBox.map((box) => (
              <tr key={box.tier} className="border-t border-line">
                <td className="py-2">
                  {STORAGE_TIER_LABELS[box.tier].label}
                  <span className="block text-meta text-ink-faint">{STORAGE_TIER_LABELS[box.tier].hint}</span>
                </td>
                <td className="py-2 text-right">{box.receivedMinor === null ? "Agreed per seller" : money(box.receivedMinor)}</td>
                <td className="py-2 text-right">{box.monthlyMinor === null ? "Agreed per seller" : money(box.monthlyMinor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
      <Paper className="px-6 py-5">
        <Stamp>Per order</Stamp>
        <dl className="mt-3 text-small">
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-ink-soft">Picking and packing an order</dt>
            <dd className="text-right tabular-nums">
              {money(perOrder.firstItemMinor)} + {money(perOrder.eachExtraItemMinor)} per extra item, up to {money(perOrder.maxMinor)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-ink-soft">Postage and packaging</dt>
            <dd className="text-right">Paid by the seller</dd>
          </div>
        </dl>
      </Paper>
      <Paper className="px-6 py-5">
        <Stamp>How you&apos;re paid</Stamp>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-small">
          <li>
            {percent(programme.holdbackBps)} of each earning is held for {programme.holdbackDays} days to cover any claim for lost stock, then released to you.
          </li>
          <li>You get a statement each month, and we pay it to your bank within 10 working days.</li>
          {programme.foundingBonusBps > 0 ? (
            <li>
              Founding partners keep an extra {percent(programme.foundingBonusBps)} of every fee the seller pays, so each rate above is higher
              {programme.foundingPlacesLeft > 0 ? ` (${programme.foundingPlacesLeft} ${programme.foundingPlacesLeft === 1 ? "place" : "places"} left)` : ""}.
            </li>
          ) : null}
          <li>No deposit and no insurance needed.</li>
          <li>You&apos;re self-employed, so you pay your own tax.</li>
        </ul>
      </Paper>
      <Paper className="px-6 py-5">
        <Stamp>Tiers</Stamp>
        <p className="mt-2 text-small text-ink-soft">Everyone starts on the first tier. Your limits rise as you build a clean record. The rates stay the same on every tier.</p>
        <table className="mt-3 w-full text-small tabular-nums">
          <caption className="sr-only">Partner tiers</caption>
          <thead>
            <tr className="text-left text-meta text-ink-faint">
              <th className="py-1.5 font-medium">Tier</th>
              <th className="py-1.5 text-right font-medium">Stock you can hold</th>
              <th className="py-1.5 text-right font-medium">Most valuable item</th>
              <th className="hidden py-1.5 text-right font-medium sm:table-cell">To reach it</th>
            </tr>
          </thead>
          <tbody>
            {programme.tiers.map((tier) => (
              <tr key={tier.level} className="border-t border-line">
                <td className="py-2">{tier.name}</td>
                <td className="py-2 text-right">{money(tier.maxStockValueMinor)}</td>
                <td className="py-2 text-right">{money(tier.maxItemValueMinor)}</td>
                <td className="hidden py-2 text-right text-ink-soft sm:table-cell">
                  {tier.minCleanOrders === 0 ? "On approval" : `${tier.minCleanOrders} clean orders, ${tier.minPassedCounts} stock counts, ${tier.minDaysActive} days`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
    </div>
  );
}
