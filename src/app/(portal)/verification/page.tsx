import type { Metadata } from "next";

import { VerificationPage } from "@/features/onboarding/verification-page";

export const metadata: Metadata = { title: "Verification" };

export default function Page() {
  return <VerificationPage />;
}
