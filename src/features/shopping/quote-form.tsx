"use client";

import type { ShoppingQuoteInput, ShoppingRequestView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Input, Select } from "@/components/ui/form-controls";
import { toMajorText, toMinor } from "@/features/finance/money-input";
import { usePackaging } from "@/features/fulfilment/use-fulfilment";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { useWarehouses } from "@/features/warehouses/use-warehouses";

import { useQuoteShopping } from "./use-shopping";

interface LineDraft {
  available: boolean;
  price: string;
  weight: string;
  hsCode: string;
  note: string;
}

function draftFor(request: ShoppingRequestView): Record<string, LineDraft> {
  return Object.fromEntries(
    request.lines.map((line) => [
      line.id,
      {
        available: line.status !== "UNAVAILABLE",
        price: line.unitPriceMinor === null ? "" : toMajorText(line.unitPriceMinor, request.currency),
        weight: line.unitWeightGrams === null ? "" : String(line.unitWeightGrams),
        hsCode: line.hsCode ?? "",
        note: line.staffNote ?? "",
      },
    ]),
  );
}

function toInput(request: ShoppingRequestView, warehouseId: string, packagingPresetId: string, lines: Record<string, LineDraft>): ShoppingQuoteInput {
  return {
    warehouseId,
    packagingPresetId,
    lines: request.lines.map((line) => {
      const draft = lines[line.id]!;
      const note = draft.note.trim() || undefined;
      if (!draft.available) {
        return { lineId: line.id, available: false, staffNote: note };
      }
      return {
        lineId: line.id,
        available: true,
        unitPriceMinor: toMinor(draft.price, request.currency) ?? undefined,
        unitWeightGrams: Number(draft.weight) || undefined,
        hsCode: draft.hsCode.trim() || undefined,
        staffNote: note,
      };
    }),
  };
}

export function QuoteForm({ request }: { request: ShoppingRequestView }) {
  const warehouses = useWarehouses();
  const boxes = usePackaging(request.countryCode);
  const quote = useQuoteShopping(request.id);
  const inCountry = (warehouses.data ?? []).filter((warehouse) => warehouse.countryCode === request.countryCode && warehouse.active);
  const [warehouseId, setWarehouseId] = useState("");
  const [boxId, setBoxId] = useState("");
  const [lines, setLines] = useState(() => draftFor(request));
  const chosenWarehouse = warehouseId || inCountry[0]?.id || "";
  const chosenBox = boxId || boxes.data?.[0]?.id || "";
  const set = (lineId: string, patch: Partial<LineDraft>) => setLines({ ...lines, [lineId]: { ...lines[lineId]!, ...patch } });
  const crossesBorder = request.destinationCountryCode !== request.countryCode;

  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      <p className="text-small font-medium">Check each link, then give the shop price and weight of one item. We add our fee and delivery.</p>
      <FormAlert message={formError(quote.error)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Deliver to warehouse" error={fieldError(quote.error, "warehouseId")}>
          {({ id }) => (
            <Select id={id} value={chosenWarehouse} onChange={(event) => setWarehouseId(event.target.value)}>
              {inCountry.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Box to send it in" error={fieldError(quote.error, "packagingPresetId")}>
          {({ id }) => (
            <Select id={id} value={chosenBox} onChange={(event) => setBoxId(event.target.value)}>
              {(boxes.data ?? []).map((box) => (
                <option key={box.id} value={box.id}>
                  {box.label} ({box.lengthMm}×{box.widthMm}×{box.heightMm} mm)
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <ul className="flex flex-col gap-3">
        {request.lines.map((line) => {
          const draft = lines[line.id]!;
          return (
            <li key={line.id} className="flex flex-col gap-3 rounded-[12px] border border-line p-4">
              <Checkbox label={`${line.quantity} × ${line.description}: we can get this`} checked={draft.available} onChange={(event) => set(line.id, { available: event.target.checked })} />
              {draft.available ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Shop price for one" error={fieldError(quote.error, `lines.${line.id}`)}>
                    {({ id }) => <Input id={id} inputMode="decimal" value={draft.price} onChange={(event) => set(line.id, { price: event.target.value })} />}
                  </Field>
                  <Field label="Weight of one (grams)">
                    {({ id }) => <Input id={id} inputMode="numeric" value={draft.weight} onChange={(event) => set(line.id, { weight: event.target.value.replace(/\D/g, "").slice(0, 5) })} />}
                  </Field>
                  <Field label={crossesBorder ? "Customs code" : "Customs code (optional)"}>
                    {({ id }) => <Input id={id} inputMode="numeric" maxLength={10} value={draft.hsCode} onChange={(event) => set(line.id, { hsCode: event.target.value.replace(/\D/g, "") })} />}
                  </Field>
                </div>
              ) : null}
              <Field label="Note for the buyer (optional)">{({ id }) => <Input id={id} maxLength={300} value={draft.note} onChange={(event) => set(line.id, { note: event.target.value })} />}</Field>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end">
        <Button variant="yellow" loading={quote.isPending} disabled={!chosenWarehouse || !chosenBox} onClick={() => quote.mutate(toInput(request, chosenWarehouse, chosenBox, lines))}>
          {request.status === "REQUESTED" ? "Send the price" : "Send a new price"}
        </Button>
      </div>
    </div>
  );
}
