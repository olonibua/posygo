import type { Metadata } from "next";

import { ShoppingDeskPage } from "@/features/shopping/shopping-desk-page";

export const metadata: Metadata = { title: "Shopping parcels" };

export default function Page() {
  return <ShoppingDeskPage />;
}
