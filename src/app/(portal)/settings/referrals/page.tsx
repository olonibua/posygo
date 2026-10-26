import type { Metadata } from "next";

import { VendorReferralsPage } from "@/features/growth/vendor-referrals-page";

export const metadata: Metadata = { title: "Refer a business" };

export default function Page() {
  return <VendorReferralsPage />;
}
