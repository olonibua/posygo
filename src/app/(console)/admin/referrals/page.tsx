import type { Metadata } from "next";

import { AdminReferralsPage } from "@/features/growth/admin-referrals-page";

export const metadata: Metadata = { title: "Referrals" };

export default function Page() {
  return <AdminReferralsPage />;
}
