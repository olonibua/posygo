import type { Metadata } from "next";

import { WarehousesPage } from "@/features/warehouses/warehouses-page";

export const metadata: Metadata = { title: "Warehouses" };

export default function Page() {
  return <WarehousesPage />;
}
