import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { PageHeader } from "@/components/ui/page-header";
import { TrackingResult, TrackingSearch } from "@/features/tracking/tracking-view";

export const metadata: Metadata = { title: "Track a parcel", robots: { index: false } };

const TRACKING_NUMBER = /^[A-Za-z0-9-]{6,64}$/;

export default async function Page({ params }: { params: Promise<{ trackingNumber: string }> }) {
  const trackingNumber = decodeURIComponent((await params).trackingNumber);
  if (!TRACKING_NUMBER.test(trackingNumber)) {
    notFound();
  }
  return (
    <>
      <MarketingHeader />
      <main id="main" className="mx-auto flex max-w-[760px] flex-col gap-8 px-4 py-14 sm:px-8">
        <PageHeader stamp="Tracking" title={trackingNumber} />
        <TrackingResult trackingNumber={trackingNumber} />
        <TrackingSearch initial={trackingNumber} />
      </main>
      <MarketingFooter />
    </>
  );
}
