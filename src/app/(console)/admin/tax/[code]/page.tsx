import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaxCountryPage } from "@/features/tax/tax-country-page";

export const metadata: Metadata = { title: "Tax & compliance" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[A-Z]{2}$/.test(code)) {
    notFound();
  }
  return <TaxCountryPage code={code} />;
}
