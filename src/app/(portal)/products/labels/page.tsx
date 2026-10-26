import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductLabelsPage } from "@/features/catalogue/product-labels-page";

export const metadata: Metadata = { title: "Product labels" };

export default function Page() {
  return (
    <Suspense>
      <ProductLabelsPage />
    </Suspense>
  );
}
