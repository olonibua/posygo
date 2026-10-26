import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditInboundPage } from "@/features/inbound/inbound-editor-page";

export const metadata: Metadata = { title: "Edit shipment" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) {
    notFound();
  }
  return <EditInboundPage inboundId={id} />;
}
