"use client";

import { hasPermission, RETURN_RULES, type VendorReturnStatus, type VendorReturnView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { PhotoCollector } from "@/features/receiving/photo-collector";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { localeFor } from "@/lib/format";

import { ReturnCard } from "./return-card";
import { useCompleteReturn, useReceiveReturn, useReturns } from "./use-returns";

const FILTERS: ReadonlyArray<{ value: VendorReturnStatus; label: string }> = [
  { value: "REQUESTED", label: "Expected" },
  { value: "RECEIVED", label: "Waiting for the vendor" },
  { value: "INSTRUCTED", label: "Ready to finish" },
  { value: "COMPLETED", label: "Done" },
];

function ReceiveForm({ entry }: { entry: VendorReturnView }) {
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const receive = useReceiveReturn(entry.id);
  const counted = entry.lines.every((line) => counts[line.id] !== undefined && counts[line.id] !== "");
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      <p className="text-small font-medium">Count what&apos;s in the parcel without looking at what was expected, then photograph it.</p>
      <FormAlert message={formError(receive.error)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {entry.lines.map((line) => (
          <Field key={line.id} label={`${line.productName} counted`} error={fieldError(receive.error, `lines.${line.id}`)}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value={counts[line.id] ?? ""}
                onChange={(event) => setCounts({ ...counts, [line.id]: event.target.value.replace(/\D/g, "").slice(0, 4) })}
              />
            )}
          </Field>
        ))}
      </div>
      <Field label="Condition notes (optional)" error={fieldError(receive.error, "notes")}>
        {({ id }) => <Textarea id={id} className="min-h-[72px]" maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} />}
      </Field>
      <PhotoCollector label="Photo of what arrived" hint="The open parcel and the items in it." max={RETURN_RULES.maxPhotos} error={fieldError(receive.error, "photoFileIds")} onChange={setPhotos} />
      <div className="flex justify-end">
        <Button
          variant="yellow"
          loading={receive.isPending}
          disabled={!counted || photos.length === 0}
          onClick={() =>
            receive.mutate({ lines: entry.lines.map((line) => ({ lineId: line.id, receivedQuantity: Number(counts[line.id]) || 0 })), notes: notes.trim() || undefined, photoFileIds: photos })
          }
        >
          Record what arrived
        </Button>
      </div>
    </div>
  );
}

function FinishForm({ entry }: { entry: VendorReturnView }) {
  const complete = useCompleteReturn(entry.id);
  const restock = entry.lines.reduce((total, line) => total + line.restockQuantity, 0);
  const away = entry.lines.reduce((total, line) => total + line.disposeQuantity + line.donateQuantity, 0);
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <p className="text-small">
        {restock > 0 ? `Put ${restock} back on the shelf as sellable stock. ` : ""}
        {away > 0 ? `Dispose of or donate ${away} as shown above.` : ""}
      </p>
      <FormAlert message={formError(complete.error)} />
      <div className="flex justify-end">
        <Button variant="lime" loading={complete.isPending} onClick={() => complete.mutate(undefined)}>
          Done, finish the return
        </Button>
      </div>
    </div>
  );
}

export function WarehouseReturnsPage() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<VendorReturnStatus>("REQUESTED");
  const returns = useReturns("warehouse", filter);
  const canReceive = hasPermission(user.role, "inbound.receive");
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Operations" title="Returns" lead="Parcels customers send back. Match the return reference on the parcel, count and photograph it, then follow the vendor's instructions." />
      <FilterTabs label="Filter returns" options={FILTERS} value={filter} onChange={setFilter} />
      {returns.isLoading ? (
        <LoadingRows columns={2} />
      ) : (returns.data ?? []).length === 0 ? (
        <EmptyState title="Nothing here" body="Returns vendors open for orders your warehouse shipped appear here." />
      ) : (
        <ul className="stagger flex flex-col gap-4">
          {returns.data!.map((entry) => (
            <li key={entry.id}>
              <ReturnCard entry={entry} side="warehouse" locale={localeFor(user.countryCode)}>
                {canReceive && entry.status === "REQUESTED" ? <ReceiveForm entry={entry} /> : null}
                {canReceive && entry.status === "INSTRUCTED" ? <FinishForm entry={entry} /> : null}
              </ReturnCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
