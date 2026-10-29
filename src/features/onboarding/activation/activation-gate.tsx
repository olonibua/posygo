"use client";

import { hasPermission, type VendorActivationView } from "@/shared";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { CheckMark } from "@/components/ui/check-mark";
import { Stamp } from "@/components/ui/surfaces";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { ActivationPayButton } from "./activation-pay-button";
import { useActivation } from "./use-activation";

const SANDBOX_CHECKOUT = "/verification/sandbox-checkout";
const UNLOCKS = ["Add your products", "Send stock to be stored", "Take orders and get paid"];

type Return = "none" | "confirming" | "cancelled" | "failed";

function returnOf(view: VendorActivationView, paymentId: string | null, cancelled: boolean): Return {
  if (!paymentId) {
    return "none";
  }
  if (cancelled) {
    return "cancelled";
  }
  return view.payment?.id === paymentId && view.payment.status === "PENDING" ? "confirming" : "failed";
}

const RETURN_NOTES: Record<Exclude<Return, "none" | "confirming">, string> = {
  cancelled: "The payment was cancelled and nothing was charged.",
  failed: "We couldn't take the payment. Nothing was charged, so you can try again.",
};

export function ActivationGate() {
  const pathname = usePathname();
  const params = useSearchParams();
  const paymentId = params.get("activation");
  const cancelled = params.get("cancelled") === "1";
  const activation = useActivation({ watching: Boolean(paymentId) && !cancelled });
  const [mounted, setMounted] = useState(false);
  const view = activation.data;
  const open = pathname !== SANDBOX_CHECKOUT && view?.state === "DUE" && view.feeMinor !== null;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted || !open || !view || view.feeMinor === null) {
    return null;
  }
  return createPortal(<ActivationDialog view={view} feeMinor={view.feeMinor} returned={returnOf(view, paymentId, cancelled)} />, document.body);
}

function ActivationDialog({ view, feeMinor, returned }: { view: VendorActivationView; feeMinor: number; returned: Return }) {
  const user = useCurrentUser();
  const { signOut } = useAuth();
  const fee = formatMoney(feeMinor, view.currency, localeFor(user.countryCode));
  const canPay = hasPermission(user.role, "vendor.verification.manage");

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-[#0b1630]/60 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="activation-heading">
      <div className="motion-pop w-full max-w-[460px] rounded-[18px] bg-white shadow-[0_30px_80px_-20px_#0b163080]">
        <div className="px-6 pb-6 pt-7 sm:px-8">
          <div className="flex items-center gap-2.5">
            <img src="/brand/flower-mark.svg" alt="" className="h-7 w-7" />
            <Stamp>Last step</Stamp>
          </div>
          <h2 id="activation-heading" className="mt-4 text-[24px] font-semibold tracking-[-0.5px]">
            Activate your account
          </h2>
          <p className="mt-1.5 text-small text-ink-soft">You&apos;re verified and your agreements are signed. Pay the one-off activation fee to open your account.</p>

          <div className="mt-5 flex items-baseline justify-between rounded-card bg-paper-sunk px-5 py-4">
            <span className="text-small font-medium">Activation fee</span>
            <span className="text-[26px] font-semibold tabular-nums tracking-[-0.5px]">{fee}</span>
          </div>
          <p className="mt-2 text-[12px] text-ink-faint">Paid once. Not refundable.</p>

          <ul className="mt-5 flex flex-col gap-2.5">
            {UNLOCKS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-small">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-lime">
                  <CheckMark className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {returned === "confirming" ? (
            <p role="status" className="mt-6 rounded-card bg-paper-sunk px-4 py-3 text-small">
              Thanks. We&apos;re confirming your payment. This updates on its own.
            </p>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              {returned === "none" ? null : (
                <p role="status" className="rounded-card bg-paper-sunk px-4 py-3 text-small">
                  {RETURN_NOTES[returned]}
                </p>
              )}
              {canPay ? <ActivationPayButton fee={fee} block autoFocus /> : <p className="text-small text-ink-soft">Only the account owner can pay the activation fee.</p>}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-line px-6 py-4 text-[13px] text-ink-faint sm:px-8">
          <span>Secure card payment</span>
          <button type="button" onClick={() => void signOut()} className="font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
