"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageSkeleton } from "@/components/ui/skeleton";
import { NotebookNote } from "@/components/ui/surfaces";
import { errorMessage } from "@/features/receiving/api-errors";
import { formatMoney, localeFor } from "@/lib/format";

import { ShoppingCard } from "./shopping-card";
import { useBuyerShoppingRequest, useShoppingSandboxPayment } from "./use-shopping";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ShoppingSandboxPage() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get("order") ?? "";
  const id = params.get("id") ?? "";
  const request = useBuyerShoppingRequest(UUID.test(id) ? id : "");
  const pay = useShoppingSandboxPayment();
  if (!UUID.test(id) || request.isError) {
    return <EmptyState title="This payment isn't available" body="Sign in to your account and try paying again." />;
  }
  if (!request.data) {
    return <PageSkeleton label="Opening payment" />;
  }
  const locale = localeFor(request.data.destinationCountryCode);
  const waiting = request.data.status === "QUOTED";
  return (
    <div className="flex flex-col gap-6">
      <h1 className="motion-rise text-h1">Practice payment</h1>
      <NotebookNote tone="yellow" tilt="none">
        Test mode. No card is charged. In a live market this step happens on the card provider&apos;s secure page.
      </NotebookNote>
      <ShoppingCard request={request.data} locale={locale} />
      <FormAlert message={errorMessage(pay.error)} />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.push("/account?tab=shopping")}>
          Go back
        </Button>
        <Button
          variant="yellow"
          size="lg"
          loading={pay.isPending}
          disabled={!waiting}
          onClick={() => pay.mutate(reference, { onSuccess: () => router.push(`/account?paid=${encodeURIComponent(reference)}`) })}
        >
          {waiting ? `Pay ${formatMoney(request.data.totalMinor, request.data.currency, locale)}` : "Already paid"}
        </Button>
      </div>
    </div>
  );
}
