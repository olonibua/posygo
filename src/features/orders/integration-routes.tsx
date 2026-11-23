import { cn } from "@/lib/cn";

import { type Tone, toneSurface } from "@/components/ui/tone";

export type IntegrationRoute = "SHOPIFY" | "WOOCOMMERCE" | "API";

const ROUTES: { id: IntegrationRoute; title: string; body: string; tone: Tone }[] = [
  { id: "SHOPIFY", title: "Shopify", body: "Install the Posygo app and paste an API key. About five minutes, no developer needed.", tone: "lime" },
  { id: "WOOCOMMERCE", title: "WooCommerce", body: "Install the Posygo Fulfilment plugin and paste an API key. About five minutes.", tone: "sky" },
  { id: "API", title: "Another website", body: "Built your own site or use another platform? Your developer sends orders to us with an API key.", tone: "yellow" },
];

export function IntegrationRoutes({ selected, onSelect }: { selected: IntegrationRoute; onSelect: (route: IntegrationRoute) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {ROUTES.map((route) => {
        const active = route.id === selected;
        return (
          <button
            key={route.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(route.id)}
            className={cn(
              "motion-press flex flex-col gap-1.5 rounded-tile border-[1.5px] px-5 py-4 text-left",
              active ? cn("border-transparent", toneSurface[route.tone]) : "border-line bg-paper hover:border-ink",
            )}
          >
            <span className="text-[19px] font-medium tracking-[-0.4px]">{route.title}</span>
            <span className={cn("text-small", active ? "opacity-85" : "text-ink-soft")}>{route.body}</span>
          </button>
        );
      })}
    </div>
  );
}
