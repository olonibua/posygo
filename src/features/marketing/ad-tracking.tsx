"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { type AdConsent, readAdConsent, saveAdConsent } from "@/lib/analytics/ad-consent";
import { loadMetaPixel, META_PIXEL_ID, trackPixel } from "@/lib/analytics/meta-pixel";

export function AdTracking() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<AdConsent | null | undefined>(undefined);

  useEffect(() => setConsent(readAdConsent()), []);

  useEffect(() => {
    if (consent !== "granted") return;
    loadMetaPixel();
    trackPixel("PageView");
  }, [consent, pathname]);

  if (!META_PIXEL_ID || consent !== null) return null;

  function choose(choice: AdConsent) {
    saveAdConsent(choice);
    setConsent(choice);
  }

  return (
    <div
      role="region"
      aria-label="Cookie choice"
      className="motion-rise fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-card bg-ink px-4 py-3 text-meta text-on-ink shadow-peek sm:inset-x-auto sm:left-5 sm:max-w-[460px]"
    >
      <p className="flex-1">
        We use a Meta cookie to see which ads bring sellers to us.{" "}
        <Link href="/legal/privacy" className="text-on-ink underline">
          Privacy
        </Link>
      </p>
      <Button variant="yellow" className="px-3 py-2 text-meta" onClick={() => choose("granted")}>
        Accept
      </Button>
      <button type="button" className="text-meta text-on-ink underline" onClick={() => choose("declined")}>
        No thanks
      </button>
    </div>
  );
}
