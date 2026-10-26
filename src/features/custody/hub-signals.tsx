"use client";

import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { SkeletonLines } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";
import { formatDate, formatMoney, localeFor } from "@/lib/format";

import { useHubSignals } from "./use-custody";

export function HubSignals({ countryCode }: { countryCode: string | null }) {
  const hubs = useHubSignals();
  const locale = localeFor(countryCode);
  const holding = (hubs.data ?? []).filter((hub) => hub.units > 0);
  const open = (hubs.data ?? []).length - holding.length;
  return (
    <section aria-labelledby="hubs-heading" className="flex flex-col gap-3">
      <h2 id="hubs-heading" className="text-h3">
        Who holds your stock
      </h2>
      {!hubs.data ? (
        <SkeletonLines lines={2} />
      ) : (
        <>
          {holding.length === 0 ? <p className="text-small text-ink-soft">None of your stock has arrived at a hub yet.</p> : null}
          <ul className="stagger grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {holding.map((hub) => (
              <li key={hub.warehouseId} className="motion-rise">
                <Paper className="motion-lift flex h-full flex-col gap-2 px-5 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 font-medium">
                      <Icon name="storefront" />
                      {hub.warehouseName}
                    </span>
                    <Chip tone={hub.operator === "PLATFORM" ? "blue" : "teal"} size="sm" className="shrink-0 whitespace-nowrap">
                      {hub.operator === "PLATFORM" ? "Our warehouse" : `Partner hub${hub.tierName ? ` · ${hub.tierName}` : ""}`}
                    </Chip>
                  </div>
                  <p className="text-small">
                    <span className="font-semibold tabular-nums">{hub.units}</span> of your units here
                  </p>
                  <p className="text-meta font-normal text-ink-soft">
                    {hub.operator === "PLATFORM"
                      ? "Covered by our own insurance."
                      : `${hub.insuredCoverMinor > 0 ? `Insured up to ${formatMoney(hub.insuredCoverMinor, hub.currency, locale)}` : "Backed by our cover"} · ${
                          hub.lastCountedAt ? `last count matched ${formatDate(hub.lastCountedAt, locale)}` : "not counted yet"
                        }`}
                  </p>
                </Paper>
              </li>
            ))}
          </ul>
          {open > 0 ? <p className="text-meta font-normal text-ink-soft">{open === 1 ? "1 more hub" : `${open} more hubs`} in your market can take your next shipment.</p> : null}
        </>
      )}
    </section>
  );
}
