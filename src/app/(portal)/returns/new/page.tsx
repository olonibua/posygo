import type { Metadata } from "next";
import { Suspense } from "react";

import { NewReturnPage } from "@/features/returns/new-return-page";

export const metadata: Metadata = { title: "Start a return" };

export default function Page() {
  return (
    <Suspense>
      <NewReturnPage />
    </Suspense>
  );
}
