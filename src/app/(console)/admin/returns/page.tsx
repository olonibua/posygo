import type { Metadata } from "next";

import { WarehouseReturnsPage } from "@/features/returns/warehouse-returns-page";

export const metadata: Metadata = { title: "Returns" };

export default function Page() {
  return <WarehouseReturnsPage />;
}
