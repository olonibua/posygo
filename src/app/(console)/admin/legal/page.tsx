import type { Metadata } from "next";

import { LegalDocumentsPage } from "@/features/review/legal-documents-page";

export const metadata: Metadata = { title: "Legal" };

export default function Page() {
  return <LegalDocumentsPage />;
}
