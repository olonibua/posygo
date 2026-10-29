"use client";

import Link from "next/link";

import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { usePartnerStockSummary } from "../use-partners";

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function HubStockSummary() {
  const summary = usePartnerStockSummary();
  const stock = summary.data;
  if (!stock) {
    return null;
  }
  return (
    <section aria-labelledby="hub-stock-heading" className="flex flex-col gap-3">
      <h2 id="hub-stock-heading" className="text-h3">
        At your hub
      </h2>
      <StatTileGrid>
        <Link href="/admin/stock" className="no-underline">
          <StatTile tone="yellow" label="Units stored" value={stock.unitsStored} note={`${plural(stock.sellers, "seller", "sellers")} · ${plural(stock.products, "product", "products")}`} dots={["orange"]} />
        </Link>
        <Link href="/admin/stock" className="no-underline">
          <StatTile tone={stock.lotsWaitingToShelve > 0 ? "orange" : "lime"} label="Waiting to be put away" value={stock.lotsWaitingToShelve} note={stock.lotsWaitingToShelve > 0 ? "Put them on a shelf in Stock" : "Everything is on a shelf"} dots={["yellow"]} />
        </Link>
        <Link href="/admin/receiving" className="no-underline">
          <StatTile tone="pink" label="Shipments on the way" value={stock.shipmentsExpected} note="Sent by sellers, not yet arrived" dots={["lime"]} />
        </Link>
        <Link href="/admin/orders" className="no-underline">
          <StatTile tone="sky" label="Orders to pack" value={stock.ordersToPack} note={stock.ordersToShip > 0 ? `${stock.ordersToShip} more packed and waiting to ship` : "Nothing waiting to ship"} dots={["teal"]} />
        </Link>
      </StatTileGrid>
    </section>
  );
}
