import type { Metadata } from "next";

import { AdminStoreReturnsPage } from "@/features/storefront/admin/admin-store-returns-page";

export const metadata: Metadata = { title: "Store returns" };

export default function Page() {
  return <AdminStoreReturnsPage />;
}
