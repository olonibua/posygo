import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderCompletePage } from "@/features/storefront/shop/order-pages";
import { requireFeature } from "@/lib/features";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default function Page() {
  requireFeature("marketplace");
  return (
    <Suspense>
      <OrderCompletePage />
    </Suspense>
  );
}
