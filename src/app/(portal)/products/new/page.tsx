import type { Metadata } from "next";

import { NewProductPage } from "@/features/catalogue/product-editor-page";

export const metadata: Metadata = { title: "Add a product" };

export default function Page() {
  return <NewProductPage />;
}
