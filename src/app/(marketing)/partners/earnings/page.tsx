import Link from "next/link";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchPartnerProgrammes } from "@/features/marketing/live-countries";
import { PageIntro, PageSection } from "@/features/marketing/page-intro";
import { PartnerEarningsSchedule } from "@/features/marketing/partner-earnings-schedule";
import { BRAND } from "@/lib/brand";
import { publicPage } from "@/lib/site";
import { breadcrumbs } from "@/lib/structured-data";

export const metadata = publicPage({
  title: "Partner earnings schedule",
  description: "What Posygo fulfilment partners earn per box received, per box stored each month and per order packed, how earnings are paid, and the tier limits.",
  path: "/partners/earnings",
});

export default async function PartnerEarningsPage() {
  const programmes = await fetchPartnerProgrammes();
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={breadcrumbs([
          { name: BRAND.name, path: "/" },
          { name: "Become a partner", path: "/partners" },
          { name: "Earnings schedule", path: "/partners/earnings" },
        ])}
      />
      <main id="main" className="mx-auto max-w-container px-4 sm:px-8">
        <PageIntro stamp="Partners" title="Earnings schedule">
          <p>What you earn for each piece of work, in each country. This is the schedule your partner agreement refers to. We give 30 days&apos; notice before any rate goes down.</p>
          <p className="mt-4 text-small">
            <Link href="/partners#apply">Apply to become a partner</Link>
          </p>
        </PageIntro>
        {programmes.length === 0 ? <p className="mt-10 text-ink-soft">Rates appear here when we open partner places.</p> : null}
        {programmes.map((programme) => (
          <PageSection key={programme.countryCode} title={programme.countryName}>
            <PartnerEarningsSchedule programme={programme} />
          </PageSection>
        ))}
        <div className="pb-24" />
      </main>
      <MarketingFooter />
    </>
  );
}
