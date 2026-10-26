import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinanceWalletPage } from "@/features/finance/finance-wallet-page";

export const metadata: Metadata = { title: "Wallet" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) {
    notFound();
  }
  return <FinanceWalletPage walletId={id} />;
}
