import type { Metadata } from "next";

import { MysteryOrdersPage } from "@/features/partners/admin/mystery-orders-page";

export const metadata: Metadata = { title: "Test orders" };

export default function Page() {
  return <MysteryOrdersPage />;
}
