import type { Metadata } from "next";

import { PartnerClaimsPage } from "@/features/custody/partner-claims-page";

export const metadata: Metadata = { title: "Claims" };

export default function Page() {
  return <PartnerClaimsPage />;
}
