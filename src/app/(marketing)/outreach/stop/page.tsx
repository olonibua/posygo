import type { Metadata } from "next";
import { Suspense } from "react";

import { StopOutreachPage } from "@/features/outreach/stop-outreach-page";

export const metadata: Metadata = { title: "Stop partner emails", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <StopOutreachPage />
    </Suspense>
  );
}
