import type { Metadata } from "next";

import { PartnerEarningsPage } from "@/features/partners/portal/partner-earnings-page";

export const metadata: Metadata = { title: "Earnings" };

export default function Page() {
  return <PartnerEarningsPage />;
}
