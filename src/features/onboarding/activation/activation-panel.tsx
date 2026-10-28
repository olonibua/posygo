"use client";

import { hasPermission, type VendorActivationView } from "@/shared";
import { useSearchParams } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { ActivationPayButton } from "./activation-pay-button";
import { useActivation } from "./use-activation";

export function ActivationPanel() {
  const user = useCurrentUser();
  const params = useSearchParams();
  const returning = params.get("activation");
  const cancelled = params.get("cancelled") === "1";
  const activation = useActivation({ watching: Boolean(returning) && !cancelled });
  const view = activation.data;
  if (!view) {
    return null;
  }
  const returnNote = returning ? <ReturnNote view={view} paymentId={returning} cancelled={cancelled} /> : null;
  if (view.state !== "DUE" || view.feeMinor === null) {
    return returnNote;
  }
  const fee = formatMoney(view.feeMinor, view.currency, localeFor(user.countryCode));
  const canPay = hasPermission(user.role, "vendor.verification.manage");
  return (
    <section aria-labelledby="activation-heading" className="flex max-w-[720px] flex-col gap-3">
      {returnNote}
      <Paper className="px-6 py-6">
        <Stamp>Last step</Stamp>
        <h2 id="activation-heading" className="mb-1 mt-1.5 text-[22px] font-medium tracking-[-0.5px]">
          Activate your account
        </h2>
        <p className="text-small text-ink-soft">
          You&apos;re verified and the agreement is accepted. Pay the one-off activation fee of {fee} and your account goes live straight away. The activation fee isn&apos;t refundable.
        </p>
        <div className="mt-5">{canPay ? <ActivationPayButton fee={fee} /> : <p className="text-small text-ink-soft">Only the account owner can pay the activation fee.</p>}</div>
      </Paper>
    </section>
  );
}

function ReturnNote({ view, paymentId, cancelled }: { view: VendorActivationView; paymentId: string; cancelled: boolean }) {
  if (view.state === "LIVE") {
    return (
      <NotebookNote tone="lime" tilt="none" className="max-w-[720px]">
        <p className="text-small">Thanks, your activation fee is paid and your account is live.</p>
        <ButtonLink href="/overview" variant="ghost" className="mt-3">
          Open your dashboard →
        </ButtonLink>
      </NotebookNote>
    );
  }
  if (cancelled) {
    return (
      <NotebookNote tone="pink" tilt="none" className="max-w-[720px]">
        The payment was cancelled and nothing was charged.
      </NotebookNote>
    );
  }
  const waiting = view.payment?.id === paymentId && view.payment.status === "PENDING";
  return (
    <NotebookNote tone={waiting ? "yellow" : "pink"} tilt="none" className="max-w-[720px]">
      {waiting ? "Thanks. We're confirming your payment. This page updates on its own." : "We couldn't take the payment. Nothing was charged, so you can try again."}
    </NotebookNote>
  );
}
