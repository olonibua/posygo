import type { Metadata } from "next";

import { AdminShoppingPage } from "@/features/shopping/admin-shopping-page";

export const metadata: Metadata = { title: "Personal shopping" };

export default function Page() {
  return <AdminShoppingPage />;
}
