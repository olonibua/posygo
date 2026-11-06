import type { Metadata } from "next";
import { Suspense } from "react";

import { PartnerAccountPage } from "@/features/partners/portal/partner-account-page";

export const metadata: Metadata = { title: "Account" };

export default function Page() {
  return (
    <Suspense>
      <PartnerAccountPage />
    </Suspense>
  );
}
