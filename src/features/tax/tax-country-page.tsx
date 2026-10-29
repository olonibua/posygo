"use client";

import { useState } from "react";

import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper } from "@/components/ui/surfaces";
import { errorMessage } from "@/features/receiving/api-errors";

import { AddObligationForm } from "./add-obligation-form";
import { ObligationCard } from "./obligation-card";
import { useTaxChange, useTaxCountry } from "./tax-api";
import { ThresholdCard } from "./threshold-card";

export function TaxCountryPage({ code }: { code: string }) {
  const country = useTaxCountry(code);
  const [adding, setAdding] = useState(false);
  const checklist = useTaxChange<object>(() => ({ path: `/v1/admin/tax/countries/${code}/checklist`, method: "POST" }));
  const data = country.data;
  const empty = data?.obligations.length === 0;

  return (
    <div className="flex flex-col gap-7">
      <BackLink href="/admin/tax">Tax & compliance</BackLink>
      <PageHeader
        stamp="Tax & compliance"
        title={data?.countryName ?? code}
        lead="Each filing, who it goes to and when it's due."
        action={
          adding || empty ? null : (
            <Button variant="ghost" onClick={() => setAdding(true)}>
              Add an obligation
            </Button>
          )
        }
      />
      <FormAlert message={errorMessage(country.error) ?? errorMessage(checklist.error)} />
      {data?.threshold ? (
        <div className="max-w-[520px]">
          <ThresholdCard threshold={data.threshold} />
        </div>
      ) : null}
      {adding ? <AddObligationForm countryCode={code} onClose={() => setAdding(false)} /> : null}
      {empty && !adding ? (
        <Paper className="flex flex-col items-start gap-3 px-6 py-6">
          <h2 className="text-h3">Nothing here yet</h2>
          <p className="max-w-[560px] text-small text-ink-soft">
            {code === "GB" ? "Start with the usual UK filings, then set each due date." : "Start with a checklist to go through with your tax adviser."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="yellow" loading={checklist.isPending} onClick={() => checklist.mutate({})}>
              Add starter checklist
            </Button>
            <Button variant="ghost" onClick={() => setAdding(true)}>
              Add your own
            </Button>
          </div>
        </Paper>
      ) : null}
      <div className="flex flex-col gap-4">
        {(data?.obligations ?? []).map((obligation) => (
          <ObligationCard key={obligation.id} obligation={obligation} />
        ))}
      </div>
    </div>
  );
}
