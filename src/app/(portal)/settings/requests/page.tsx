import type { Metadata } from "next";

import { MyRequestsPage } from "@/features/support/my-requests-page";

export const metadata: Metadata = { title: "Help & requests" };

export default function Page() {
  return <MyRequestsPage />;
}
