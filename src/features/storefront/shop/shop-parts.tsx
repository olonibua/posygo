"use client";

import type { PublicProductView, StorefrontTone } from "@/shared";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { toneSurface } from "@/components/ui/tone";
import { apiAssetUrl } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { basket, useBasket } from "../basket-store";

export function ShopHeader({ slug, name }: { slug: string; name: string }) {
  const lines = useBasket(slug);
  const count = lines.reduce((total, line) => total + line.quantity, 0);
  return (
    <div className="mx-auto max-w-container px-4 sm:px-8">
      <nav aria-label="Store" className="flex h-[76px] items-center justify-between gap-4">
        <Link href={`/store/${slug}`} className="truncate text-[22px] font-semibold tracking-[-0.6px] text-ink no-underline">
          {name}
        </Link>
        <Link href={`/store/${slug}/checkout`} className="motion-press inline-flex items-center gap-2 rounded-chip bg-ink px-[18px] py-3 text-small font-medium text-on-ink no-underline">
          Basket
          <span key={count} className="motion-pop inline-flex min-w-6 justify-center rounded-full bg-yellow px-1.5 text-cocoa tabular-nums">
            {count}
          </span>
        </Link>
      </nav>
    </div>
  );
}

export function ShopFooter({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-container px-4 sm:px-8">
      <footer className="flex flex-col items-center justify-between gap-3 border-t border-line py-9 text-small text-ink-soft md:flex-row">
        <span>
          Sold by {name} ·{" "}
          <Link href="/account" className="text-ink-soft underline-offset-4 hover:underline">
            Your orders
          </Link>
        </span>
        <span className="inline-flex items-center gap-2">
          Packed and sent by <Logo size="sm" />
        </span>
      </footer>
    </div>
  );
}

export function ProductArt({ product, tone, className }: { product: Pick<PublicProductView, "imageUrl" | "name">; tone: StorefrontTone; className?: string }) {
  return (
    <div className={cn("relative flex aspect-square items-center justify-center overflow-hidden rounded-[12px]", toneSurface[tone], className)}>
      {product.imageUrl ? (
        <img src={apiAssetUrl(product.imageUrl)} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <img src="/brand/sticker-flower-cream.svg" alt="" aria-hidden className="w-1/3 opacity-90" />
      )}
    </div>
  );
}

export function ProductCard({ product, slug, locale, showStore = false }: { product: PublicProductView; slug: string; locale: string; showStore?: boolean }) {
  function add() {
    basket.add(slug, { productId: product.id, name: product.name, priceMinor: product.priceMinor });
    toast.success("Added to your basket", product.name);
  }
  return (
    <article className="motion-rise motion-lift flex h-full flex-col gap-3 rounded-tile border border-line bg-paper p-3">
      <ProductArt product={product} tone={product.store.tone} />
      <div className="flex flex-1 flex-col gap-1 px-1">
        {showStore ? (
          <Link href={`/store/${product.store.slug}`} className="text-meta font-normal text-ink-soft underline-offset-4 hover:underline">
            {product.store.displayName}
          </Link>
        ) : null}
        <h3 className="text-body font-medium">{product.name}</h3>
        {product.category ? <span className="text-meta font-normal text-ink-faint">{product.category}</span> : null}
        <p className="mt-auto pt-2 text-h3 tabular-nums">{formatMoney(product.priceMinor, product.currency, locale)}</p>
      </div>
      {showStore ? null : product.inStock ? (
        <Button variant="lime" className="w-full" onClick={add}>
          Add to basket
        </Button>
      ) : (
        <Chip tone="cocoa" className="justify-center py-2.5 text-small">
          Sold out
        </Chip>
      )}
    </article>
  );
}
