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
  title: "How fast ecommerce fulfilment works",
  description: "How Posygo gets your products closer to your customers: send us your stock, sell as usual, and every order is packed, photographed and delivered in days with tracking.",
  path: "/how-it-works",
});

const STEPS = ["Choose the countries you sell to", "Send us your stock", "Sell as usual", "Customers get their orders in days"];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          { "@type": "HowTo", name: `How to get your products closer to your customers with ${BRAND.name}`, step: STEPS.map((name, index) => ({ "@type": "HowToStep", position: index + 1, name })) },
          faqPage(VENDOR_FAQ),
          breadcrumbs([
            { name: BRAND.name, path: "/" },
            { name: "How it works", path: "/how-it-works" },
          ]),
        ]}
      />
      <main id="main" className="mx-auto max-w-container px-4 sm:px-8">
        <PageIntro stamp="How it works" title="Sell abroad without opening a warehouse">
          <p>We keep your stock in your customers&apos; country. We count it, pack each order and deliver it in days, and you see every step.</p>
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
