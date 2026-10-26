import type { Metadata } from "next";
import { Suspense } from "react";

import { SandboxPaymentPage } from "@/features/storefront/shop/order-pages";

export const metadata: Metadata = { title: "Practice payment", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <SandboxPaymentPage />
    </Suspense>
  );
}
