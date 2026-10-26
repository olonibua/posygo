import type { Metadata } from "next";
import { Suspense } from "react";

import { SandboxCheckoutPage } from "@/features/finance/sandbox-checkout-page";

export const metadata: Metadata = { title: "Test payment" };

export default function Page() {
  return (
    <Suspense>
      <SandboxCheckoutPage />
    </Suspense>
  );
}
