import type { Metadata } from "next";

import { VerificationQueue } from "@/features/review/verification-queue";

export const metadata: Metadata = { title: "Verifications" };

export default function Page() {
  return <VerificationQueue />;
}
