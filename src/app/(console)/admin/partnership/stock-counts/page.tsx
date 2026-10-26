import type { Metadata } from "next";

import { HubStockCountsPage } from "@/features/partners/portal/hub-stock-counts-page";

export const metadata: Metadata = { title: "Stock counts" };

export default function Page() {
  return <HubStockCountsPage />;
}
