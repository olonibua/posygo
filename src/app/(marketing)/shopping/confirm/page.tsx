import type { Metadata } from "next";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { ConfirmShoppingPage } from "@/features/shopping/confirm-page";

export const metadata: Metadata = { title: "Confirm your request", robots: { index: false } };

export default function Page() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="mx-auto max-w-[640px] px-4 py-14 sm:px-8">
        <ConfirmShoppingPage />
      </main>
      <MarketingFooter />
    </>
  );
}
