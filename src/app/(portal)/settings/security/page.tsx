import type { Metadata } from "next";

import { SecuritySettings } from "@/features/security/security-settings";

export const metadata: Metadata = { title: "Security" };

export default function VendorSecurityPage() {
  return <SecuritySettings />;
}
