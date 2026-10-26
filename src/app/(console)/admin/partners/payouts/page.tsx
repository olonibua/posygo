import type { Metadata } from "next";

import { PartnerPayoutsPage } from "@/features/partners/admin/partner-payouts-page";

export const metadata: Metadata = { title: "Partner payouts" };

export default function Page() {
  return <PartnerPayoutsPage />;
}
