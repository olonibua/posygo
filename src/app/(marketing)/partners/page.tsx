import type { Metadata } from "next";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { Reveal } from "@/components/ui/reveal";
import { Stamp } from "@/components/ui/surfaces";
import { FaqSection } from "@/features/marketing/faq";
import { fetchPartnerProgrammes } from "@/features/marketing/live-countries";
import { PartnerApplicationForm } from "@/features/marketing/partner-application-form";
import { EarningsExamples, PARTNER_FAQ, PartnerBenefits, PartnerHero, VerificationSteps } from "@/features/marketing/partner-landing";

export const metadata: Metadata = { title: "Become a fulfilment partner", description: "Earn money from your spare room by storing stock and packing orders for our vendors." };

export default async function PartnersPage() {
  const programmes = await fetchPartnerProgrammes();
  return (
    <>
      <MarketingHeader />
      <main id="main">
        <PartnerHero />
        <div className="mx-auto max-w-container px-4 sm:px-8">
          <PartnerBenefits />
          <Reveal>
            <EarningsExamples programmes={programmes} />
          </Reveal>
          <Reveal>
            <VerificationSteps />
          </Reveal>
          <Reveal>
            <FaqSection items={PARTNER_FAQ} heading="Questions partners ask" />
          </Reveal>
          <section id="apply" className="scroll-mt-6 pb-24 pt-20 sm:pt-[100px]">
            <Stamp>Apply</Stamp>
            <h2 className="mb-8 mt-3.5 text-[40px] font-medium leading-[42px] tracking-[-1.6px] md:text-[52px] md:leading-[54px]">Become a fulfilment partner</h2>
            <PartnerApplicationForm programmes={programmes} />
          </section>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
