"use client";

import { useState } from "react";

import { Field, Input } from "@/components/ui/form-controls";

import { tierForBox, type Millimetres } from "./box-guide-data";
import { STORAGE_TIER_LABELS } from "./display";

const SIDES = ["Length", "Width", "Height"] as const;

export function BoxMeasure() {
  const [sides, setSides] = useState(["", "", ""]);
  const values = sides.map((side) => Number(side));
  const complete = values.every((value) => Number.isFinite(value) && value > 0);
  const tier = complete ? tierForBox(values.map((value) => value * 10) as Millimetres) : null;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line px-4 py-4">
      <p className="text-small font-medium">Which size is my box?</p>
      <div className="grid grid-cols-3 gap-3">
        {SIDES.map((side, index) => (
          <Field key={side} label={`${side} (cm)`}>
            {({ id }) => (
              <Input
                id={id}
                type="number"
                min={1}
                max={300}
                inputMode="decimal"
                value={sides[index]}
                onChange={(event) => setSides((current) => current.map((value, position) => (position === index ? event.target.value : value)))}
              />
            )}
          </Field>
        ))}
      </div>
      <p className="text-small text-ink-soft" aria-live="polite">
        {!complete
          ? "Measure the outside of the box. It doesn't matter which side you call length."
          : tier
            ? `This box counts as ${STORAGE_TIER_LABELS[tier].label}.`
            : "This box is bigger than Extra large. Send it on a pallet or use smaller boxes."}
      </p>
    </div>
  );
}
