import type { Metadata } from "next";

import { OrderQueuePage } from "@/features/fulfilment/order-queue-page";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return <OrderQueuePage />;
}
