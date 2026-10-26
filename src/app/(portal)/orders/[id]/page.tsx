import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderDetailPage } from "@/features/orders/order-detail-page";

export const metadata: Metadata = { title: "Order" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) {
    notFound();
  }
  return <OrderDetailPage orderId={id} />;
}
