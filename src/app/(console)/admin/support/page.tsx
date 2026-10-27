import type { Metadata } from "next";

import { AdminSupportPage } from "@/features/support/admin-support-page";

export const metadata: Metadata = { title: "Support cases" };

export default function Page() {
  return <AdminSupportPage />;
}
