import type { Metadata } from "next";

import { VendorsPage } from "@/features/vendors/vendors-page";

export const metadata: Metadata = { title: "Vendors" };

export default function Page() {
  return <VendorsPage />;
}
