import type { Metadata } from "next";

import { TaxOverviewPage } from "@/features/tax/tax-overview-page";

export const metadata: Metadata = { title: "Tax & compliance" };

export default function Page() {
  return <TaxOverviewPage />;
}
