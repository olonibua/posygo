import type { Metadata } from "next";
import { Suspense } from "react";

import { ShoppingSandboxPage } from "@/features/shopping/shopping-sandbox-page";
import { requireFeature } from "@/lib/features";

export const metadata: Metadata = { title: "Practice payment", robots: { index: false } };

export default function Page() {
  requireFeature("personalShopping");
  return (
    <main id="main" className="mx-auto flex max-w-[640px] flex-col gap-6 px-4 py-14 sm:px-8">
      <Suspense>
        <ShoppingSandboxPage />
      </Suspense>
    </main>
  );
}
