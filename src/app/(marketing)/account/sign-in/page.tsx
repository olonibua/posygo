import type { Metadata } from "next";

import { BuyerLinkLanding } from "@/features/storefront/buyer/buyer-sign-in";
import { requireFeature } from "@/lib/features";

export const metadata: Metadata = { title: "Signing in", robots: { index: false }, referrer: "no-referrer" };

export default function Page() {
  requireFeature("marketplace");
  return (
    <main id="main" className="mx-auto max-w-[760px] px-4 py-20 sm:px-8">
      <BuyerLinkLanding />
    </main>
  );
}
