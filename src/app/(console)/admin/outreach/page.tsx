import type { Metadata } from "next";

import { OutreachPage } from "@/features/outreach/outreach-page";

export const metadata: Metadata = { title: "Partner outreach" };

export default function Page() {
  return <OutreachPage />;
}
