"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { FeaturePanel } from "@/components/ui/surfaces";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, localeFor } from "@/lib/format";

import { useMyReferrals } from "./use-referrals";

export function VendorReferralsPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const referrals = useMyReferrals();
  const [copied, setCopied] = useState(false);
  const data = referrals.data;
  if (!data) {
    return referrals.isError ? <p className="text-ink-soft">{"We couldn't load your referral code. Try again shortly."}</p> : <PageSkeleton />;
  }
  const money = (amount: number) => formatMoney(amount, data.currency, locale);
  const link = `${window.location.origin}/signup?ref=${encodeURIComponent(data.code)}`;
  function copy() {
    void navigator.clipboard.writeText(link).then(() => setCopied(true));
  }
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Settings"
        title="Refer a business"
        lead={`Know another seller who'd like us to hold and ship their stock? When they join with your code and their first stock arrives at a hub, you get ${money(data.referrerCreditMinor)} and they get ${money(data.refereeCreditMinor)}, both as wallet credit.`}
      />
      <FeaturePanel
        tone="lime"
        stamp="Your code"
        title={<span className="font-mono">{data.code}</span>}
        action={
          <Button variant="primary" onClick={copy}>
            {copied ? "Link copied" : "Copy invite link"}
          </Button>
        }
      >
        <p className="mt-2 break-all text-small">{link}</p>
      </FeaturePanel>
      <StatTileGrid>
        <StatTile label="Joined with your code" value={String(data.joined)} tone="sky" />
        <StatTile label="Up and running" value={String(data.rewarded)} tone="yellow" />
        <StatTile label="Credit earned" value={money(data.earnedMinor)} tone="lime" />
      </StatTileGrid>
      <p className="max-w-2xl text-small text-ink-soft">Credits can be used for any fees. Referrals only count within your own market, and a business can only be referred once.</p>
    </div>
  );
}
