"use client";

import { type BoxGroupView, STORAGE_TIERS, type VendorBoxesView } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { Paper, Stamp } from "@/components/ui/surfaces";
import { useCountryScope } from "@/features/seller-countries/selected-country";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";
import { apiRequest } from "@/lib/api/client";
import { BRAND } from "@/lib/brand";
import { formatDate, formatMoney } from "@/lib/format";

const LOCALE = "en-GB";

function boxLine(group: BoxGroupView): string {
  const size = STORAGE_TIER_LABELS[group.tier].label.toLowerCase();
  const own = group.count - group.supplied;
  const parts = [own > 0 ? `${own} of your own` : null, group.supplied > 0 ? `${group.supplied} ${BRAND.name}` : null].filter(Boolean).join(" and ");
  return `${group.count} ${size} ${group.count === 1 ? "box" : "boxes"} (${parts})`;
}

export function StorageBoxes() {
  const { code, ready, path } = useCountryScope();
  const boxes = useQuery({ queryKey: ["vendor", "inventory", "boxes", code], queryFn: () => apiRequest<VendorBoxesView>(path("/v1/vendor/inventory/boxes")), enabled: ready });
  const data = boxes.data;
  if (!data) {
    return null;
  }
  return (
    <section aria-labelledby="boxes-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="boxes-heading" className="text-h3">
          Your storage boxes
        </h2>
        <p className="text-small text-ink-soft">
          {data.hubs.length > 0 ? `${formatMoney(data.monthlyMinor, data.currency, LOCALE)} a month in storage` : "Nothing in storage, so nothing to pay"}
        </p>
      </div>
      {data.hubs.length === 0 ? (
        <p className="text-small text-ink-soft">Boxes appear here once a hub receives your stock. When a box is empty we stop charging for it.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {data.hubs.map((hub) => (
            <Paper key={hub.warehouseId} className="px-6 py-5">
              <Stamp>{hub.warehouseName}</Stamp>
              <ul className="mt-3 flex flex-col gap-1 text-small">
                {STORAGE_TIERS.flatMap((tier) => hub.boxes.filter((group) => group.tier === tier)).map((group) => (
                  <li key={group.tier} className="flex justify-between gap-4">
                    <span>{boxLine(group)}</span>
                    <span className="shrink-0 tabular-nums text-ink-soft">{group.monthlyMinor === null ? "By quote" : formatMoney(group.monthlyMinor * group.count, data.currency, LOCALE)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-3 text-meta text-ink-faint">
                {hub.unitsStored} units stored · {formatMoney(hub.monthlyMinor, data.currency, LOCALE)} a month
                {hub.nextChargeOn ? ` · next charge ${formatDate(hub.nextChargeOn, LOCALE)}` : ""}
              </p>
            </Paper>
          ))}
        </div>
      )}
    </section>
  );
}
