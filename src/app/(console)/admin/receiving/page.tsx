import type { Metadata } from "next";

import { ReceivingQueue } from "@/features/receiving/receiving-queue";

export const metadata: Metadata = { title: "Receiving" };

export default function Page() {
  return <ReceivingQueue />;
}
