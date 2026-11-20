import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Paper, StepNumber } from "@/components/ui/surfaces";
import { africanBrandsPath, africanBrandsTitle } from "@/features/marketing/african-brands-copy";
import { FaqSection } from "@/features/marketing/faq";
import { loadLiveCountries } from "@/features/marketing/market-data";
import { PageIntro, PageSection } from "@/features/marketing/page-intro";
import { TrustStrip } from "@/features/marketing/sections";
import { STORE_PLATFORMS, type StorePlatformSlug, storePlatformPath } from "@/features/marketing/store-platforms";
import { BRAND } from "@/lib/brand";
import { PRIVATE_PAGE, publicPage } from "@/lib/site";
import { breadcrumbs, faqPage, fulfilmentService } from "@/lib/structured-data";

type Props = { params: Promise<{ platform: string }> };

function platformFor(slug: string) {
  return Object.hasOwn(STORE_PLATFORMS, slug) ? STORE_PLATFORMS[slug as StorePlatformSlug] : null;
}

export function generateStaticParams() {
  return Object.keys(STORE_PLATFORMS).map((platform) => ({ platform }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const platform = platformFor((await params).platform);
  if (!platform) {
    return { title: "Integrations", ...PRIVATE_PAGE };
  }
  return publicPage({ title: platform.title, description: platform.description, path: storePlatformPath(platform.slug) });
}

export default async function StorePlatformPage({ params }: Props) {
  const platform = platformFor((await params).platform);
  if (!platform) {
    notFound();
  }
  const countries = await loadLiveCountries();
  const path = storePlatformPath(platform.slug);
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          fulfilmentService(
            platform.title,
            platform.description,
            countries.map((country) => country.name),
            path,
          ),
          faqPage(platform.faq),
          breadcrumbs([
            { name: BRAND.name, path: "/" },
            { name: platform.name, path },
          ]),
        ]}
      />
      <main id="main" className="mx-auto max-w-container px-4 pb-24 sm:px-8">
        <PageIntro stamp={`${platform.name} integration`} title={platform.title}>
          <p>{platform.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/signup">Connect your {platform.name} store →</ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              Set it up with us
            </ButtonLink>
          </div>
        </PageIntro>
        <TrustStrip />
        <PageSection title={`How ${platform.name} orders reach ${BRAND.name}`}>
          <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {platform.steps.map((step, index) => (
              <li key={step.title}>
                <Paper className="flex h-full gap-4 px-6 py-5">
                  <span className="shrink-0">
                    <StepNumber value={index + 1} />
                  </span>
                  <div>
                    <h3 className="text-[20px] font-medium tracking-[-0.4px]">{step.title}</h3>
                    <p className="mt-1.5 text-small text-ink-soft">{step.body}</p>
                  </div>
                </Paper>
              </li>
            ))}
          </ol>
        </PageSection>
        {countries.length > 0 ? (
          <PageSection title="Countries your orders can be delivered in">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[17px]">
              {countries.map((country) => (
                <li key={country.code}>
                  <Link href={africanBrandsPath(country)}>{africanBrandsTitle(country)}</Link>
                </li>
              ))}
            </ul>
          </PageSection>
        ) : null}
        <FaqSection items={platform.faq} heading={`${platform.name} fulfilment: questions brands ask`} />
      </main>
      <MarketingFooter />
    </>
  );
}
