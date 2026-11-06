"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { usePortalMutation } from "../use-partners";

export function useProviderReturn() {
  const params = useSearchParams();
  const identity = usePortalMutation(() => ({ path: "/v1/partner/identity/refresh" }));
  const payouts = usePortalMutation(() => ({ path: "/v1/partner/payouts/refresh" }));
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) {
      return;
    }
    handled.current = true;
    if (params.get("identity") === "returned") {
      identity.mutate(undefined);
    }
    if (params.get("payouts") === "returned") {
      payouts.mutate(undefined);
    }
  }, [params, identity, payouts]);
}
