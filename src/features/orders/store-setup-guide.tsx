import type { StorePlatform } from "@/shared";

import { Paper, Stamp, StepNumber } from "@/components/ui/surfaces";

const GUIDES: Record<StorePlatform, { stamp: string; steps: string[] }> = {
  SHOPIFY: {
    stamp: "Connect Shopify in 5 steps",
    steps: [
      "Give your shop a name below and press Connect. We'll give you a link.",
      "In your Shopify admin, open Settings → Notifications → Webhooks and press Create webhook.",
      "Choose the event Order payment, format JSON, paste the link as the URL and save.",
      "On the same Webhooks page, Shopify shows a key under “Your webhooks will be signed with”. Copy it and paste it into your connection here.",
      "Make sure every product's SKU in Shopify matches its Posygo product code, so we know what to pick.",
    ],
  },
  WOOCOMMERCE: {
    stamp: "Connect WooCommerce in 4 steps",
    steps: [
      "Give your shop a name below and press Connect. We'll give you a link and a secret — copy both.",
      "In WordPress, open WooCommerce → Settings → Advanced → Webhooks and press Add webhook.",
      "Set status Active, topic Order updated, paste the link as the delivery URL and the secret as the secret, then save.",
      "Make sure every product's SKU in WooCommerce matches its Posygo product code, so we know what to pick.",
    ],
  },
};

export function StoreSetupGuide({ platform }: { platform: StorePlatform }) {
  const guide = GUIDES[platform];
  return (
    <Paper className="px-6 py-5">
      <Stamp>{guide.stamp}</Stamp>
      <ol className="mt-4 flex flex-col gap-3.5">
        {guide.steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <StepNumber value={index + 1} />
            <span className="pt-1 text-small">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-meta text-ink-faint">
        Only paid orders come through. Each order arrives once, even if your shop sends it again, and lands in your Orders ready to fulfil from your stock.
      </p>
    </Paper>
  );
}
