import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderCompletePage } from "@/features/storefront/shop/order-pages";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <OrderCompletePage />
    </Suspense>
  );
}
