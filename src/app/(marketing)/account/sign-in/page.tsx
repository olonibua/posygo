import type { Metadata } from "next";

import { BuyerLinkLanding } from "@/features/storefront/buyer/buyer-sign-in";

export const metadata: Metadata = { title: "Signing in", robots: { index: false }, referrer: "no-referrer" };

export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-[760px] px-4 py-20 sm:px-8">
      <BuyerLinkLanding />
    </main>
  );
}
