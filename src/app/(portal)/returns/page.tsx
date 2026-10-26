import type { Metadata } from "next";
import { Suspense } from "react";

import { VendorReturnsPage } from "@/features/returns/vendor-returns-page";

export const metadata: Metadata = { title: "Returns" };

export default function Page() {
  return (
    <Suspense>
      <VendorReturnsPage />
    </Suspense>
  );
}
