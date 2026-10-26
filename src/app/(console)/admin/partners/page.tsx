import type { Metadata } from "next";

import { PartnersPage } from "@/features/partners/admin/partners-page";

export const metadata: Metadata = { title: "Fulfilment partners" };

export default function Page() {
  return <PartnersPage />;
}
