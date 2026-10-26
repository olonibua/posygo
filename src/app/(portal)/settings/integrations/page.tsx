import type { Metadata } from "next";

import { IntegrationsPage } from "@/features/orders/integrations-page";

export const metadata: Metadata = { title: "Integrations" };

export default function Page() {
  return <IntegrationsPage />;
}
