"use client";

import Link from "next/link";

import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";
import { localeFor } from "@/lib/format";

import { ClaimFacts } from "./claim-details";
import { useClaims } from "./use-custody";

export function VendorClaimsPage() {
  const claims = useClaims("vendor");
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Protection"
        title="Claims"
        lead="If stock goes missing or arrives damaged while we or a partner hub hold it, we look into it and add a credit to your wallet when we're responsible. You can use it for any fees."
      />
      <p className="max-w-2xl text-small text-ink-soft">
        To report a problem, open the{" "}
        <Link href="/orders" className="font-medium underline decoration-line-strong underline-offset-4">
          order
        </Link>{" "}
        or the{" "}
        <Link href="/inventory" className="font-medium underline decoration-line-strong underline-offset-4">
          stock
        </Link>{" "}
        it&apos;s about and choose Report a problem.
      </p>
      {claims.isLoading ? (
        <LoadingRows columns={2} />
      ) : (claims.data ?? []).length === 0 ? (
        <EmptyState title="No claims" body="Nothing has gone wrong with your stock." />
      ) : (
        <ul className="stagger grid gap-4 xl:grid-cols-2">
          {claims.data!.map((claim) => (
            <li key={claim.id} className="motion-rise">
              <Paper className="px-6 py-5">
                <ClaimFacts claim={claim} locale={localeFor(claim.countryCode)} />
              </Paper>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
