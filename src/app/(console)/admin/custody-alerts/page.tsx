import type { Metadata } from "next";

import { CustodyAlertsPage } from "@/features/custody/custody-alerts-page";

export const metadata: Metadata = { title: "Custody alerts" };

export default function Page() {
  return <CustodyAlertsPage />;
}
