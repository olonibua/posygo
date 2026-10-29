"use client";

import { type CreateOrdersInput, type DeliveryInput, fulfilmentFee, type LotView, type ProductView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useRef, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { DraftStatus } from "@/components/ui/draft-status";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { PRODUCTS_KEY } from "@/features/catalogue/product-editor-page";
import { useVendorFees, useVendorWallet } from "@/features/finance/use-vendor-wallet";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { useCountryScope, useSelectedCountry } from "@/features/seller-countries/selected-country";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useFormDraft } from "@/lib/drafts/use-form-draft";
import { formatMoney, localeFor } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { type DeliveryDraft, DeliveryFields } from "./delivery-fields";
import { ShippingEstimate } from "./shipping-estimate";
import { usePlaceOrders } from "./use-vendor-orders";

const MAX_DELIVERIES = 20;

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function availableUnits(lots: readonly LotView[]): Map<string, number> {
  const units = new Map<string, number>();
  for (const lot of lots.filter((entry) => entry.condition === "SELLABLE")) {
    units.set(lot.productId, (units.get(lot.productId) ?? 0) + lot.quantityAvailable);
  }
  return units;
}

function toDelivery(delivery: DeliveryDraft): DeliveryInput {
  return {
    externalReference: optional(delivery.externalReference),
    recipient: {
      name: delivery.name.trim(),
      company: optional(delivery.company),
      line1: delivery.line1.trim(),
      line2: optional(delivery.line2),
      city: delivery.city.trim(),
      region: optional(delivery.region),
      postalCode: delivery.postalCode.trim().toUpperCase(),
      phone: optional(delivery.phone),
      email: optional(delivery.email),
    },
    lines: delivery.lines.filter((line) => line.productId).map((line) => ({ productId: line.productId, quantity: Number(line.quantity) || 0 })),
    deliveryPreference: delivery.deliveryPreference ?? "CHEAPEST",
    preferredService: delivery.preferredService,
  };
}

function toInput(deliveries: DeliveryDraft[]): CreateOrdersInput {
  return { deliveries: deliveries.map(toDelivery) };
}

export function NewOrderPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const router = useRouter();
  const counter = useRef(0);
  const newKey = () => `k${(counter.current += 1)}`;
  const { country } = useSelectedCountry();
  const { code, ready, path } = useCountryScope();
  const products = useQuery({ queryKey: [...PRODUCTS_KEY, "list", "ACTIVE"], queryFn: () => apiRequest<ProductView[]>("/v1/vendor/products?status=ACTIVE") });
  const lots = useQuery({ queryKey: ["vendor", "inventory", "lots", code], queryFn: () => apiRequest<LotView[]>(path("/v1/vendor/inventory/lots")), enabled: ready });
  const fees = useVendorFees();
  const wallet = useVendorWallet();
  const place = usePlaceOrders();
  const [deliveries, setDeliveries] = useState<DeliveryDraft[] | null>(null);
  const draftValues = useMemo(() => ({ deliveries: deliveries ?? [] }), [deliveries]);
  const draft = useFormDraft({
    key: code ? `order:new:${code.toLowerCase()}` : null,
    values: draftValues,
    onRestore: (restored) =>
      setDeliveries(restored.deliveries.length > 0 ? restored.deliveries.map((delivery) => ({ ...delivery, key: newKey(), lines: delivery.lines.map((line) => ({ ...line, key: newKey() })) })) : null),
  });

  const available = availableUnits(lots.data ?? []);
  const blank = (): DeliveryDraft => {
    return {
      key: newKey(),
      externalReference: "",
      name: "",
      company: "",
      line1: "",
      line2: "",
      city: "",
      region: "",
      postalCode: "",
      phone: "",
      email: "",
      lines: [{ key: newKey(), productId: "", quantity: "1" }],
    };
  };
  const current = deliveries ?? [blank()];
  const update = (index: number, next: DeliveryDraft) => setDeliveries(current.map((delivery, position) => (position === index ? next : delivery)));

  const unitsPer = current.map((delivery) => delivery.lines.reduce((total, line) => total + (line.productId ? Number(line.quantity) || 0 : 0), 0));
  const totalFee = fees.data ? unitsPer.reduce((total, units) => total + (units > 0 ? fulfilmentFee(fees.data.schedule, units) : 0), 0) : null;
  const currency = fees.data?.currency ?? wallet.data?.currency ?? "GBP";
  const short = totalFee !== null && wallet.data ? totalFee - wallet.data.balanceMinor : 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    place.mutate(toInput(current), {
      onSuccess: (created) => {
        void draft.clear();
        toast.success(created.length === 1 ? "Order placed" : `${created.length} orders placed`);
        router.push(created.length === 1 ? `/orders/${created[0]!.id}` : "/orders");
      },
    });
  }

  if (!country || products.isLoading || lots.isLoading) {
    return <PageSkeleton />;
  }
  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-7">
      <PageHeader
        stamp="Orders"
        title={`New order in ${country.name}`}
        lead={`Sent from your stock in ${country.name} to an address in ${country.name}. Sending to several people? Add a delivery for each; every one becomes its own order with its own tracking.`}
      />
      <DraftStatus draft={draft} locale={locale} />
      <FormAlert message={formError(place.error)} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          {current.map((delivery, index) => (
            <DeliveryFields
              key={delivery.key}
              index={index}
              delivery={delivery}
              country={country}
              products={products.data ?? []}
              available={available}
              errorFor={(field) => fieldError(place.error, field)}
              onChange={(next) => update(index, next)}
              onRemove={current.length > 1 ? () => setDeliveries(current.filter((_, position) => position !== index)) : undefined}
              newKey={newKey}
            >
              <ShippingEstimate
                delivery={toDelivery(delivery)}
                locale={locale}
                onChoose={(choice) => update(index, { ...delivery, ...choice })}
              />
            </DeliveryFields>
          ))}
          <div>
            <Button variant="ghost" disabled={current.length >= MAX_DELIVERIES} onClick={() => setDeliveries([...current, blank()])}>
              Add another delivery
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <Paper className="sticky top-6 px-6 py-6">
            <Stamp>Summary</Stamp>
            <dl className="mt-3 text-small">
              <div className="flex justify-between py-1">
                <dt className="text-ink-soft">Orders</dt>
                <dd className="tabular-nums">{current.length}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-ink-soft">Units</dt>
                <dd className="tabular-nums">{unitsPer.reduce((total, units) => total + units, 0)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold">
                <dt>Fulfilment, taken now</dt>
                <dd className="tabular-nums">{totalFee === null ? "—" : formatMoney(totalFee, currency, locale)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-meta text-ink-faint">Shipping is charged separately once the parcel is packed and weighed, at the carrier&rsquo;s price plus our handling.</p>
            {short > 0 ? (
              <div className="mt-4 flex flex-col gap-3 rounded-card bg-orange px-4 py-3 text-small text-cocoa">
                <p>Your wallet is {formatMoney(short, currency, locale)} short for the fulfilment fee.</p>
                <ButtonLink href="/wallet" variant="yellow">
                  Add funds
                </ButtonLink>
              </div>
            ) : null}
            <Button type="submit" variant="yellow" size="lg" className="mt-5 w-full" loading={place.isPending}>
              Place {current.length === 1 ? "order" : `${current.length} orders`}
            </Button>
          </Paper>
        </div>
      </div>
    </form>
  );
}
