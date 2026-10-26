import type { Metadata } from "next";
import { Suspense } from "react";

import { PartnershipPage } from "@/features/partners/portal/partnership-page";

export const metadata: Metadata = { title: "Partnership" };

export default function Page() {
  return (
    <Suspense>
      <PartnershipPage />
    </Suspense>
  );
}
