import type { Metadata } from "next";

import { AdminTransfersPage } from "@/features/custody/admin-transfers-page";

export const metadata: Metadata = { title: "Transfers" };

export default function Page() {
  return <AdminTransfersPage />;
}
