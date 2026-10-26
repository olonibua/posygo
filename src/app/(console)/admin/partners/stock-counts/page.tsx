import type { Metadata } from "next";

import { StockCountsPage } from "@/features/partners/admin/stock-counts-page";

export const metadata: Metadata = { title: "Stock counts" };

export default function Page() {
  return <StockCountsPage />;
}
