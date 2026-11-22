import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ExplainerVideo } from "@/features/guide/explainer-video";

const VIDEO = { src: "/videos/connect-shopify.mp4", poster: "/videos/connect-shopify.jpg", label: "How to use the Posygo app in Shopify, a short video", stamp: "Shopify app · 80 sec" };
const GUIDE = { href: "/guides/posygo-shopify-guide.pdf", file: "posygo-shopify-guide.pdf" };

export function ShopifyAppGuide() {
  return (
    <ExplainerVideo
      video={VIDEO}
      title="Using the Posygo app in Shopify?"
      body="Connect once, request fulfilment on paid orders, and the hub ships them. Tracking goes back to Shopify and your customer gets the email."
      action={
        <a href={GUIDE.href} download={GUIDE.file} className={buttonClasses("ghost")}>
          <Icon name="download" />
          Download the step-by-step guide (PDF)
        </a>
      }
    />
  );
}
