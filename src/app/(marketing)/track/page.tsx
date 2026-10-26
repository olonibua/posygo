import type { Metadata } from "next";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { PageHeader } from "@/components/ui/page-header";
import { TrackingSearch } from "@/features/tracking/tracking-view";

export const metadata: Metadata = { title: "Track a parcel" };

export default function Page() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="mx-auto flex max-w-[760px] flex-col gap-8 px-4 py-14 sm:px-8">
        <PageHeader stamp="Tracking" title="Where's my parcel?" lead="Enter the tracking number from your shipping email." />
        <TrackingSearch />
      </main>
      <MarketingFooter />
    </>
  );
}
