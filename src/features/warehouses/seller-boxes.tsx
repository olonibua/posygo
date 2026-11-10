"use client";

import { type BoxCounts, type HubRepackListView, monthlyCost, type RepackBoxesInput, type RepackCandidateView, STORAGE_TIERS, type StorageTier } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { PhotoCollector } from "@/features/receiving/photo-collector";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";
import { apiRequest } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

const LOCALE = "en-GB";
const BOX_TIERS = STORAGE_TIERS.filter((tier) => tier !== "PALLET");

function summary(vendor: RepackCandidateView): string {
  return vendor.boxes.map((group) => `${group.count} ${STORAGE_TIER_LABELS[group.tier].label.toLowerCase()}`).join(", ");
}

export function SellerBoxes({ warehouseId, canRepack }: { warehouseId: string; canRepack: boolean }) {
  const key = ["warehouse", warehouseId, "boxes"];
  const boxes = useQuery({ queryKey: key, queryFn: () => apiRequest<HubRepackListView>(`/v1/warehouse/warehouses/${warehouseId}/boxes`) });
  const [open, setOpen] = useState<string | null>(null);
  const data = boxes.data;
  if (!data || data.vendors.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="seller-boxes-heading" className="flex flex-col gap-3">
      <h2 id="seller-boxes-heading" className="text-h3">
        Boxes by seller
      </h2>
      <p className="max-w-[720px] text-small text-ink-soft">
        Sellers pay for every box each month. When their stock has gone down, repack it into fewer or smaller boxes and take a photo. Empty boxes stop being charged on their own.
      </p>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {data.vendors.map((vendor) => (
          <Paper key={vendor.vendorId} className="px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Stamp>{vendor.businessName}</Stamp>
                <p className="mt-2 text-small">{summary(vendor)}</p>
                <p className="text-meta text-ink-faint">
                  {vendor.unitsStored} of {vendor.unitsAtArrival} units left · {formatMoney(vendor.monthlyMinor, data.currency, LOCALE)} a month
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {vendor.worthRepacking ? <StatusPill tone="yellow">Worth repacking</StatusPill> : null}
                {canRepack ? (
                  <Button variant="ghost" aria-expanded={open === vendor.vendorId} onClick={() => setOpen(open === vendor.vendorId ? null : vendor.vendorId)}>
                    Repack
                  </Button>
                ) : null}
              </div>
            </div>
            {open === vendor.vendorId ? (
              <RepackForm warehouseId={warehouseId} vendor={vendor} currency={data.currency} monthly={data.monthlyRates} queryKey={key} onDone={() => setOpen(null)} />
            ) : null}
          </Paper>
        ))}
      </div>
    </section>
  );
}

interface RepackFormProps {
  warehouseId: string;
  vendor: RepackCandidateView;
  currency: string;
  monthly: Record<StorageTier, number | null>;
  queryKey: string[];
  onDone: () => void;
}

function RepackForm({ warehouseId, vendor, currency, monthly, queryKey, onDone }: RepackFormProps) {
  const queryClient = useQueryClient();
  const [counts, setCounts] = useState<Record<StorageTier, string>>(() => Object.fromEntries(STORAGE_TIERS.map((tier) => [tier, ""])) as Record<StorageTier, string>);
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const repack = useMutation({
    mutationFn: (input: RepackBoxesInput) => apiRequest<HubRepackListView>(`/v1/warehouse/warehouses/${warehouseId}/boxes/repack`, { method: "POST", body: input }),
    onSuccess: (next) => {
      queryClient.setQueryData(queryKey, next);
      toast.success("Repacked", `${vendor.businessName} has been told what changed.`);
      onDone();
    },
  });
  const boxCounts: BoxCounts = Object.fromEntries(BOX_TIERS.map((tier) => [tier, Number(counts[tier] || 0)]).filter(([, count]) => Number(count) > 0));
  const knownRates = BOX_TIERS.every((tier) => (boxCounts[tier] ?? 0) === 0 || monthly[tier] !== null);

  function submit(event: FormEvent) {
    event.preventDefault();
    repack.mutate({ vendorId: vendor.vendorId, boxCounts, photoFileIds: photos, note: note.trim() || undefined });
  }

  return (
    <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4 border-t border-line pt-4">
      <FormAlert message={formError(repack.error)} />
      <p className="text-small">How many boxes does the stock fit in now?</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BOX_TIERS.map((tier) => (
          <Field key={tier} label={STORAGE_TIER_LABELS[tier].label} hint={STORAGE_TIER_LABELS[tier].hint}>
            {({ id, describedBy }) => (
              <Input id={id} type="number" min={0} max={500} aria-describedby={describedBy} value={counts[tier]} onChange={(event) => setCounts({ ...counts, [tier]: event.target.value })} />
            )}
          </Field>
        ))}
      </div>
      {fieldError(repack.error, "boxCounts") ? (
        <p role="alert" className="text-meta text-danger">
          {fieldError(repack.error, "boxCounts")}
        </p>
      ) : null}
      {knownRates && Object.keys(boxCounts).length > 0 ? (
        <p className="text-meta text-ink-faint">
          New monthly storage: {formatMoney(monthlyCost(boxCounts, monthly), currency, LOCALE)} (now {formatMoney(vendor.monthlyMinor, currency, LOCALE)})
        </p>
      ) : null}
      <PhotoCollector label="Photo of the repacked boxes" hint="Show the boxes and their contents." max={5} error={fieldError(repack.error, "photoFileIds")} onChange={setPhotos} />
      <Field label="Note (optional)">
        {({ id }) => <Textarea id={id} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} className="min-h-[70px]" />}
      </Field>
      <Button type="submit" variant="yellow" loading={repack.isPending} disabled={photos.length === 0}>
        Save repack
      </Button>
    </form>
  );
}
