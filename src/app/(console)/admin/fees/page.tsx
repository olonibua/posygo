import type { Metadata } from "next";

import { FeeSchedulesPage } from "@/features/finance/fee-schedules-page";

export const metadata: Metadata = { title: "Prices" };

export default function Page() {
  return <FeeSchedulesPage />;
}
