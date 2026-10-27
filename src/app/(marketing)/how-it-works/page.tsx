import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { FaqSection, VENDOR_FAQ } from "@/features/marketing/faq";
import { PageIntro } from "@/features/marketing/page-intro";
import { HowItWorks, TrustBand, TrustStrip } from "@/features/marketing/sections";
import { BRAND } from "@/lib/brand";
import { publicPage } from "@/lib/site";
import { breadcrumbs, faqPage } from "@/lib/structured-data";

export const metadata = publicPage({
  title: "How local fulfilment works",
  description: "How Posygo works: choose a country, send your stock to a vetted local hub, sell as usual, and every order is packed, photographed and shipped with tracking.",
  path: "/how-it-works",
});

const STEPS = ["Choose the countries you sell to", "Send your stock to the hub", "Sell as usual", "Customers get their orders in days"];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          { "@type": "HowTo", name: `How to use ${BRAND.name} for local fulfilment`, step: STEPS.map((name, index) => ({ "@type": "HowToStep", position: index + 1, name })) },
          faqPage(VENDOR_FAQ),
          breadcrumbs([
            { name: BRAND.name, path: "/" },
            { name: "How it works", path: "/how-it-works" },
          ]),
        ]}
      />
      <main id="main" className="mx-auto max-w-container px-4 sm:px-8">
        <PageIntro stamp="How it works" title="Sell abroad without opening a warehouse">
          <p>Your stock sits at a vetted hub in your customers&apos; country. The hub counts it, packs each order and hands it to a local carrier, and you watch every step.</p>
          <div className="mt-8">
            <ButtonLink href="/signup">Get started →</ButtonLink>
          </div>
        </PageIntro>
        <TrustStrip />
        <HowItWorks />
        <TrustBand />
        <FaqSection items={VENDOR_FAQ} />
        <div className="pb-24" />
      </main>
      <MarketingFooter />
    </>
  );
}
