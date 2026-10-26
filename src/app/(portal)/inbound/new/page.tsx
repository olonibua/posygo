import type { Metadata } from "next";

import { NewInboundPage } from "@/features/inbound/inbound-editor-page";

export const metadata: Metadata = { title: "Send stock in" };

export default function Page() {
  return <NewInboundPage />;
}
