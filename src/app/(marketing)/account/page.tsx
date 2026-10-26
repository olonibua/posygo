import type { Metadata } from "next";
import { Suspense } from "react";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { BuyerAccountPage } from "@/features/storefront/buyer/buyer-account-page";

export const metadata: Metadata = { title: "Your orders", robots: { index: false } };

export default function Page() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="mx-auto max-w-[760px] px-4 py-14 sm:px-8">
        <Suspense>
          <BuyerAccountPage />
        </Suspense>
      </main>
      <MarketingFooter />
    </>
  );
}
