import type { Metadata } from "next";

import { VendorClaimsPage } from "@/features/custody/vendor-claims-page";

export const metadata: Metadata = { title: "Claims" };

export default function Page() {
  return <VendorClaimsPage />;
}
