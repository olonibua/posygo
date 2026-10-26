import type { Metadata } from "next";

import { PartnerTeamPage } from "@/features/partners/portal/partner-team-page";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <PartnerTeamPage />;
}
