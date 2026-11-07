import type { Metadata } from "next";

import { VendorAccountPage } from "@/features/onboarding/account/vendor-account-page";

export const metadata: Metadata = { title: "Account" };

export default function Page() {
  return <VendorAccountPage />;
}
