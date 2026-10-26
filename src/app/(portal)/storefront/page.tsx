import type { Metadata } from "next";
import { Suspense } from "react";

import { VendorStorefrontPage } from "@/features/storefront/vendor/vendor-storefront-page";

export const metadata: Metadata = { title: "Your store" };

export default function Page() {
  return (
    <Suspense>
      <VendorStorefrontPage />
    </Suspense>
  );
}
