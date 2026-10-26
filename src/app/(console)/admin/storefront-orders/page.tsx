import type { Metadata } from "next";

import { AdminStoreOrdersPage } from "@/features/storefront/admin/admin-store-orders-page";

export const metadata: Metadata = { title: "Store orders" };

export default function Page() {
  return <AdminStoreOrdersPage />;
}
