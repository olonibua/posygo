import type { Metadata } from "next";

import { ImportPage } from "@/features/orders/import-page";

export const metadata: Metadata = { title: "Import orders" };

export default function Page() {
  return <ImportPage />;
}
