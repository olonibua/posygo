import type { Metadata } from "next";

import { ConsoleOverview } from "@/features/overview/console-overview";

export const metadata: Metadata = { title: "Platform console" };

export default function ConsoleHomePage() {
  return <ConsoleOverview />;
}
