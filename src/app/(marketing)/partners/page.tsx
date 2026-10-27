import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/ui/reveal";
import { Stamp } from "@/components/ui/surfaces";
import { FaqSection } from "@/features/marketing/faq";
import { fetchPartnerProgrammes } from "@/features/marketing/live-countries";
import { PartnerApplicationForm } from "@/features/marketing/partner-application-form";
import { EarningsExamples, PARTNER_FAQ, PartnerBenefits, PartnerHero, VerificationSteps } from "@/features/marketing/partner-landing";
import { publicPage } from "@/lib/site";
import { breadcrumbs, faqPage } from "@/lib/structured-data";

export const metadata = publicPage({
  title: "Become a fulfilment partner: earn from spare space",
  description: "Earn money from a spare room or unit by receiving, storing and packing orders for online sellers near you. Vetted, insured and paid per task, with no upfront cost.",
  path: "/partners",
});

export default async function PartnersPage() {
  const programmes = await fetchPartnerProgrammes();
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          faqPage(PARTNER_FAQ),
          breadcrumbs([
            { name: "Posygo", path: "/" },
            { name: "Become a partner", path: "/partners" },
          ]),
        ]}
      />
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
