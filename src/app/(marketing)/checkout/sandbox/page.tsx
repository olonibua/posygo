import type { Metadata } from "next";
import { Suspense } from "react";

import { SandboxPaymentPage } from "@/features/storefront/shop/order-pages";
import { requireFeature } from "@/lib/features";

export const metadata: Metadata = { title: "Practice payment", robots: { index: false } };

export default function Page() {
  requireFeature("marketplace");
  return (
    <Suspense>
      <SandboxPaymentPage />
    </Suspense>
  );
}
