"use client";

import { useState } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { FeaturePanel } from "@/components/ui/surfaces";
import { ExplainerVideo } from "@/features/guide/explainer-video";
import { WhatsAppButton } from "@/features/marketing/whatsapp-button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { localeFor } from "@/lib/format";

import { ApiKeysSection } from "./api-keys-section";
import { type IntegrationRoute, IntegrationRoutes } from "./integration-routes";
import { hasStoreGuide, StoreGuide } from "./store-guide";
import { StoreConnectionsSection } from "./store-connections-section";

const VIDEO = { src: "/videos/connect-your-shop.mp4", poster: "/videos/connect-your-shop.jpg", label: "How to connect your shop to Posygo, a short video", stamp: "Connect your shop · 80 sec" };
const SETUP_HELP_MESSAGE = "Hi Posygo, please help me connect my online shop to Posygo.";

export function IntegrationsPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const [route, setRoute] = useState<IntegrationRoute>("SHOPIFY");

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Settings" title="Integrations" lead="Connect your online shop and every paid order lands in Posygo on its own, ready for the hub to pick, pack and ship." />
      <ExplainerVideo
        video={VIDEO}
        title="Sell on your website, we ship from abroad"
        body="See how orders from your Shopify, WooCommerce or own website reach the hub in seconds, and what to do if you'd rather we set it up for you."
      />
      <section className="flex flex-col gap-4">
        <h2 className="text-[22px] font-medium tracking-[-0.5px]">Where do you sell online?</h2>
        <IntegrationRoutes selected={route} onSelect={setRoute} />
      </section>
      {hasStoreGuide(route) ? <StoreGuide key={route} platform={route} /> : null}
      {route === "API" ? <ApiKeysSection locale={locale} /> : <StoreConnectionsSection key={route} platform={route} locale={locale} />}
      <FeaturePanel
        tone="cocoa"
        stamp="No developer? No problem"
        title="We'll set it up for you"
        action={
          <WhatsAppButton variant="yellow" message={SETUP_HELP_MESSAGE}>
            Ask us on WhatsApp
          </WhatsAppButton>
        }
      >
        Message us and we&rsquo;ll connect your shop with you on a quick call, at no extra cost. Works for Shopify and WooCommerce, and we&rsquo;ll find the right way in for other shop builders too.
      </FeaturePanel>
    </div>
  );
}
