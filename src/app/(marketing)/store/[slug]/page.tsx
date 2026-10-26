import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { StorePage } from "@/features/storefront/shop/store-page";
import { storefrontSlugSchema } from "@/shared";

export const metadata: Metadata = { title: "Store" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!storefrontSlugSchema.safeParse(slug).success) {
    notFound();
  }
  return (
    <Suspense>
      <StorePage slug={slug} />
    </Suspense>
  );
}
