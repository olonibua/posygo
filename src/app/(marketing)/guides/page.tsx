import Link from "next/link";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { Paper } from "@/components/ui/surfaces";
import { GUIDES } from "@/features/marketing/guides";
import { PageIntro } from "@/features/marketing/page-intro";
import { BRAND } from "@/lib/brand";
import { absoluteUrl, publicPage } from "@/lib/site";
import { breadcrumbs } from "@/lib/structured-data";

export const metadata = publicPage({
  title: "Guides to selling abroad and faster delivery",
  description: "Plain guides for online sellers: how to sell in another country without a warehouse, what fulfilment costs and how we keep your stock safe.",
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          {
            "@type": "ItemList",
            name: `${BRAND.name} guides`,
            itemListElement: GUIDES.map((guide, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteUrl(`/guides/${guide.slug}`), name: guide.title })),
          },
          breadcrumbs([
            { name: BRAND.name, path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
        ]}
      />
      <main id="main" className="mx-auto max-w-container px-4 pb-24 sm:px-8">
        <PageIntro stamp="Guides" title="Guides for selling abroad" />
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Paper className="motion-lift h-full px-6 py-6">
                <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.6px]">
                  <Link href={`/guides/${guide.slug}`} className="text-ink">
                    {guide.title}
                  </Link>
                </h2>
                <p className="mt-2 text-small text-ink-soft">{guide.description}</p>
              </Paper>
            </li>
          ))}
        </ul>
      </main>
      <MarketingFooter />
    </>
  );
}
