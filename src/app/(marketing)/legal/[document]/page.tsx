import type { LegalDocumentKind, LegalDocumentView, PublicCountry } from "@/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { PageHeader } from "@/components/ui/page-header";
import { Paper } from "@/components/ui/surfaces";
import { fetchLiveCountries } from "@/features/marketing/live-countries";
import { fetchPublic } from "@/lib/api/public-server";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { publicPage } from "@/lib/site";

const DOCUMENTS: Record<string, { kind: LegalDocumentKind; title: string; summary: string }> = {
  terms: { kind: "TERMS", title: "Terms of service", summary: "The terms that apply when you use Posygo, for each country we serve." },
  privacy: { kind: "PRIVACY", title: "Privacy policy", summary: "What personal information Posygo keeps, why, for how long and who it's shared with, for each country we serve." },
  "vendor-agreement": { kind: "VENDOR_AGREEMENT", title: "Vendor agreement", summary: "The agreement between Posygo and sellers who store stock with us, for each country we serve." },
};

export async function generateMetadata({ params }: { params: Promise<{ document: string }> }): Promise<Metadata> {
  const { document } = await params;
  const entry = DOCUMENTS[document];
  return entry ? publicPage({ title: entry.title, description: entry.summary, path: `/legal/${document}` }) : {};
}

function fetchDocument(countryCode: string, kind: LegalDocumentKind): Promise<LegalDocumentView | null> {
  return fetchPublic<LegalDocumentView>(`/v1/legal/${countryCode}/${kind}`);
}

export default async function LegalPage({ params, searchParams }: { params: Promise<{ document: string }>; searchParams: Promise<{ country?: string }> }) {
  const { document } = await params;
  const entry = DOCUMENTS[document];
  if (!entry) {
    notFound();
  }
  const countries: PublicCountry[] = await fetchLiveCountries();
  const requested = (await searchParams).country;
  const country = countries.find((item) => item.code === requested) ?? countries[0];
  const published = country ? await fetchDocument(country.code, entry.kind) : null;

  return (
    <>
      <MarketingHeader />
      <main id="main" className="mx-auto flex max-w-container flex-col gap-6 px-4 py-12 sm:px-8">
        <PageHeader
          stamp={published ? `Version ${published.version} · published ${formatDate(published.publishedAt, "en-GB")}` : "Legal"}
          title={published?.title ?? entry.title}
          lead={published ? undefined : "This document hasn't been published for this market yet."}
        />
        {countries.length > 1 ? (
          <nav aria-label="Market" className="flex flex-wrap gap-2">
            {countries.map((item) => (
              <Link
                key={item.code}
                href={`/legal/${document}?country=${item.code}`}
                className={cn(
                  "rounded-control border-[1.5px] px-3.5 py-2 text-small font-medium no-underline",
                  item.code === country?.code ? "border-cocoa bg-cocoa text-on-ink" : "border-line-strong bg-paper text-ink",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        ) : null}
        {published ? <Paper className="whitespace-pre-wrap px-6 py-6 text-body leading-[26px] text-ink-soft">{published.body}</Paper> : null}
      </main>
      <MarketingFooter />
    </>
  );
}
