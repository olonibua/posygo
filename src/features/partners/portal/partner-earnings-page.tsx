"use client";

import type { StatementRange } from "@/shared";
import { useState } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { localeFor } from "@/lib/format";

import { StatementPanel } from "../partner-parts";
import { usePartnerStatement } from "../use-partners";

export function PartnerEarningsPage() {
  const [range, setRange] = useState<StatementRange>({});
  const statement = usePartnerStatement(range);
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Partner"
        title="Earnings"
        lead="Your share of what vendors pay for receiving, storage, and pick and pack. Part of each earning is held for a while to cover claims, then released."
      />
      <StatementPanel statement={statement.data} range={range} onRange={setRange} locale={localeFor(statement.data?.currency === "USD" ? "US" : "GB")} loading={statement.isLoading} />
    </div>
  );
}
