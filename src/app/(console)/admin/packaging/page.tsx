import type { Metadata } from "next";

import { PackagingPage } from "@/features/fulfilment/packaging-page";

export const metadata: Metadata = { title: "Packaging" };

export default function Page() {
  return <PackagingPage />;
}
