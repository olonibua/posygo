import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutPage } from "@/features/storefront/shop/checkout-page";
import { storefrontSlugSchema } from "@/shared";
import { requireFeature } from "@/lib/features";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  requireFeature("marketplace");
  const { slug } = await params;
  if (!storefrontSlugSchema.safeParse(slug).success) {
    notFound();
  }
  return <CheckoutPage slug={slug} />;
}
