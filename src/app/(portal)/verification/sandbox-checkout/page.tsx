import type { Metadata } from "next";
import { Suspense } from "react";

import { ActivationSandboxPage } from "@/features/onboarding/activation/activation-sandbox-page";

export const metadata: Metadata = { title: "Test payment" };

export default function Page() {
  return (
    <Suspense>
      <ActivationSandboxPage />
    </Suspense>
  );
}
