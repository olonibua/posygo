"use client";

import { hasPermission } from "@/shared";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { localeFor } from "@/lib/format";

import { ReturnCases } from "../returns/return-cases";
import { useStoreReturns } from "../use-store-returns";
import { useStoreAction, useStorefrontSettings, useVendorStoreOrders } from "../use-storefront";
import { DiscountCodesPanel } from "./discount-codes-panel";
import { ListingsTable } from "./listings-table";
import { StoreLaunchPanel, StorePayoutCard } from "./store-launch-panel";
import { StoreOrdersTable } from "./store-orders-table";
import { StoreSettingsForm } from "./store-settings-form";

function useReturnFromBank() {
  const params = useSearchParams();
  const refresh = useStoreAction("payouts/refresh", "Bank account checked");
  const handled = useRef(false);
  useEffect(() => {
    if (!handled.current && params.get("payouts") === "returned") {
      handled.current = true;
      refresh.mutate(undefined);
    }
  }, [params, refresh]);
}

export function VendorStorefrontPage() {
  const user = useCurrentUser();
  const settings = useStorefrontSettings();
  const orders = useVendorStoreOrders();
  const returns = useStoreReturns("vendor");
  const editable = hasPermission(user.role, "vendor.storefront.manage");
  const locale = localeFor(user.countryCode);
  useReturnFromBank();
  if (!settings.data) {
    return settings.isError ? <p className="text-ink-soft">{"We couldn't load your store. Try again shortly."}</p> : <PageSkeleton />;
  }
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Sell"
        title="Your store"
        lead="Sell straight to buyers from the stock we hold for you. They pay you, we pack and send it, and your share reaches your bank once the return window closes."
      />
      <StoreLaunchPanel settings={settings.data} locale={locale} editable={editable} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <StoreSettingsForm key={settings.data.slug ?? "new"} settings={settings.data} editable={editable} />
        <StorePayoutCard settings={settings.data} editable={editable} />
      </div>
      <ListingsTable currency={settings.data.currency} editable={editable} />
      <section aria-labelledby="store-orders-heading" className="flex flex-col gap-3">
        <h2 id="store-orders-heading" className="text-h3">
          Store orders
        </h2>
        <StoreOrdersTable orders={orders.data ?? []} loading={orders.isLoading} locale={locale} audience="VENDOR" />
      </section>
      <section aria-labelledby="store-returns-heading" className="flex flex-col gap-3">
        <h2 id="store-returns-heading" className="text-h3">
          Returns
        </h2>
        <ReturnCases cases={returns.data ?? []} loading={returns.isLoading} audience="vendor" canDecide={editable} />
      </section>
      <DiscountCodesPanel currency={settings.data.currency} locale={locale} editable={editable} />
    </div>
  );
}
