import type { Metadata } from "next";
import { Suspense } from "react";

import { VerificationPage } from "@/features/onboarding/verification-page";

export const metadata: Metadata = { title: "Verification" };

export default function Page() {
  return (
    <Suspense>
      <VerificationPage />
    </Suspense>
  );
}
