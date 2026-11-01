import type { Metadata } from "next";
import { Suspense } from "react";

import { StopRemindersPage } from "@/features/reminders/stop-reminders-page";

export const metadata: Metadata = { title: "Stop reminder emails", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <StopRemindersPage />
    </Suspense>
  );
}
