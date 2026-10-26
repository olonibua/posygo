"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { CheckMark } from "@/components/ui/check-mark";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageSkeleton } from "@/components/ui/skeleton";
import { NotebookNote } from "@/components/ui/surfaces";
import { errorMessage } from "@/features/receiving/api-errors";
import { formatMoney, localeFor } from "@/lib/format";

import { basket } from "../basket-store";
import { useReceipt, useSandboxPayment } from "../use-storefront";
import { OrderReceipt as Receipt } from "./order-receipt";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="mx-auto flex max-w-[640px] flex-col gap-6 px-4 py-14 sm:px-8">
      {children}
    </main>
  );
}

export function SandboxPaymentPage() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get("order") ?? "";
  const id = params.get("id") ?? "";
  const receipt = useReceipt(UUID.test(id) ? id : "");
  const pay = useSandboxPayment();
  if (!UUID.test(id) || receipt.isError) {
    return (
      <Shell>
        <EmptyState title="This payment isn't available" body="It may have expired. Go back to the store and try again." />
      </Shell>
    );
  }
  if (!receipt.data) {
    return (
      <Shell>
        <PageSkeleton label="Opening payment" />
      </Shell>
    );
  }
  const waiting = receipt.data.status === "PENDING_PAYMENT";
  return (
    <Shell>
      <h1 className="motion-rise text-h1">Practice payment</h1>
      <NotebookNote tone="yellow" tilt="none">
        Test mode. No card is charged. In a live market this step happens on the card provider&apos;s secure page.
      </NotebookNote>
      <Receipt order={receipt.data} />
      <FormAlert message={errorMessage(pay.error)} />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          Go back
        </Button>
        <Button variant="yellow" size="lg" loading={pay.isPending} disabled={!waiting} onClick={() => pay.mutate(reference, { onSuccess: () => router.push(`/checkout/complete?order=${id}`) })}>
          {waiting ? `Pay ${formatMoney(receipt.data.totalMinor, receipt.data.currency, localeFor(receipt.data.destinationCountryCode))}` : "Already paid"}
        </Button>
      </div>
    </Shell>
  );
}

export function OrderCompletePage() {
  const id = useSearchParams().get("order") ?? "";
  const valid = UUID.test(id);
  const receipt = useReceipt(valid ? id : "");
  const paid = receipt.data && receipt.data.status !== "PENDING_PAYMENT" && receipt.data.status !== "PAYMENT_FAILED";
  const slugToClear = paid ? receipt.data?.storeSlug : undefined;

  useEffect(() => {
    if (slugToClear) {
      basket.clear(slugToClear);
    }
  }, [slugToClear]);

  if (!valid || receipt.isError) {
    return (
      <Shell>
        <EmptyState title="We couldn't find that order" body="Check the link in your receipt email." />
      </Shell>
    );
  }
  if (!receipt.data) {
    return (
      <Shell>
        <PageSkeleton label="Finding your order" />
      </Shell>
    );
  }
  return (
    <Shell>
      {paid ? (
        <div className="motion-rise flex flex-col items-start gap-3">
          <CheckMark />
          <h1 className="text-h1">Thank you, it&apos;s paid</h1>
          <p className="text-lead text-ink-soft">We&apos;re packing it now. Your receipt is on its way to your inbox, and we&apos;ll email tracking once it ships.</p>
        </div>
      ) : (
        <div className="motion-rise flex flex-col gap-3">
          <h1 className="text-h1">{receipt.data.status === "PAYMENT_FAILED" ? "Payment didn't go through" : "Confirming your payment…"}</h1>
          <p className="text-lead text-ink-soft">{receipt.data.status === "PAYMENT_FAILED" ? "You haven't been charged. Go back to the store to try again." : "This usually takes a few seconds."}</p>
        </div>
      )}
      <Receipt order={receipt.data} />
      <a href="/account" className="text-small underline underline-offset-4">
        See all your orders
      </a>
      {receipt.data.trackingNumber ? (
        <a href={`/track/${encodeURIComponent(receipt.data.trackingNumber)}`} className="text-small underline underline-offset-4">
          Track your parcel
        </a>
      ) : null}
    </Shell>
  );
}
