import type { Metadata } from "next";

import { CountriesPage } from "@/features/seller-countries/countries-page";

export const metadata: Metadata = { title: "Countries" };

export default function Page() {
  return <CountriesPage />;
}
