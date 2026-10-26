import type { Metadata } from "next";

import { AdminClaimsPage } from "@/features/custody/admin-claims-page";

export const metadata: Metadata = { title: "Claims" };

export default function Page() {
  return <AdminClaimsPage />;
}
