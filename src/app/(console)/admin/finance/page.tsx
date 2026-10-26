import type { Metadata } from "next";

import { FinanceWalletsPage } from "@/features/finance/finance-wallets-page";

export const metadata: Metadata = { title: "Wallets" };

export default function Page() {
  return <FinanceWalletsPage />;
}
