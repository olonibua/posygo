import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { findGuide, GUIDES } from "@/features/marketing/guides";
import { PageIntro } from "@/features/marketing/page-intro";
import { BRAND } from "@/lib/brand";
import { formatDate } from "@/lib/format";
import { publicPage } from "@/lib/site";
import { article, breadcrumbs } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = findGuide((await params).slug);
  return guide ? { ...publicPage({ title: guide.title, description: guide.description, path: `/guides/${guide.slug}` }), openGraph: { type: "article", modifiedTime: guide.updated } } : {};
}

export default async function GuidePage({ params }: Props) {
  const guide = findGuide((await params).slug);
  if (!guide) {
    notFound();
  }
  const path = `/guides/${guide.slug}`;
  return (
    <>
      <MarketingHeader />
      <JsonLd
        data={[
          article({ title: guide.title, description: guide.description, path, updated: guide.updated }),
          breadcrumbs([
            { name: BRAND.name, path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.title, path },
          ]),
        ]}
      />
      <main id="main" className="mx-auto max-w-[820px] px-4 pb-24 sm:px-8">
        <article>
          <PageIntro stamp="Guide" title={guide.title}>
            <p>{guide.description}</p>
            <p className="mt-3 text-small text-ink-faint">
              Updated <time dateTime={guide.updated}>{formatDate(guide.updated, "en-GB")}</time>
            </p>
          </PageIntro>
          {guide.sections.map((section) => (
            <section key={section.heading} className="pt-10">
              <h2 className="text-[28px] font-medium leading-[32px] tracking-[-0.9px]">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-[17px] leading-[27px]">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
        <nav aria-label="Related" className="mt-12 flex flex-wrap items-center gap-4 border-t border-line pt-8">
          {guide.related.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label} →
            </Link>
          ))}
          <ButtonLink href="/signup" className="ml-auto">
            Get started →
          </ButtonLink>
        </nav>
      </main>
      <MarketingFooter />
    </>
  );
}
