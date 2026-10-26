"use client";

import { type CreateOrdersInput, type DestinationPreferenceView, fulfilmentFee, type ProductView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { PRODUCTS_KEY } from "@/features/catalogue/product-editor-page";
import { useVendorFees, useVendorWallet } from "@/features/finance/use-vendor-wallet";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { type DeliveryDraft, DeliveryFields } from "./delivery-fields";
import { usePlaceOrders } from "./use-vendor-orders";

const MAX_DELIVERIES = 20;

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function toInput(deliveries: DeliveryDraft[]): CreateOrdersInput {
  return {
    deliveries: deliveries.map((delivery) => ({
      externalReference: optional(delivery.externalReference),
      recipient: {
        name: delivery.name.trim(),
        company: optional(delivery.company),
        line1: delivery.line1.trim(),
        line2: optional(delivery.line2),
        city: delivery.city.trim(),
        region: optional(delivery.region),
        postalCode: delivery.postalCode.trim().toUpperCase(),
        countryCode: delivery.countryCode,
        phone: optional(delivery.phone),
        email: optional(delivery.email),
      },
      lines: delivery.lines.filter((line) => line.productId).map((line) => ({ productId: line.productId, quantity: Number(line.quantity) || 0 })),
    })),
  };
}

export function NewOrderPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const router = useRouter();
  const counter = useRef(0);
  const newKey = () => `k${(counter.current += 1)}`;
  const markets = useQuery({ queryKey: ["vendor", "markets"], queryFn: () => apiRequest<DestinationPreferenceView[]>("/v1/vendor/markets") });
  const products = useQuery({ queryKey: [...PRODUCTS_KEY, "list", "ACTIVE"], queryFn: () => apiRequest<ProductView[]>("/v1/vendor/products?status=ACTIVE") });
  const fees = useVendorFees();
  const wallet = useVendorWallet();
  const place = usePlaceOrders();
  const [deliveries, setDeliveries] = useState<DeliveryDraft[] | null>(null);

  const destinations = markets.data ?? [];
  const blank = (): DeliveryDraft => {
    const preferred = destinations.find((destination) => destination.preferred) ?? destinations.find((destination) => destination.code === user.countryCode) ?? destinations[0];
    return {
      key: newKey(),
      externalReference: "",
      countryCode: preferred?.code ?? user.countryCode ?? "GB",
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
  const current = deliveries ?? (markets.data ? [blank()] : []);
  const update = (index: number, next: DeliveryDraft) => setDeliveries(current.map((delivery, position) => (position === index ? next : delivery)));

  const unitsPer = current.map((delivery) => delivery.lines.reduce((total, line) => total + (line.productId ? Number(line.quantity) || 0 : 0), 0));
  const totalFee = fees.data ? unitsPer.reduce((total, units) => total + (units > 0 ? fulfilmentFee(fees.data.schedule, units) : 0), 0) : null;
  const currency = fees.data?.currency ?? wallet.data?.currency ?? "GBP";
  const short = totalFee !== null && wallet.data ? totalFee - wallet.data.balanceMinor : 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    place.mutate(toInput(current), {
      onSuccess: (created) => {
        toast.success(created.length === 1 ? "Order placed" : `${created.length} orders placed`);
        router.push(created.length === 1 ? `/orders/${created[0]!.id}` : "/orders");
      },
    });
  }

  if (markets.isLoading || products.isLoading) {
    return <PageSkeleton />;
  }
  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-7">
      <PageHeader
        stamp="Orders"
        title="New order"
        lead="Add who it's going to and what to send. Sending to several people? Add a delivery for each; every one becomes its own order with its own tracking."
      />
      <FormAlert message={formError(place.error)} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          {current.map((delivery, index) => (
            <DeliveryFields
              key={delivery.key}
              index={index}
              delivery={delivery}
              destinations={destinations}
              products={products.data ?? []}
              errorFor={(field) => fieldError(place.error, field)}
              onChange={(next) => update(index, next)}
              onRemove={current.length > 1 ? () => setDeliveries(current.filter((_, position) => position !== index)) : undefined}
              newKey={newKey}
            />
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
