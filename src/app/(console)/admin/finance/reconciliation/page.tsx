import type { Metadata } from "next";

import { ReconciliationPage } from "@/features/finance/reconciliation-page";

export const metadata: Metadata = { title: "Reconciliation" };

export default function Page() {
  return <ReconciliationPage />;
}
