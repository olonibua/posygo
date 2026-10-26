import type { Metadata } from "next";

import { AdminCountries } from "@/features/countries/admin-countries";

export const metadata: Metadata = { title: "Countries" };

export default function CountriesPage() {
  return <AdminCountries />;
}
