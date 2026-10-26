import type { Metadata } from "next";
import { Suspense } from "react";

import { WalletPage } from "@/features/finance/wallet-page";

export const metadata: Metadata = { title: "Wallet" };

export default function Page() {
  return (
    <Suspense>
      <WalletPage />
    </Suspense>
  );
}
