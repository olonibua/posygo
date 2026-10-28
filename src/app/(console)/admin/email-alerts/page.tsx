import type { Metadata } from "next";

import { EmailAlertsPage } from "@/features/staff/email-alerts-page";

export const metadata: Metadata = { title: "Email alerts" };

export default function Page() {
  return <EmailAlertsPage />;
}
