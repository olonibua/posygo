import type { Metadata } from "next";

import { HubTransfersPage } from "@/features/custody/hub-transfers-page";

export const metadata: Metadata = { title: "Hub transfers" };

export default function Page() {
  return <HubTransfersPage route="warehouse" />;
}
