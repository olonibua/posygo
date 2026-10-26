import type { Metadata } from "next";

import { InboundListPage } from "@/features/inbound/inbound-list-page";

export const metadata: Metadata = { title: "Inbound" };

export default function Page() {
  return <InboundListPage />;
}
