import type { Metadata } from "next";

import { VendorOverview } from "@/features/overview/vendor-overview";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return <VendorOverview />;
}
