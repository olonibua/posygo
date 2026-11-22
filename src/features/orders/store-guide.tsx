import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ExplainerVideo } from "@/features/guide/explainer-video";

type GuidedPlatform = "SHOPIFY" | "WOOCOMMERCE";

const GUIDES: Record<GuidedPlatform, { video: { src: string; poster: string; label: string; stamp: string }; title: string; body: string; pdf: string }> = {
  SHOPIFY: {
    video: { src: "/videos/connect-shopify.mp4", poster: "/videos/connect-shopify.jpg", label: "How to use the Posygo app in Shopify, a short video", stamp: "Shopify app · 80 sec" },
    title: "Using the Posygo app in Shopify?",
    body: "Connect once, request fulfilment on paid orders, and the hub ships them. Tracking goes back to Shopify and your customer gets the email.",
    pdf: "posygo-shopify-guide.pdf",
  },
  WOOCOMMERCE: {
    video: { src: "/videos/connect-woocommerce.mp4", poster: "/videos/connect-woocommerce.jpg", label: "How to use the Posygo plugin in WooCommerce, a short video", stamp: "WooCommerce plugin · 70 sec" },
    title: "Using the Posygo plugin in WooCommerce?",
    body: "Install the plugin, paste an API key and choose your hub country. Paid orders go to the hub on their own, and each order completes with tracking.",
    pdf: "posygo-woocommerce-guide.pdf",
  },
};

export function hasStoreGuide(platform: string): platform is GuidedPlatform {
  return platform in GUIDES;
}

export function StoreGuide({ platform }: { platform: GuidedPlatform }) {
  const guide = GUIDES[platform];
  return (
    <ExplainerVideo
      video={guide.video}
      title={guide.title}
      body={guide.body}
      action={
        <a href={`/guides/${guide.pdf}`} download={guide.pdf} className={buttonClasses("ghost")}>
          <Icon name="download" />
          Download the step-by-step guide (PDF)
        </a>
      }
    />
  );
}
