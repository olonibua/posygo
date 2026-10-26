import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VerificationCase } from "@/features/review/verification-case";

export const metadata: Metadata = { title: "Verification case" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default async function VerificationCasePage({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params;
  if (!UUID.test(vendorId)) {
    notFound();
  }
  return <VerificationCase vendorId={vendorId} />;
}
